import DefaultTheme from 'vitepress/theme'
import VideoPlayer from './VideoPlayer.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('VideoPlayer', VideoPlayer)
  }
}
