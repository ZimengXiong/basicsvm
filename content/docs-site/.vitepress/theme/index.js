import DefaultTheme from 'vitepress/theme'
import { inBrowser } from 'vitepress'
import VideoPlayer from './VideoPlayer.vue'
import './custom.css'
import './style.css'

let mermaid
let renderCount = 0

async function renderMermaidDiagrams() {
  if (!inBrowser) return

  mermaid ||= (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default'
  })

  const blocks = document.querySelectorAll('div.language-mermaid')
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
      router.onAfterRouteChanged = () => {
        setTimeout(renderMermaidDiagrams, 0)
      }
      setTimeout(renderMermaidDiagrams, 0)
    }
  }
}
