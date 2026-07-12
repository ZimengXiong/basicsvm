/* A small, source-driven Verilog interpreter for introductory synchronous designs.
 * It intentionally implements a documented synthesizable subset rather than guessing
 * a demo from signal names. Values are BigInts so wide counters remain exact. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.VerilogSimulator = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  function tokenize(source) {
    source = source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
    const out = [];
    const re = /\s+|(?:\d[\d_]*)?'[bBoOdDhH][0-9a-fA-F_xXzZ]+|\d[\d_]*|[A-Za-z_$][\w$]*|==|!=|<=|>=|&&|\|\||<<|>>|[(){}\[\],;:@#=+\-*\/<>&|^~!?]/gy;
    let at = 0;
    while (at < source.length) {
      re.lastIndex = at;
      const m = re.exec(source);
      if (!m) throw new Error(`Unexpected character ${JSON.stringify(source[at])}`);
      at = re.lastIndex;
      if (!/^\s+$/.test(m[0])) out.push(m[0]);
    }
    return out;
  }

  function literal(text) {
    const m = text.match(/^(?:(\d[\d_]*)?)'([bBoOdDhH])([0-9a-fA-F_xXzZ]+)$/);
    if (!m) return { type: 'num', value: BigInt(text.replaceAll('_', '')), width: null };
    const base = { b: 2, o: 8, d: 10, h: 16 }[m[2].toLowerCase()];
    const digits = m[3].replaceAll('_', '').replace(/[xXzZ]/g, '0');
    const prefix = { 2: '0b', 8: '0o', 10: '', 16: '0x' }[base];
    return { type: 'num', value: BigInt(prefix + digits), width: m[1] ? Number(m[1].replaceAll('_', '')) : null };
  }

  class Parser {
    constructor(source) { this.t = tokenize(source); this.i = 0; this.widths = {}; this.inputs = []; this.outputs = []; this.initial = {}; this.params = {}; this.always = []; this.assigns = []; }
    peek(n = 0) { return this.t[this.i + n]; }
    take(want) { const got = this.t[this.i++]; if (want && got !== want) throw new Error(`Expected ${want}, found ${got || 'end of input'}`); return got; }
    is(word) { return this.peek() === word; }
    width() { if (!this.is('[')) return 1; this.take('['); const hi = Number(this.take().replaceAll('_', '')); this.take(':'); const lo = Number(this.take().replaceAll('_', '')); this.take(']'); return Math.abs(hi - lo) + 1; }
    declaration(kind, terminator) {
      this.take(kind);
      if (this.is('wire') || this.is('reg') || this.is('logic')) this.take();
      const width = this.width();
      for (;;) {
        const name = this.take();
        if (!/^[A-Za-z_$]/.test(name)) throw new Error(`Expected signal name, found ${name}`);
        this.widths[name] = width;
        if (kind === 'input') this.inputs.push(name);
        if (kind === 'output') this.outputs.push(name);
        if (this.is('=')) { this.take(); this.initial[name] = this.expr(); }
        if (this.is(terminator)) { if (terminator !== ')') this.take(); break; }
        this.take(',');
        // ANSI port lists can switch declaration kind after a comma.
        if (terminator === ')' && ['input', 'output', 'inout'].includes(this.peek())) break;
      }
    }
    expr(min = 0) {
      let left;
      if (this.is('{')) {
        this.take(); const items = [];
        do { items.push(this.expr()); if (!this.is(',')) break; this.take(); } while (true);
        this.take('}'); left = { type: 'concat', items };
      } else if (this.is('(')) { this.take(); left = this.expr(); this.take(')'); }
      else if (['!', '~', '-'].includes(this.peek())) { const op = this.take(); left = { type: 'unary', op, value: this.expr(8) }; }
      else { const tok = this.take(); left = /^\d|^'/.test(tok) ? literal(tok) : { type: 'ref', name: tok }; }
      while (this.is('[')) {
        this.take(); const hi = this.expr(); let lo = null;
        if (this.is(':')) { this.take(); lo = this.expr(); }
        this.take(']'); left = { type: 'select', value: left, hi, lo };
      }
      const prec = { '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5, '==': 6, '!=': 6, '<': 7, '>': 7, '<=': 7, '>=': 7, '<<': 8, '>>': 8, '+': 9, '-': 9, '*': 10, '/': 10 };
      while ((prec[this.peek()] || 0) > min) {
        const op = this.take(), p = prec[op];
        left = { type: 'binary', op, left, right: this.expr(p) };
      }
      return left;
    }
    lvalue() {
      if (this.is('{')) {
        this.take(); const items = [];
        do { items.push(this.lvalue()); if (!this.is(',')) break; this.take(); } while (true);
        this.take('}'); return { type: 'concat', items };
      }
      let left = { type: 'ref', name: this.take() };
      if (this.is('[')) {
        this.take(); const hi = this.expr(); let lo = null;
        if (this.is(':')) { this.take(); lo = this.expr(); }
        this.take(']'); left = { type: 'select', value: left, hi, lo };
      }
      return left;
    }
    statement() {
      if (this.is('begin')) { this.take(); const body = []; while (!this.is('end')) body.push(this.statement()); this.take('end'); return { type: 'block', body }; }
      if (this.is('if')) {
        this.take(); this.take('('); const cond = this.expr(); this.take(')'); const yes = this.statement();
        let no = null; if (this.is('else')) { this.take(); no = this.statement(); }
        return { type: 'if', cond, yes, no };
      }
      const lhs = this.lvalue();
      const op = this.take();
      if (op !== '<=' && op !== '=') throw new Error(`Expected assignment, found ${op}`);
      const rhs = this.expr(); this.take(';');
      return { type: op === '<=' ? 'nb' : 'blocking', lhs, rhs };
    }
    parse() {
      this.take('module'); this.name = this.take();
      this.take('(');
      while (!this.is(')')) {
        if (!['input', 'output', 'inout'].includes(this.peek())) throw new Error(`Expected port declaration, found ${this.peek()}`);
        this.declaration(this.peek(), ')');
      }
      this.take(')'); this.take(';');
      while (!this.is('endmodule')) {
        if (['input', 'output', 'inout'].includes(this.peek())) this.declaration(this.peek(), ';');
        else if (this.is('reg') || this.is('wire') || this.is('logic')) this.declaration(this.peek(), ';');
        else if (this.is('localparam') || this.is('parameter')) {
          this.take(); if (this.is('reg') || this.is('wire') || this.is('logic')) this.take();
          const width = this.width(), name = this.take(); this.take('='); const value = this.expr(); this.take(';'); this.widths[name] = width; this.params[name] = value;
        } else if (this.is('assign')) {
          this.take(); const lhs = this.lvalue(); this.take('='); const rhs = this.expr(); this.take(';'); this.assigns.push({ lhs, rhs });
        } else if (this.is('always')) {
          this.take(); this.take('@'); this.take('('); if (this.is('posedge')) this.take(); else throw new Error('Only posedge always blocks are supported');
          const clock = this.take(); this.take(')'); this.always.push({ clock, stmt: this.statement() });
        } else throw new Error(`Unsupported construct ${this.peek() || 'at end of input'}`);
      }
      this.take('endmodule'); return this;
    }
  }

  const mask = width => width > 0 ? (1n << BigInt(width)) - 1n : 0n;
  class Simulator {
    constructor(source) {
      this.design = new Parser(source).parse(); this.state = {}; this.inputs = {}; this.edges = 0n;
      Object.keys(this.design.widths).forEach(n => { this.state[n] = 0n; });
      for (const [n, expr] of Object.entries(this.design.params)) this.state[n] = this.eval(expr);
      for (const [n, expr] of Object.entries(this.design.initial)) this.write({ type: 'ref', name: n }, this.eval(expr), this.state);
      this.refresh();
    }
    widthOf(expr) {
      if (expr.type === 'ref') return this.design.widths[expr.name] || 1;
      if (expr.type === 'num') return expr.width || Math.max(1, expr.value.toString(2).length);
      if (expr.type === 'select') return expr.lo ? Number(this.eval(expr.hi) - this.eval(expr.lo) + 1n) : 1;
      if (expr.type === 'concat') return expr.items.reduce((n, x) => n + this.widthOf(x), 0);
      return Math.max(this.widthOf(expr.left || expr.value), expr.right ? this.widthOf(expr.right) : 1);
    }
    eval(e, state = this.state) {
      if (!e) return 0n;
      if (e.type === 'num') return e.value;
      if (e.type === 'ref') return Object.hasOwn(this.inputs, e.name) ? this.inputs[e.name] : (state[e.name] || 0n);
      if (e.type === 'unary') { const v = this.eval(e.value, state); return e.op === '!' ? (v ? 0n : 1n) : e.op === '~' ? (~v & mask(this.widthOf(e.value))) : -v; }
      if (e.type === 'select') { const v = this.eval(e.value, state), lo = e.lo ? this.eval(e.lo, state) : this.eval(e.hi, state), hi = this.eval(e.hi, state); return (v >> lo) & mask(Number(hi - lo + 1n)); }
      if (e.type === 'concat') return e.items.reduce((v, x) => (v << BigInt(this.widthOf(x))) | (this.eval(x, state) & mask(this.widthOf(x))), 0n);
      const a = this.eval(e.left, state), b = this.eval(e.right, state);
      return ({ '+':()=>a+b, '-':()=>a-b, '*':()=>a*b, '/':()=>b?a/b:0n, '<<':()=>a<<b, '>>':()=>a>>b, '&':()=>a&b, '|':()=>a|b, '^':()=>a^b,
        '==':()=>a===b?1n:0n, '!=':()=>a!==b?1n:0n, '<':()=>a<b?1n:0n, '>':()=>a>b?1n:0n, '<=':()=>a<=b?1n:0n, '>=':()=>a>=b?1n:0n,
        '&&':()=>a&&b?1n:0n, '||':()=>a||b?1n:0n })[e.op]();
    }
    write(lhs, value, target) {
      if (lhs.type === 'ref') { const w = this.design.widths[lhs.name] || 1; target[lhs.name] = value & mask(w); return; }
      if (lhs.type === 'select' && lhs.value.type === 'ref') {
        const name = lhs.value.name, lo = lhs.lo ? this.eval(lhs.lo) : this.eval(lhs.hi), hi = this.eval(lhs.hi), w = Number(hi-lo+1n), m = mask(w) << lo;
        target[name] = ((target[name] || 0n) & ~m) | ((value & mask(w)) << lo); return;
      }
      if (lhs.type === 'concat') {
        let shift = 0n;
        for (let i = lhs.items.length - 1; i >= 0; i--) { const item = lhs.items[i], w = this.widthOf(item); this.write(item, (value >> shift) & mask(w), target); shift += BigInt(w); }
        return;
      }
      throw new Error('Unsupported assignment target');
    }
    roots(lhs) {
      if (lhs.type === 'ref') return [lhs.name];
      if (lhs.type === 'select') return this.roots(lhs.value);
      if (lhs.type === 'concat') return lhs.items.flatMap(x => this.roots(x));
      return [];
    }
    execute(stmt, proc, active, nba = active, scheduled = null) {
      if (stmt.type === 'block') { stmt.body.forEach(s => this.execute(s, proc, active, nba, scheduled)); return; }
      if (stmt.type === 'if') { this.execute(this.eval(stmt.cond, proc) ? stmt.yes : stmt.no || { type:'block', body:[] }, proc, active, nba, scheduled); return; }
      if (stmt.type === 'nb') {
        if (scheduled) for (const name of this.roots(stmt.lhs)) {
          if (!scheduled.has(name)) nba[name] = proc[name] || 0n;
          scheduled.add(name);
        }
        this.write(stmt.lhs, this.eval(stmt.rhs, proc), nba); return;
      }
      if (stmt.type === 'blocking') {
        const value = this.eval(stmt.rhs, proc);
        this.write(stmt.lhs, value, proc);
        this.write(stmt.lhs, value, active);
      }
    }
    step() {
      const old = { ...this.state }, active = { ...this.state }, nba = {}, scheduled = new Set();
      // Each clocked process reads the same pre-edge state. Blocking assignments
      // are visible to later statements in that process; nonblocking writes land
      // together after the active region.
      this.design.always.forEach(a => this.execute(a.stmt, { ...old }, active, nba, scheduled));
      for (const name of scheduled) active[name] = nba[name];
      this.state = active; this.edges++; this.refresh();
    }
    // Fast path for the ubiquitous synchronous counter form. It remains source-driven:
    // the optimization is derived from the AST and falls back to exact edge stepping.
    simpleIncrement(stmt) {
      const body = stmt.type === 'block' ? stmt.body : [stmt];
      const inc = body.filter(s => s.type === 'nb' && s.lhs.type === 'ref' && s.rhs.type === 'binary' && s.rhs.left.type === 'ref' && s.rhs.left.name === s.lhs.name && ['+','-'].includes(s.rhs.op));
      return inc.length === 1 && body.every(s => s.type === 'nb') ? { body, inc: inc[0], name: inc[0].lhs.name } : null;
    }
    bulkStraight(stmt, count) {
      const info = this.simpleIncrement(stmt); if (!info) return false;
      const delta = this.eval(info.inc.rhs.right) * (info.inc.rhs.op === '+' ? 1n : -1n), old = { ...this.state };
      // Other NB assignments on the last edge see the state immediately before it.
      old[info.name] = (old[info.name] + delta * (count - 1n)) & mask(this.design.widths[info.name]);
      const next = { ...old }; this.execute(stmt, old, next);
      this.state = next; return true;
    }
    conditionalCounter(stmt, count) {
      const top = stmt.type === 'block' && stmt.body.length === 1 ? stmt.body[0] : stmt;
      if (top.type !== 'if' || !top.no || top.cond.type !== 'binary' || top.cond.op !== '==' || top.cond.left.type !== 'ref') return false;
      const name = top.cond.left.name, inc = this.simpleIncrement(top.no);
      if (!inc || inc.name !== name) return false;
      const delta = this.eval(inc.inc.rhs.right) * (inc.inc.rhs.op === '+' ? 1n : -1n); if (delta !== 1n) return false;
      let left = count;
      while (left > 0n) {
        if (this.eval(top.cond)) { const old={...this.state}, next={...this.state}; this.execute(top.yes,old,next); this.state=next; left--; continue; }
        const target = this.eval(top.cond.right), current = this.state[name], width = this.design.widths[name], modulus = 1n << BigInt(width);
        let distance = (target - current + modulus) % modulus; if (distance === 0n) distance = modulus;
        const take = distance < left ? distance : left;
        if (!this.bulkStraight(top.no, take)) return false;
        left -= take;
      }
      return true;
    }
    advanceEdges(count) {
      count = BigInt(Math.max(0, Math.floor(Number(count)))); if (!count) return;
      // A combinational module has no per-edge sequential work. Inputs and
      // continuous assignments are already settled by setInput()/refresh().
      if (this.design.always.length === 0) {
        this.edges += count;
        this.refresh();
        return;
      }
      if (this.design.always.length === 1 && (this.conditionalCounter(this.design.always[0].stmt, count) || this.bulkStraight(this.design.always[0].stmt, count))) {
        this.edges += count; this.refresh(); return;
      }
      if (count > 100000n) throw new Error('This design needs edge-by-edge simulation; reduce simulation speed');
      while (count-- > 0n) this.step();
    }
    refresh() {
      // Settle combinational chains regardless of declaration order.
      const passes = Math.max(1, this.design.assigns.length + 1);
      for (let pass = 0; pass < passes; pass++) {
        let changed = false;
        for (const a of this.design.assigns) {
          const before = this.roots(a.lhs).map(n => this.state[n] || 0n);
          this.write(a.lhs, this.eval(a.rhs), this.state);
          if (this.roots(a.lhs).some((n, i) => (this.state[n] || 0n) !== before[i])) changed = true;
        }
        if (!changed) break;
      }
    }
    setInput(name, value) { this.inputs[name] = BigInt(value); this.refresh(); }
    get(name) { return this.state[name] || 0n; }
    output(names) { for (const n of names) if (this.design.outputs.includes(n) || Object.hasOwn(this.state,n)) return this.get(n); return 0n; }
  }
  return { Simulator, Parser, tokenize };
});
