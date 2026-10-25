export default {
  title: 'bASICs VM',
  description: 'FPGA and ASIC development environment documentation.',
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
    ['script', {}, `(function(){try{var v=localStorage.getItem('basicsvm-ux');document.documentElement.dataset.ux=/^[1-5]$/.test(v)?v:'1'}catch(e){document.documentElement.dataset.ux='1'}})()`],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],
  transformHead({ pageData }) {
    const isHome = pageData.relativePath === 'index.md';
    const pageName = pageData.title || 'bASICs VM';
    const title = isHome ? 'Start Here - bASICs VM' : `${pageName} - bASICs VM`;
    const description = isHome
      ? 'Choose the bASICs VM download for your operating system and hardware.'
      : `Read ${pageName} in the bASICs VM documentation.`;
    const image = isHome
      ? 'https://basics.alpacawebservices.com/images/desktop-auto-login.webp'
      : `https://basics.alpacawebservices.com/og/${pageData.relativePath.replace(/\.md$/, '.png')}`;

    return [
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:image', content: image }],
      ['meta', { property: 'og:image:alt', content: title }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: image }]
    ];
  },
  vite: {
    build: {
      minify: false
    },
    optimizeDeps: {
      include: ['mermaid']
    },
    server: {
      warmup: {
        clientFiles: ['./.vitepress/theme/**/*.vue', './.vitepress/theme/index.js']
      }
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
            text: 'Install',
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
          { text: 'First Boot', link: '/start/first-boot' },
          { text: 'VM Basics', link: '/use/' }
        ]
      },
      {
        text: 'Learn',
        items: [
          { text: 'Go Board Simulator', link: '/simulator' },
          { text: 'Your First Go Board Project', link: '/use/go-board-basics' },
          { text: 'First Counter Flow', link: '/use/first-flow' },
          { text: 'Adder From Scratch', link: '/use/adder-from-scratch' }
        ]
      },
      {
        text: 'Guides',
        items: [
          { text: 'Connecting USB Devices', link: '/install/connecting-usb-devices' },
          { text: 'Folder Sharing', link: '/misc/enable-folder-sharing' },
          { text: 'Install APIO', link: '/install/apio' },
          { text: 'VSCodium Desktop Shortcut', link: '/misc/vscodium-desktop-shortcut' }
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
    outline: { level: [2, 3] }
  }
};
