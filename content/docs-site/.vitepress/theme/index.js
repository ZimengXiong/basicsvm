import DefaultTheme from 'vitepress/theme'
import VideoPlayer from './VideoPlayer.vue'
import './custom.css'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('VideoPlayer', VideoPlayer)
  }
}
