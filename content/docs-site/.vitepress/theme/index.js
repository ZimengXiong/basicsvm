import DefaultTheme from 'vitepress/theme'
import { inBrowser } from 'vitepress'
import { h } from 'vue'
import UxSwitcher from './UxSwitcher.vue'
import VersionPicker from './VersionPicker.vue'
import MobileNav from './MobileNav.vue'
import SidebarTrigger from './SidebarTrigger.vue'
import QuestionnaireLink from './QuestionnaireLink.vue'
import VideoPlayer from './VideoPlayer.vue'
import './custom.css'
import './style.css'

let mermaid
let renderCount = 0

function runWhenIdle(fn) {
  if (!inBrowser) return
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fn, { timeout: 600 })
  } else {
    window.setTimeout(fn, 0)
  }
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
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(UxSwitcher),
      'sidebar-nav-before': () => h(MobileNav),
      'sidebar-nav-after': () => h(VersionPicker),
      'nav-bar-content-after': () => h(SidebarTrigger)
    })
  },
  enhanceApp({ app, router }) {
    app.component('QuestionnaireLink', QuestionnaireLink)
    app.component('VideoPlayer', VideoPlayer)
    if (inBrowser) {
      router.onAfterRouteChanged = () => runWhenIdle(renderMermaidDiagrams)
      runWhenIdle(renderMermaidDiagrams)
    }
  }
}
