---
title: vue2 自定义指令笔记以及在埋点上的简单应用
date: 2021-09-25 17:19:36
permalink: /pages/68a86e/
sidebar: auto
categories:
  - 前端
  - Vue
tags:
  - 
---

## 简介

Vue 允许开发者注册自定义指令，可以是通过 `Vue.directives` 注册全局指令或是在组件的 options 里添加 directives 属性。前者接受两个参数，第一个参数是指令名，第二个参数是定义指令的值（可以是一个包含指令各个 hooks 的函数的对象或者是一个只对 _bind_ 和 _update_ hook 生效的简写函数），后者是一个包含以指令名为属性以及对应定义指令的值为值的对象。

## 指令 hook 函数和对应参数

定义指令的对象包括 _bind_、_inserted_、_update_、_componentUpdated_、_unbind_ 五个 hook，每个 hook 对应一个在对应时机执行的函数，函数的参数为：

- el：含指令所绑定的 DOM 元素
- binding：包含指令相关信息（包括指令名、绑定值、绑定的参数、修饰符等）的对象
- vnode：指令被解析为其 `data.directives` 属性的 vnode
- oldVnode：更新前的 vnode，仅在 _update_、_componentUpdated_ 有值

可以猜测指令只在一般组件和 HTML 元素上生效，而在函数式组件和像 template、slot、component 对应的标签以及 keep-alive、transition 这样 abstract 组件上不生效的，因为指令 hook 的第一个参数是一个 DOM 元素，后面的几种情况并不能永远确定一个唯一的 el 传给 hook。事实上通过从源码粗略搜索关键字也可以确认不适用指令的情况中，指令对应的 `vnode.data.directives` 并未被处理。

## 指令的大致机制

### 指令注册的机制

就是通过 `Vue.directives` 和 `options.directives` API 使得某个组件可以通过 `vm.$options.directives.directiveName` 可以访问到对应的指令对象。

### 指令作用的机制

通过搜索 _directives_ 在 vdom 相关的模块可以知道「指令是通过 vdom 的 module 机制生效的」。vdom 的 module 是用于处理 vdom 的各种 attribute 的机制，比如 style、class、events 等，这些 module 如同定义指令的对象一样也是一个由一个个 hook 名和对应函数值组成的对象，只不过 module 的 hook 是 vdom 的 hook。通过在 vdom 的 hook 里触发指令对应的 hook 从而使指令生效。而触发指令 hook 的时对应函数的第二个参数 _binding_ 相关的信息则由通过 template 模板编译（或是手写 render 直接传参）而来的 `vnode.data.directives` 值提供。

vm 的 hooks，指令的 hooks 基本都是由 vdom 的 hooks 驱动。

## 自定义指令在点击埋点上的应用

不少应用会有记录用户点击某个元素然后上报这个点击事件给后台的需求，一般最简单的是上报一个埋点编号。如果只用原生的 DOM，大概只能挨个给每个对应的元素添加一个埋点事件。如果使用 Vue 的自定义指令的话，可以自定义一个下面的指令：

```
Vue.directives('track', function(el, binding) {
  if (el.$$widgetNo === undefined) {
    el.addEventListener('click', () => {
      recordTrack(el.$$widgetNo)
    })
  }

  if (binding.value !== el.$$widgetNo) {
    el.$$widgetNo = binding.value
  }
})
```

然后在需要埋点的元素上面添加指令就好了：

```
<template>
  <button v-track="'埋点编号'"></button>
</template>
```

需要注意的是如果传给 `v-track` 的值不是当前 vm 上的某个属性，那么需要是一个合法的 js 表达式。比如如果上面去掉了 `'埋点编号'` 的单引号，那么实际的值会是 `vm.埋点编号`。

目前看来自定义指令比较适合那种在某些场景下需要自动操作某个 DOM 元素的情况，比如给 DOM 元素添加对某些事件的监听，改变 DOM 元素的属性等等。
