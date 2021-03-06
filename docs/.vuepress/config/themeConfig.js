const nav = require('./themeConfig/nav.js')
const htmlModules = require('./themeConfig/htmlModules.js')

// 主题配置
module.exports = {
  nav,
  sidebarDepth: 2, // 侧边栏显示深度，默认1，最大2（显示到h3标题）
  logo: '/img/logo.png', // 导航栏logo
  searchMaxSuggestions: 10, // 搜索结果显示最大数
  lastUpdated: '上次更新', // 开启更新时间，并配置前缀文字   string | boolean (取值为git提交时间)
  docsDir: 'docs', // 编辑的文件夹
  editLinks: true, // 启用编辑
  editLinkText: '编辑',

  sidebar: 'structuring', // 侧边栏  'structuring' | { mode: 'structuring', collapsable: Boolean} | 'auto' | 自定义    温馨提示：目录页数据依赖于结构化的侧边栏数据，如果你不设置为'structuring',将无法使用目录页

  author: {
    // 文章默认的作者信息，可在md文件中单独配置此信息 String | {name: String, link: String}
    name: 'Kisama', // 必需
    link: 'https://github.com/noah19846' // 可选的
  },
  blogger: {
    // 博主信息，显示在首页侧边栏
    avatar: 'https://avatars.githubusercontent.com/u/62412453?v=4',
    name: 'Kisama',
    slogan: '参差多态乃幸福本源。'
  },
  social: {
    icons: [
      {
        iconClass: 'icon-youjian',
        title: '发邮件',
        link: 'mailto:yelqgd@gmail.com'
      },
      {
        iconClass: 'icon-github',
        title: 'GitHub',
        link: 'https://github.com/noah19846'
      },
      {
        iconClass: 'icon-jianshu',
        title: '简书',
        link: 'https://www.jianshu.com/u/1718782838b1'
      },
      {
        iconClass: 'icon-juejin',
        title: '掘金',
        link: 'https://juejin.cn/user/4019470241131853/posts'
      }
    ]
  },
  footer: {
    // 页脚信息
    createYear: 2020, // 博客创建年份
    copyrightInfo:
      '| <a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2020021065号-1</a>' // 博客版权信息，支持a标签
  },
  htmlModules // 插入hmtl(广告)模块
}
