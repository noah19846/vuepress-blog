---
title: Vue 应用部署在非根路径
date: 2020-10-15 17:40:32
categories:
  - 前端
tags:
  - Vue
  - Nginx
permalink: /pages/4f4b32/
sidebar: auto
author:
  name: Kisama
  link: https://github.com/noah19846
---

注：此处 Vue App 指的是由 Vue-CLI 3 创建的单页面应用，部署应用的 Web 服务器为 Nginx。

### 正文

谈到部署前端应用，大概所有有过相关经历的开发者都不会对这个流程感到陌生：`npm run build` -> dist 目录整个 copy （手动、脚本或 devops 流水线）到对应 Web 服务器的指定目录。

然后在浏览器上输入服务器的地址（不需要任何路径）就可以访问到部署的那个应用了，在应用里面，你也只是按照后台开发给你 API 路径（大概率是个不包括服务器地址的绝对路径）去请求对应的数据，好像也没有做什么特殊的事情，应用完全运行正常。

这一切看起来十分的自然和理所应当，后面你又以相同的方式开发、部署了多个类似的应用，这种在根路径上的部署，对你来说轻车熟路，一切都很顺利。直到有一天，因为防火墙、或者资金紧张或者其他随便的什么原因，你们所有那些应用在公网上全都只能通过某一台服务器（假设叫 outer）访问了，也就是说原先可以分别通过 `http://addressN` （N = 1, 2, 3...）被  访问的各个应用，现在只能通过 `http://address/appN/` 来访问了。这个时候，你想了想好像跟之前没什么区别，（拿 app1 举例）只不过原先部署到 `http://address1` 的 app1 只能换个内部的服务器（假设叫 inner1）部署了，然后在你重新部署了之后，负责配置 `http://address` 服务器 Nginx 的人告诉你：我把所有 /app1/ 开头的请求都转到 inner1 上了，你现在看下通过 `http://address/app1/` 是不是能访问到 app1。

你内心感觉应该没什么问题地在浏览器上访问了那个地址：浏览器 Tab 条上 app1 的页面 title 出来了，但是整个页面一片空白。然后你很熟练地打开了控制台的 Network 发现，那些 js 和 css 资源都是 404，你很快的察觉到原因是由于这些资源的路径有问题，它们的格式分别是 /js/xx.js、/css/xx.css 这种，在 `http://address` 下实际访问的完整路径是 `http://address/js/xx.js`，这样当然不会定位到实际是存在 inner1 上的对应资源。然后你想起 vue.config.js 里有个 publicPath 配置，你查文档发现它的默认值是 `'/'`，把它改成 `'/app1'` （或者改成相对路径）就可以了吧。

改罢，迅速保存、打包、发布、F5：依然是空白，跟刚才完全没区别！你一边纳闷儿一边又把目光看向了 Network，这次没有 404 了，那些资源加载的都是成功了的，也就是说应用是运行正常的，这次问题出在哪里了？你看着空白页面冥思苦想，突然，地址栏的 `http://address/app1/` 让你灵光一现：Router！你用的路由是 history 模式，应用里没有 `'/app1/'` 这样路径的路由，所以 vue-router 未匹配上，自然就是空白，那，我把所有的路由的路径前面也加上个 `'/app1'` 不就解决了？你想起 `new Router({ })` 里有个 base 的配置，把它的值设置设置成 `'/app1'`，这下应该没问题了。

改罢，迅速保存、打包、发布、F5：看着缓慢弹出来的登录页，你露出了欣慰的笑容。可是没过几秒，你发现本该是展示登录验证码图片的那个地方裂开了。又是在 Network 栏点到对应的获取验证码图片的请求，又是熟悉的 404：妈个鸡，啥玩意儿啊！但是有了前面两次经历，你立马意识到，跟之前的问题一样，又是路径的问题，所以你不加思索的把原本 axios 配置项 baseURL 的值由原来的 `'/api'` 改成了 `'/app1/api'`，这下绝壁没问题。

改罢，迅速保存、打包、发布、F5，你一下就把验证码图片上的那几个验证码认了出来，然后输入用户名、密码，进入主页，再依次点了其他页面，正常、正常……搞定！然后你如法炮制地修改、部署了 app2、app3。但是接下来你发现，在你验证完 app3 之后再回到之前的 app1、app2 页面二者都提示登录过期，然后跳回了登录页，紧接着你依次重新登录了 app1、app2，然后你又发现 app3 也登录过期，甚至刚刚登录的 app1 也登录过期。你停下来稍微想了一下，那三个 app 的 token 都是存在 localStorage 里的，而且 key 都是 'token'，所以每次登录 token 更新都会影响其他的应用。然后你把每个应用存在 localStorage 里的信息都加了个表示各自应用的前缀，打包发布后，虽然你知道问题肯定是解决了的，甚至都懒得去验，但是秉着谨慎的态度，你还是验证了，终于长舒一口气。

### 总结

Vue App 部署路径非根目录时，需要注意的问题

1.  静态资源的打包路径。也就是 publicPath 的值
2. 如果是 history 模式，router 的 base 也需要修改
3. API 的请求路径需要加前缀
4. localStorage 和 cookie 本地存储的 key 的冲突，以及 cookie 的生效路径（不然那个域名下的 http 请求都会带上所有的 cookie）

### 附

保证 app1 可以被访问到且运行正常的最小 nginx.conf 里 server 项配置（其余部分省略）

outer

```nginx.conf
server {
  listen:   80;

  location /app1/ {
    proxy_pass:   http://inner1;
  }

  location /app1/api/ {
    proxy_pass:   http://backend-app1/;
  }
}

```

inner1

```nginx.conf
server {
  listen:       80;
  server_name:  inner1;

  location / {
    root   /usr/local/var/www/dist; # 你自己的真实路径
    try_files $uri $uri/ /index.html;
    index  index.html index.htm;
  }

  # 不是必须，除非你想通过 http://inner1/ 也能访问到 app1
  location /app1/ {
    proxy_pass:   http://inner1/;
  }

  # 不是必须，如果 outer1 的 Nginx 配置里没有 location /app1/api/ 那条转发规则的话，就需要自己转发
  location /app1/api/ {
    proxy_pass:   http://backend-app1/;
  }
}

```
