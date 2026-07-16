export default {
  title: 'bASICs VM',
  description: 'FPGA and ASIC development environment documentation.',
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
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
            text: '1.4',
            items: [
              { text: '1.4 stable — Latest', link: '/install/version-1-4' },
              { text: 'Migrate to 1.4', link: '/install/migrate-to-1-4' }
            ]
          },
          {
            text: '1.3 — Legacy',
            items: [
              { text: '1.3 stable', link: '/install/version-1-3' },
              { text: 'Migrate to 1.3', link: '/install/migrate-to-1-3' }
            ]
          },
          {
            text: '1.2 — Legacy',
            items: [
              { text: '1.2 stable', link: '/install/version-1-2' },
              { text: 'Migrate to 1.2', link: '/install/migrate-to-1-2' }
            ]
          },
          {
            text: '1.1 — Legacy',
            items: [
              { text: '1.1 stable', link: '/install/version-1-1' },
              { text: 'Migrate to 1.1', link: '/install/migrate-to-1-1' }
            ]
          },
          {
            text: '1.0 — Legacy',
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
          {
            text: 'Enable Folder Sharing',
            link: '/misc/enable-folder-sharing',
            items: [
              { text: 'UTM', link: '/misc/enable-folder-sharing#utm' },
              { text: 'VirtualBox', link: '/misc/enable-folder-sharing#virtualbox' }
            ]
          },
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
    footer: {
      message: 'Run into an issue? <a href="https://github.com/ZimengXiong/basicsvm/issues/new">Report it on GitHub</a>.',
      copyright: 'Static docs for public hosting and offline VM bundling.'
    }
  }
};
