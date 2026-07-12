export default {
  title: 'Start Here - bASICs VM',
  description: 'Start Here - bASICs VM',
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
    ['meta', { property: 'og:title', content: 'Start Here - bASICs VM' }],
    ['meta', { property: 'og:description', content: 'Start Here - bASICs VM' }],
    ['meta', { property: 'og:image', content: 'https://basics.alpacawebservices.com/images/desktop-auto-login.webp' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Start Here - bASICs VM' }],
    ['meta', { name: 'twitter:description', content: 'Start Here - bASICs VM' }],
    ['meta', { name: 'twitter:image', content: 'https://basics.alpacawebservices.com/images/desktop-auto-login.webp' }]
  ],
  vite: {
    build: {
      minify: false
    }
  },
  themeConfig: {
    logo: '/logo.webp',
    siteTitle: 'bASICs VM',
    nav: [
      { text: 'Start', link: '/' },
      { text: 'Use', link: '/use/' },
      { text: 'Simulator', link: '/simulator' },
      { text: 'Releases', link: '/release/' },
      { text: 'Advanced', link: '/build/' },
      { text: 'GitHub', link: 'https://github.com/ZimengXiong/basicsvm' },
      { text: 'Report Issue', link: 'https://github.com/ZimengXiong/basicsvm/issues/new' }
    ],
    sidebar: [
      {
        text: 'Start',
        items: [
          { text: 'Start Here', link: '/' },
          {
            text: 'Choose your operating system',
            collapsed: true,
            items: [
              { text: 'macOS Apple Silicon', link: '/install/mac-apple-silicon' },
              { text: 'macOS Intel', link: '/install/mac-intel' },
              { text: 'Windows x86', link: '/install/windows-x86' },
              { text: 'Windows ARM', link: '/install/windows-arm' },
              { text: 'Linux x86', link: '/install/linux-x86' },
              { text: 'Linux ARM', link: '/install/linux-arm' }
            ]
          },
          {
            text: 'First boot',
            items: [
              { text: 'First Boot', link: '/start/first-boot' },
              { text: 'VM Basics', link: '/use/' }
            ]
          }
        ]
      },
      {
        text: 'Versions',
        items: [
          { text: 'All versions', link: '/install/versions' },
          {
            text: '1.1',
            items: [
              { text: '1.1 stable — Latest', link: '/install/version-1-1' },
              { text: 'Migrate to 1.1', link: '/install/migrate-to-1-1' }
            ]
          },
          {
            text: '1.0',
            items: [
              { text: '1.0 stable', link: '/install/version-1-0' }
            ]
          }
        ]
      },
      {
        text: 'Examples',
        items: [
          {
            text: 'OpenLane',
            items: [
              { text: 'First Counter Flow', link: '/use/first-flow' },
              { text: 'Adder From Scratch', link: '/use/adder-from-scratch' }
            ]
          },
          {
            text: 'Nandland Go Board',
            items: [
              { text: 'Your First Go Board Project', link: '/use/go-board-basics' }
            ]
          }
        ]
      },
      {
        text: 'Miscellaneous',
        items: [
          {
            text: 'Connecting USB devices',
            link: '/install/connecting-usb-devices',
            items: [
              { text: 'UTM', link: '/install/connecting-usb-devices#utm' },
              { text: 'VirtualBox', link: '/install/connecting-usb-devices#virtualbox' }
            ]
          },
          { text: 'Install APIO', link: '/install/apio' }
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'Build from Source', link: '/build/' },
          { text: 'Local Nix Usage', link: '/build/local-nix' },
          { text: 'Work on the Docs', link: '/build/docs' }
        ]
      }
    ],
    footer: {
      message: 'Run into an issue? <a href="https://github.com/ZimengXiong/basicsvm/issues/new">Report it on GitHub</a>.',
      copyright: 'Static docs for public hosting and offline VM bundling.'
    }
  }
};
