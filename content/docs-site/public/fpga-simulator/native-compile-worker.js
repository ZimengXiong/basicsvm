import {runYosys} from './vendor/yowasp/yosys/bundle.js';
import {runClang} from './vendor/yowasp/clang/bundle.js';

const decoder=new TextDecoder();
const isClockName=name=>/^(i_)?clk$|clock/i.test(name);
let instance=null,ports=[],clock=null,isVga=false,isRgb=false,running=false,paused=false,speed=1,timer=null,frameNumber=0,epoch=0,framesDone=0,clockHz=25e6,cyclesPerFrame=420000;const MAX_CATCHUP=3;

function clean(source){return source.replace(/[\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g,' ').replace(/[\u200b-\u200d\ufeff]/g,'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"')}
function topInfo(source){
  const mods=[...source.matchAll(/\bmodule\s+([A-Za-z_$][\w$]*)\s*\(/g)];if(!mods.length)throw new Error('No ANSI-style top module found');const hit=mods[mods.length-1],top=hit[1];let i=hit.index+hit[0].length,depth=1,header='';for(;i<source.length&&depth;i++){const c=source[i];if(c==='(')depth++;if(c===')')depth--;if(depth)header+=c}const parts=[];let cur='',br=0;for(const c of header){if(c==='['||c==='('||c==='{')br++;if(c===']'||c===')'||c==='}')br--;if(c===','&&br===0){parts.push(cur);cur=''}else cur+=c}if(cur.trim())parts.push(cur);let dir=null,bits=1;const parsed=[];for(let p of parts){const dm=p.match(/\b(input|output|inout)\b/);if(dm)dir=dm[1];const wm=p.match(/\[\s*(\d+)\s*:\s*(\d+)\s*\]/);if(wm)bits=Math.abs(+wm[1]-+wm[2])+1;else if(dm)bits=1;p=p.replace(/\b(input|output|inout|wire|reg|logic|signed|unsigned)\b/g,' ').replace(/\[[^\]]+\]/g,' ');const names=p.match(/[A-Za-z_$][\w$]*/g);if(names&&dir)parsed.push({name:names[names.length-1],dir,bits})}return{top,ports:parsed}
}
const cxxName=name=>'p_'+name.replaceAll('_','__').replaceAll('$','_24_');
function wrapper(info,modelSource='',hz=25e6){
  const top=cxxName(info.top),inputs=info.ports.filter(p=>p.dir==='input'),outputs=info.ports.filter(p=>p.dir==='output');clock=inputs.find(p=>isClockName(p.name))||null;const userInputs=inputs.filter(p=>p!==clock),find=re=>outputs.find(p=>re.test(p.name));const field=p=>`model->${cxxName(p.name)}`;
  const color=(letter,names)=>{const packed=find(new RegExp(`(?:${names}|_${letter})$`,'i'));if(packed)return{bits:packed.bits,read:`${field(packed)}.get<unsigned>()`};const bits=[0,1,2].map(i=>find(new RegExp(`^VGA_${letter}${i}$`,'i')));return bits.every(Boolean)?{bits:3,read:bits.map((p,i)=>`(${field(p)}.get<unsigned>()<<${i})`).join('|')}:null};
  const red=color('R','Red'),green=color('G','Grn|Green'),blue=color('B','Blu|Blue'),hs=find(/HS(YNC)?$/i),vs=find(/VS(YNC)?$/i);isVga=!!(clock&&red&&green&&blue&&hs&&vs);const rgbPort=find(/^(ws2812|rgb_?led|neopixel|led_rgb)$/i);isRgb=!!(clock&&rgbPort&&(rgbPort.bits||1)===1);
  const setters=userInputs.map((p,i)=>`case ${i}: ${field(p)}.set(value); break;`).join('\n');
  const getters=outputs.map((p,i)=>`case ${i}: return ${field(p)}.get<unsigned>();`).join('\n');
  const fastEdge=clock&&modelSource.includes(`prev_${cxxName(clock.name)}`);
  const scan=(isVga?'vga_scan();':'')+(isRgb?'rgb_scan();':'');
  const tick=clock?(fastEdge?`model->prev_${cxxName(clock.name)}=value<1>{0u}; ${field(clock)}.set(1); model->step(); cycle_count++; per_cycle(); ${scan}`:`${field(clock)}.set(0); model->step(); ${field(clock)}.set(1); model->step(); cycle_count++; per_cycle(); ${scan}`):'model->step(); cycle_count++; per_cycle();';
  const rgbCode=isRgb?`
static unsigned rgb_level,rgb_high,rgb_low,rgb_shift,rgb_bits,rgb_color;
static inline void rgb_scan(){unsigned v=${isRgb?field(rgbPort):'0'}.get<unsigned>()&1u;
  if(v){rgb_high++;rgb_low=0;}
  else{if(rgb_level){rgb_shift=(rgb_shift<<1)|(rgb_high>${Math.round(0.6e-6*hz)}u?1u:0u);rgb_bits++;rgb_high=0;}
    rgb_low++;if(rgb_low==${Math.round(50e-6*hz)}u&&rgb_bits>=24u){rgb_color=rgb_shift&0xffffffu;rgb_bits=0;rgb_shift=0;}}
  rgb_level=v;}
extern "C" __attribute__((export_name("rgb_state"))) unsigned rgb_state(){return rgb_color;}
`:'';
  const vgaCode=isVga?`
static unsigned char frame[640*480*4];
static unsigned hs_last,vs_last,hcount,vcount,line,line_len,frame_lines,hs_seen,vs_seen;
static unsigned long long hs_t,line_start,vs_line,frame_start_line;
static inline void vga_scan(){
  unsigned hs=${field(hs)}.get<unsigned>(),vs=${field(vs)}.get<unsigned>();
  hcount++;
  if(hs!=hs_last){unsigned long long d=cycle_count-hs_t;hs_t=cycle_count;hs_last=hs;hs_seen++;if(d<400ull){line_len=(unsigned)(cycle_count-line_start);line_start=cycle_count;hcount=0;line++;vcount++;}}
  if(vs!=vs_last){unsigned long long dl=line-vs_line;vs_line=line;vs_last=vs;vs_seen++;if(dl<40ull){frame_lines=(unsigned)(line-frame_start_line);frame_start_line=line;vcount=0;}}
  int x=(int)hcount-48,y=(int)vcount-33;
  if(x>=0&&x<640&&y>=0&&y<480){unsigned char*p=frame+((unsigned)y*640u+(unsigned)x)*4u;p[0]=(${red.read})*255u/${(1<<red.bits)-1}u;p[1]=(${green.read})*255u/${(1<<green.bits)-1}u;p[2]=(${blue.read})*255u/${(1<<blue.bits)-1}u;p[3]=255u;}
}
extern "C" __attribute__((export_name("frame_ptr"))) unsigned frame_ptr(){return (unsigned)frame;}
extern "C" __attribute__((export_name("vga_stats"))) unsigned vga_stats(unsigned which){switch(which){case 0:return line_len;case 1:return frame_lines;case 2:{unsigned v=hs_seen;hs_seen=0;return v;}case 3:{unsigned v=vs_seen;vs_seen=0;return v;}default:return 0;}}
`:'';
  return `#include "model.cc"
#include <new>
using namespace cxxrtl_design;
alignas(${top}) static unsigned char storage[sizeof(${top})];
static ${top} *model;
#define NOUT ${outputs.length}
#define TRACE_MAX 16384
static unsigned long long cycle_count;
static unsigned trace_buf[TRACE_MAX*3];
static unsigned trace_len;
static unsigned trace_overflow;
static unsigned trace_on=1;
static unsigned prev_out[NOUT+1];
static unsigned duty_acc[NOUT+1];
static unsigned duty_cycles;
static inline unsigned read_out(unsigned index){switch(index){${getters}default:return 0;}}
static inline void per_cycle(){
  duty_cycles++;
  for(unsigned j=0;j<NOUT;j++){unsigned v=read_out(j);duty_acc[j]+=(v!=0u);
    if(trace_on&&v!=prev_out[j]){prev_out[j]=v;if(trace_len<TRACE_MAX){unsigned*e=trace_buf+trace_len*3;e[0]=(unsigned)cycle_count;e[1]=j;e[2]=v;trace_len++;}else trace_overflow=1;}}
}
${vgaCode}${rgbCode}
extern "C" __attribute__((export_name("reset"))) void sim_reset(){if(!model)model=new(storage) ${top}();else model->reset();${clock?`${field(clock)}.set(0);`:''}model->step();cycle_count=0;trace_len=0;trace_overflow=0;duty_cycles=0;for(unsigned j=0;j<NOUT;j++){prev_out[j]=~0u;duty_acc[j]=0;}${isVga?'hs_last=vs_last=hcount=vcount=line=line_len=frame_lines=hs_seen=vs_seen=0;hs_t=line_start=vs_line=frame_start_line=0;':''}per_cycle();}
extern "C" __attribute__((export_name("trace_ptr"))) unsigned trace_ptr_fn(){return (unsigned)trace_buf;}
extern "C" __attribute__((export_name("trace_len"))) unsigned trace_len_fn(){return trace_len;}
extern "C" __attribute__((export_name("trace_overflow"))) unsigned trace_overflow_fn(){return trace_overflow;}
extern "C" __attribute__((export_name("trace_reset"))) void trace_reset_fn(){trace_len=0;trace_overflow=0;}
extern "C" __attribute__((export_name("set_trace"))) void set_trace_fn(unsigned on){trace_on=on;if(on){for(unsigned j=0;j<NOUT;j++)prev_out[j]=~0u;}}
extern "C" __attribute__((export_name("duty_ptr"))) unsigned duty_ptr_fn(){return (unsigned)duty_acc;}
extern "C" __attribute__((export_name("duty_cycles"))) unsigned duty_cycles_fn(){return duty_cycles;}
extern "C" __attribute__((export_name("duty_reset"))) void duty_reset_fn(){duty_cycles=0;for(unsigned j=0;j<NOUT;j++)duty_acc[j]=0;}
extern "C" __attribute__((export_name("cycle_lo"))) unsigned cycle_lo_fn(){return (unsigned)cycle_count;}
extern "C" __attribute__((export_name("cycle_hi"))) unsigned cycle_hi_fn(){return (unsigned)(cycle_count>>32);}
extern "C" __attribute__((export_name("run_cycles"))) void run_cycles(unsigned count){for(unsigned i=0;i<count;i++){${tick}}}
extern "C" __attribute__((export_name("set_input"))) void set_input(unsigned index,unsigned value){switch(index){${setters}default:break;}}
extern "C" __attribute__((export_name("get_output"))) unsigned get_output(unsigned index){return read_out(index);}
`;
}
function streamLog(target){return bytes=>{if(bytes)target.push(typeof bytes==='string'?bytes:decoder.decode(bytes,{stream:true}))}}
let inputEvents=[];
function cycleNow(){return Number(instance.exports.cycle_hi())*4294967296+Number(instance.exports.cycle_lo())}
function takeTrace(){const len=Number(instance.exports.trace_len()),ptr=Number(instance.exports.trace_ptr()),trace=new Uint32Array(new Uint32Array(instance.exports.memory.buffer,ptr,len*3)),overflow=!!instance.exports.trace_overflow();instance.exports.trace_reset();const events=inputEvents;inputEvents=[];return {trace,overflow,cycle:cycleNow(),inputEvents:events}}
let outputPorts=[];
function outputsNow(){const result={};for(let i=0;i<outputPorts.length;i++)result[outputPorts[i].name]=Number(instance.exports.get_output(i));return result}
function takeDuty(){const n=Number(instance.exports.duty_cycles())||1,ptr=Number(instance.exports.duty_ptr()),acc=new Uint32Array(instance.exports.memory.buffer,ptr,outputPorts.length),duty=new Float32Array(outputPorts.length);for(let i=0;i<duty.length;i++)duty[i]=acc[i]/n;instance.exports.duty_reset();return duty}
const MODEL_CACHE='fpga-sim-models-v1';
async function modelKey(source,hz,flags){const data=new TextEncoder().encode(`${hz}\n${flags}\n${source}`);const digest=await crypto.subtle.digest('SHA-256',data);return '/models/'+[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function cacheGet(key){try{const c=await caches.open(MODEL_CACHE);const r=await c.match(key);if(!r)return null;const meta=JSON.parse(r.headers.get('x-model-meta')||'{}');return {wasm:await r.arrayBuffer(),meta}}catch{return null}}
async function cachePut(key,wasm,meta){const c=await caches.open(MODEL_CACHE);await c.put(key,new Response(wasm,{headers:{'content-type':'application/wasm','x-model-meta':JSON.stringify(meta)}}))}
function schedule(){clearTimeout(timer);if(!running)return;const period=cyclesPerFrame/clockHz*1000;const now=performance.now();if(!paused){let owed=Math.floor((now-epoch)/period)-framesDone;if(owed>MAX_CATCHUP){epoch+=(owed-MAX_CATCHUP)*period;owed=MAX_CATCHUP}if(owed>0){const steps=Math.max(1,Math.floor(speed));instance.exports.run_cycles(clock?cyclesPerFrame*steps*owed:owed);frameNumber+=steps*owed;framesDone+=owed;const outputs=outputsNow(),trace=takeTrace(),duty=takeDuty();if(isVga){const ptr=Number(instance.exports.frame_ptr()),copy=new Uint8ClampedArray(new Uint8Array(instance.exports.memory.buffer,ptr,640*480*4)),st=[0,1,2,3].map(i=>Number(instance.exports.vga_stats(i)));self.postMessage({type:'frame',frame:copy,frameNumber,outputs,duty,rgb:isRgb?Number(instance.exports.rgb_state()):undefined,vga:{lineCycles:st[0],frameLines:st[1],sync:st[2]>0&&st[3]>0},...trace},[copy.buffer,trace.trace.buffer,duty.buffer])}else self.postMessage({type:'sample',frameNumber,outputs,duty,rgb:isRgb?Number(instance.exports.rgb_state()):undefined,...trace},[trace.trace.buffer,duty.buffer])}}else{epoch=now-framesDone*period}const next=epoch+(framesDone+1)*period;timer=setTimeout(schedule,Math.max(0,next-performance.now()))}
async function compile(source,hz){clockHz=Number(hz)||25e6;cyclesPerFrame=clockHz===25e6?420000:Math.round(clockHz/60);
  running=false;clearTimeout(timer);inputEvents=[];source=clean(source);const info=topInfo(source);ports=info.ports;outputPorts=ports.filter(p=>p.dir==='output');clock=info.ports.find(p=>p.dir==='input'&&isClockName(p.name))||null;const yosysLog=[],clangLog=[];let lastProgress=0;
  const CLANG_FLAGS=['-O2','-DNDEBUG','-DCXXRTL_NDEBUG','-fno-exceptions','-fno-rtti','-fno-stack-protector','-nostartfiles','-Iinclude','wrapper.cc','-o','model.wasm','-Wl,--no-entry','-Wl,--export-memory'];
  const YOSYS_SCRIPT=`read_verilog -sv design.v; prep -top ${info.top} -flatten; opt_clean -purge; write_cxxrtl model.cc`;
  const cacheKey=await modelKey(source,clockHz,YOSYS_SCRIPT+CLANG_FLAGS.join(' '));
  const cached=await cacheGet(cacheKey);
  if(cached){self.postMessage({type:'progress',message:'Loading model'});isVga=cached.meta.isVga;isRgb=!!cached.meta.isRgb;const module=await WebAssembly.compile(cached.wasm),wasi={fd_close:()=>0,fd_seek:()=>0,fd_write:()=>0};instance=await WebAssembly.instantiate(module,{wasi_snapshot_preview1:wasi});instance.exports.reset();frameNumber=0;self.postMessage({type:'compiled',top:info.top,ports,isVga,modelBytes:cached.wasm.byteLength,log:cached.meta.log||'',cached:true});return}
  self.postMessage({type:'progress',message:'Loading Yosys WebAssembly…'});
  const yosysFiles=await runYosys(['-q','-p',YOSYS_SCRIPT],{'design.v':source},{stdout:streamLog(yosysLog),stderr:streamLog(yosysLog),fetchProgress:e=>{const pct=Math.floor(e.doneLength/e.totalLength*100);if(pct>=lastProgress+2){lastProgress=pct;self.postMessage({type:'progress',message:`Loading Yosys… ${pct}%`})}}});
  self.postMessage({type:'progress',message:'Yosys generated optimized CXXRTL.'});
  const [cxxrtl,capi]=await Promise.all([fetch('./vendor/cxxrtl/cxxrtl.h').then(r=>r.text()),fetch('./vendor/cxxrtl/capi/cxxrtl_capi.h').then(r=>r.text())]);
  const wrapperSource=wrapper(info,yosysFiles['model.cc'],clockHz);lastProgress=0;self.postMessage({type:'progress',message:'Compiling native WebAssembly model with Clang…'});
  const clangFiles=await runClang(['clang++',...CLANG_FLAGS],{'model.cc':yosysFiles['model.cc'],'wrapper.cc':wrapperSource,'include':{'cxxrtl':{'cxxrtl.h':cxxrtl,'capi':{'cxxrtl_capi.h':capi}}}},{stdout:streamLog(clangLog),stderr:streamLog(clangLog),fetchProgress:e=>{const pct=Math.floor(e.doneLength/e.totalLength*100);if(pct>=lastProgress+2){lastProgress=pct;self.postMessage({type:'progress',message:`Loading Clang… ${pct}%`})}}});
  const module=await WebAssembly.compile(clangFiles['model.wasm']),wasi={fd_close:()=>0,fd_seek:()=>0,fd_write:()=>0};instance=await WebAssembly.instantiate(module,{wasi_snapshot_preview1:wasi});instance.exports.reset();frameNumber=0;
  const log=[...yosysLog,...clangLog].join('');cachePut(cacheKey,clangFiles['model.wasm'],{isVga,isRgb,log}).catch(()=>{});
  self.postMessage({type:'compiled',top:info.top,ports,isVga,modelBytes:clangFiles['model.wasm'].byteLength,log});
}
self.onmessage=async event=>{const data=event.data;try{if(data.type==='compile')await compile(data.source,data.clockHz);else if(data.type==='start'){running=true;paused=false;epoch=performance.now();framesDone=0;schedule()}else if(data.type==='trace'){instance?.exports.set_trace(data.value?1:0)}else if(data.type==='stop'){running=false;clearTimeout(timer)}else if(data.type==='pause')paused=!!data.value;else if(data.type==='speed')speed=Number(data.value)||1;else if(data.type==='reset'){instance?.exports.reset();frameNumber=0;inputEvents=[];epoch=performance.now();framesDone=0;paused=false;if(running)schedule()}else if(data.type==='input'){if(instance){instance.exports.set_input(data.index,data.value);inputEvents.push([cycleNow(),data.index,data.value])}}}catch(error){self.postMessage({type:'error',message:error instanceof Error?error.message:String(error)})}};
