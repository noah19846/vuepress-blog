---
title: vite 项目中 debug vue3.x 源码
date: 2022-03-26 10:22:06
permalink: /pages/f02836/
sidebar: auto
categories:
  - Vue
tags:
  - Vue3.x
---
之前在 vue-cli 创建的项目中调试 Vue2.x 源码时，只修改 package.json 中 module 字段对应的文件内容，对应的改动就会在浏览器刷新后体现出来，但这在由 vite 创建的 vue3.x 的项目中却行不通，原因有三：

- vue3.x 是一个 monorepo，源码被分成了好几部分
- vite 的 pre-bundle 机制
- vite 设置的浏览器缓存机制

后面两个好解决，只需分别将创建 viteServer 的 `server.force` 设置为 `true`（即将 package.json 里 scripts 中 `"dev": "vite"` 改为 `"dev": "vite --forece"`） 和浏览器控制台 network 栏激活 _Disable cache_ 即可，这两步完成之后其实就可以在浏览器中调试源码了：

1. 修改 vue3.x package.json 中 module 字段对应的文件，以及其 dependencies 的 package.json 中 module 字段对应的文件
2. 在编辑器中手动保存（不用任何改动，只在那个文件窗口下 cmd + s 即可）一下 vite.config.js 文件

这两步之后即可看到源码中的改动体现在浏览器中了，所以，这就完了？

当然不是，天知道每次改动一个文件之后还要再到另一个文件窗口中按一下 cmd + s 才能让浏览器刷新有多憨批，所以自动保存 vite.config.js 的文件很理所应当的会想到要交给程序去做，初步的解决方案是：使用 `fs.watchFile` 监听上面提到的所有 module 字段对应的文件，对应的回调是重新保存一下 vite.config.js 文件即可（即 fs.read 读取内容，然后再将读到的内容原封不动的通过 fs.write 写回去），假设这个完成这个工作的脚本名为 debug.js，那最终使得我们可以像 debug vue2.x 源码一样 debug vue3.x 源码的操作是：

- 通过一个叫 concurrently 的 npm 包同时执行 `vite --force` 和 `node ./debug.js`，或者
- 开两个 shell，分别执行这两个命令

完成之后发现即便 vite.config.js 文件什么改动也没有，每次改完 module 字段对应的文件还要去强行撩拨一下它也有点憨的，所以想着是不是有更好的办法。当然是有的，之所以这么笃定，是因为修改 vite.config.js 导致的 viteServer 重启，必然也是 vite 内部调用的某个方法的结果，一般像 vite 这种 cli 工具，大多都会额外提供一系列的 JavaScript Api 供开发者定制化调用，而且刚好前阵子找 electron 和 vite 的 boilerplate，找到 https://github.com/cawa-93/vite-electron-builder，见它里面是有这样的功能的。所以通过看 https://github.com/cawa-93/vite-electron-builder/blob/main/scripts/watch.js、查 vite JavaScript Api 甚至翻 vite 的部分源码，算是找到了优化后解决方式，当然，这就需要自己写脚本开启 viteServe 的服务而不能使用 cli 了。

完整内容如下

前置条件：

- 通过 `npm init vue@latest` 成功创建 vue3.x 项目
- 通过 npm、pnpm、yarn 等包管理工具安装依赖成功
- node 版本至少大于等于 12 LTS （第一个条件就好像要求 node 版本 至少是 14，如果中间没用 nvm 切换的话，这个条件被第一个条件顺带）

相关文件：

package.json 同级创建 scripts 目录，目录里创建 debug.js 和 watch.js 两个文件，内容如下，

watch.js

```JavaScript
require('vue')

const path = require('path')
const fs = require('fs')

const vueModule = module.children[0]
const set = new Set([vueModule.path])

function collectModulePath(module) {
  if (module.path.includes('@vue') && !module.path.endsWith('dist')) {
    if (!set.has(module.path)) {
      set.add(module.path)
    }
  }
  module.children.forEach(m => {
    collectModulePath(m)
  })
}

function updateCfgFile() {
  fs.writeFileSync('./vite.config.js', fs.readFileSync('./vite.config.js'))
}

collectModulePath(vueModule)

function watchVueDependencies(cb = updateCfgFile) {
  for (let p of set) {
    const moduleRelativePath = require(path.resolve(p, 'package.json')).module
    const targetFileAbsPath = path.resolve(p, moduleRelativePath)

    console.log(`watching file \`${targetFileAbsPath}\`...`)
    fs.watchFile(targetFileAbsPath, () => {
      console.log(`file: \`${targetFileAbsPath}\` changed.`)
      cb()
    })
  }
}

module.exports.watchVueDependencies = watchVueDependencies
```

debug.js

```JavaScript
const { createServer } = require('vite')
const { watchVueDependencies } = require('./watch.js')

const config = {
  mode: 'development',
  server: {
    force: true
  },
  logLevel: 'info',
  configFile: 'vite.config.js'
}

async function start() {
  const viteDevServer = await createServer(config)

  if (!viteDevServer.httpServer) {
    throw new Error('HTTP server not available')
  }

  await viteDevServer.listen()

  const info = viteDevServer.config.logger.info

  info(` dev server running at:\n`, {
    clear: !viteDevServer.config.logger.hasWarned
  })
  viteDevServer.printUrls()

  watchVueDependencies(viteDevServer.restart)
}

start()
```
最后在 package.json 的 scripts 里加一行 `"debug": "node ./scripts/debug.js"`，运行 `pnpm debug` 就可以了。

完了，程序起来后，我发现改动源码触发的自动刷新有时候要等上半天，还不如上面说的手动 cmd + s vite.config.js 迫使浏览器刷新的憨批法子来得快😰。