export default {
  title: 'bASICs VM',
  description: 'Static documentation for the bASICs VM open silicon desktop environment.',
  cleanUrls: true,
  vite: {
    build: {
      minify: false
    }
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'bASICs VM',
    nav: [
      { text: 'Start', link: '/' },
      { text: 'Install', link: '/install/mac-apple-silicon' },
      { text: 'Use the VM', link: '/getting-started' },
      { text: 'Reference', link: '/reference/tools' }
    ],
    sidebar: [
      {
        text: 'Start',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Getting Started', link: '/getting-started' }
        ]
      },
      {
        text: 'Install',
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
        text: 'Use the Environment',
        items: [
          { text: 'Examples, Templates, Work', link: '/using/examples-templates-work' },
          { text: 'PDK Locations', link: '/using/pdk-locations' },
          { text: 'VM Filesystem Layout', link: '/using/filesystem-layout' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Tools Inventory', link: '/reference/tools' },
          { text: 'Reproduce the VM', link: '/advanced/reproduce-vm' },
          { text: 'Bare Nix Usage', link: '/advanced/bare-nix' }
        ]
      }
    ],
    footer: {
      message: 'Built from the bASICs VM repository.',
      copyright: 'Static docs for public hosting and offline VM bundling.'
    }
  }
};
