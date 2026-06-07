import DefaultTheme from 'vitepress/theme'
import { inBrowser } from 'vitepress'
import VideoPlayer from './VideoPlayer.vue'
import './custom.css'
import './style.css'

let mermaid
let renderCount = 0
const prefetchedPages = new Set()
const prefetchQueue = []
let activePrefetches = 0
const maxActivePrefetches = 2

function runWhenIdle(fn) {
  if (!inBrowser) return
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fn, { timeout: 600 })
  } else {
    window.setTimeout(fn, 0)
  }
}

function routePathToPageFile(pathname) {
  if (!inBrowser || !window.__VP_HASH_MAP__) return null

  let pagePath = decodeURIComponent(pathname.replace(/\.html$/, ''))
  pagePath = pagePath.replace(/\/$/, '/index')
  pagePath = pagePath.replace(/^\//, '').replace(/\//g, '_') || 'index'
  pagePath = `${pagePath}.md`

  let pageHash = window.__VP_HASH_MAP__[pagePath.toLowerCase()]
  if (!pageHash) {
    pagePath = pagePath.endsWith('_index.md')
      ? `${pagePath.slice(0, -9)}.md`
      : `${pagePath.slice(0, -3)}_index.md`
    pageHash = window.__VP_HASH_MAP__[pagePath.toLowerCase()]
  }

  return pageHash ? `/assets/${pagePath}.${pageHash}.js` : null
}

function enqueuePagePrefetch(href) {
  if (!inBrowser || !href) return

  let url
  try {
    url = new URL(href, window.location.href)
  } catch {
    return
  }

  if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return

  const pageFile = routePathToPageFile(url.pathname)
  if (!pageFile || prefetchedPages.has(pageFile) || prefetchQueue.includes(pageFile)) return

  prefetchQueue.push(pageFile)
  runPrefetchQueue()
}

function runPrefetchQueue() {
  if (!inBrowser) return

  while (activePrefetches < maxActivePrefetches && prefetchQueue.length) {
    const pageFile = prefetchQueue.shift()
    activePrefetches++
    prefetchedPages.add(pageFile)

    import(/* @vite-ignore */ pageFile)
      .catch(() => {
        prefetchedPages.delete(pageFile)
      })
      .finally(() => {
        activePrefetches--
        runPrefetchQueue()
      })
  }
}

function installLinkPrefetching() {
  if (!inBrowser) return

  let lastPointer = null
  let pointerPredictionQueued = false

  const prefetchFromEvent = (event) => {
    const link = event.target.closest?.('a[href]')
    if (link) enqueuePagePrefetch(link.href)
  }

  const prefetchPredictedPointerTarget = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return

    const now = performance.now()
    if (lastPointer && !pointerPredictionQueued) {
      const previousPointer = lastPointer
      const currentPointer = { x: event.clientX, y: event.clientY, time: now }
      pointerPredictionQueued = true
      window.requestAnimationFrame(() => {
        pointerPredictionQueued = false
        const dt = Math.max(currentPointer.time - previousPointer.time, 16)
        const vx = (currentPointer.x - previousPointer.x) / dt
        const vy = (currentPointer.y - previousPointer.y) / dt
        const predictedX = currentPointer.x + vx * 120
        const predictedY = currentPointer.y + vy * 120
        const target = document.elementFromPoint(predictedX, predictedY)
        const link = target?.closest?.('a[href]')
        if (link) enqueuePagePrefetch(link.href)
      })
    }

    lastPointer = { x: event.clientX, y: event.clientY, time: now }
  }

  document.addEventListener('pointerover', prefetchFromEvent, true)
  document.addEventListener('pointermove', prefetchPredictedPointerTarget, { passive: true })
  document.addEventListener('focusin', prefetchFromEvent, true)
  document.addEventListener('touchstart', prefetchFromEvent, { passive: true, capture: true })

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) enqueuePagePrefetch(entry.target.href)
        }
      }, { rootMargin: '160px' })
    : null

  const observeVisibleLinks = () => {
    if (!observer) return
    document.querySelectorAll('.VPNav a[href], .VPSidebar a[href], .VPDoc a[href]').forEach((link) => {
      if (!link.dataset.prefetchObserved) {
        link.dataset.prefetchObserved = 'true'
        observer.observe(link)
      }
    })
  }

  runWhenIdle(observeVisibleLinks)
  window.addEventListener('popstate', () => runWhenIdle(observeVisibleLinks))
  return observeVisibleLinks
}

async function renderMermaidDiagrams() {
  if (!inBrowser) return

  const blocks = document.querySelectorAll('div.language-mermaid')
  if (!blocks.length) return

  mermaid ||= (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default'
  })

  for (const block of blocks) {
    const code = block.querySelector('code')?.textContent?.trim()
    if (!code) continue

    const id = `mermaid-${Date.now()}-${renderCount++}`
    try {
      const { svg } = await mermaid.render(id, code)
      const diagram = document.createElement('div')
      diagram.className = 'mermaid-diagram'
      diagram.innerHTML = svg
      block.replaceWith(diagram)
    } catch (error) {
      block.classList.add('mermaid-error')
      console.error('Failed to render Mermaid diagram', error)
    }
  }
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    app.component('VideoPlayer', VideoPlayer)
    if (inBrowser) {
      const observeVisibleLinks = installLinkPrefetching()
      router.onAfterRouteChanged = () => {
        runWhenIdle(renderMermaidDiagrams)
        runWhenIdle(() => observeVisibleLinks?.())
      }
      runWhenIdle(renderMermaidDiagrams)
      runWhenIdle(() => observeVisibleLinks?.())
    }
  }
}
