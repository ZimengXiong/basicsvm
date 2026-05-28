export default {
  title: 'bASICs VM',
  description: 'Static documentation for the bASICs VM open silicon desktop environment.',
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }]
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
      { text: 'Build', link: '/build/' },
      { text: 'Help', link: '/help/' },
      { text: 'Reference', link: '/reference/tools' }
    ],
    sidebar: [
      {
        text: 'Home',
        items: [
          { text: 'Overview', link: '/' }
        ]
      },
      {
        text: 'Start',
        items: [
          { text: 'Start Here', link: '/start/' },
          { text: 'macOS Apple Silicon', link: '/install/mac-apple-silicon' },
          { text: 'macOS Intel', link: '/install/mac-intel' },
          { text: 'Windows x86', link: '/install/windows-x86' },
          { text: 'Windows ARM', link: '/install/windows-arm' },
          { text: 'Linux x86', link: '/install/linux-x86' },
          { text: 'First Boot', link: '/start/first-boot' }
        ]
      },
      {
        text: 'Use',
        items: [
          { text: 'VM Basics', link: '/use/' },
          { text: 'First Flow', link: '/use/first-flow' },
          { text: 'Find Results', link: '/use/results' },
          { text: 'Examples and Work', link: '/using/examples-templates-work' }
        ]
      },
      {
        text: 'Build',
        items: [
          { text: 'Build from Source', link: '/build/' },
          { text: 'Local Nix Usage', link: '/build/local-nix' },
          { text: 'Work on the Docs', link: '/build/docs' }
        ]
      },
      {
        text: 'Help',
        items: [
          { text: 'VM Troubleshooting', link: '/help/' },
          { text: 'OpenLane Troubleshooting', link: '/help/openlane' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Reference', link: '/reference/tools' },
          { text: 'PDK Locations', link: '/using/pdk-locations' },
          { text: 'VM Filesystem Layout', link: '/using/filesystem-layout' },
          { text: 'Check Environment', link: '/advanced/check-environment' }
        ]
      }
    ],
    footer: {
      message: 'Built from the bASICs VM repository.',
      copyright: 'Static docs for public hosting and offline VM bundling.'
    }
  }
};
