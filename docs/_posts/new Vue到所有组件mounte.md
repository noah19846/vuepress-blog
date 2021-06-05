---
title: 从 new Vue 到所有组件 mounted
date: 2020-11-15 17:40:32
categories:
  - 前端
tags:
  - Vue
permalink: /pages/f94460/
sidebar: auto
author:
  name: Kisama
  link: https://github.com/noah19846
---

## 前言

在开始本篇之前：

- 本篇的主要目的在于理解 mounted 的大致原理（mounted 之后的事不在本篇讨论之内）

- 所用的 Vue 版本是 2.6.11，借以帮助理解的例子是 vue-cli 创建的简单 demo
- 暂不理会包括但不仅限于 slot、函数式组件、服务端渲染以及其他一些不影响理解的特性
- 贴出的代码并不完全与源码一模一样，在没有错误的前提下会有一些改动和删减（笔者认为这样做有助于理解）
- 也不会逐行去解释代码，未提到的部分可以认为暂时不提也无大碍（如果真的不是因为粗心的话）

然后，本篇所用的实例代码如下：

_main.js_

```javascript
import Vue from 'vue'
import App from './App'

new Vue({
  render: h => h(App)
}).mount('#app')
```

_App.vue_

```vue
<template>
  <div>
    <div>hello, {{ msg }}</div>
    <home></home>
  </div>
</template>

<script>
import home from './home'

export default {
  name: 'App',

  components: { home },

  data() {
    return {
      msg: 'app'
    }
  }
}
</script>
```

_home.vue_

```vue
<template>
  <div>
    <div>hello, {{ msg }}</div>
    <div>home component</div>
  </div>
</template>

<script>
export default {
  name: 'Home',

  data() {
    return {
      msg: 'home'
    }
  }
}
</script>
```

本篇的目的就是讲清楚从 `new Vue({ render: h => h(App) }).mount('#app')` 到页面上出现对应的 DOM 内容，这中间的过程是如何发生的，主要分为以下几小结：`Vue` 以及由它创建的 vm 实例的属性是如何来的、vnode 和 vm 实例的 render、初次 patch 和 `VueComponent`。

## Vue 和 vm

我们知道所有的 _\*.vue_ 文件最终在应用运行时的表现形式是一个 vm 实例，这些 vm 实例拥有着一个共同的根 vm，前者由 `new VueComponent` 创建，后者由`new Vue` 创建，而 `VueComponent` 又继承自 `Vue`，所以，既然所有视图相关的内容都离不开 `Vue` 和 vm，为此我们需要知道它们分别有怎样的属性（和方法）以及这些属性是如何被赋予的：

### 构造函数 `Vue`

```javascript
// 1
function Vue(options) {
  this._init(options)
}

// 2
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifeCycleMixin(Vue)
renderMixin(Vue)

// 3
initGlobalAPI(VUe)

// 4
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get: function get() {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

Vue.version = '2.6.11'

// 5 install platform specific utils
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// 6 install platform runtime directives & components
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
Vue.prototype.$mount = function(el, hydrating) {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

见名知义，那些 **xxxMixin** 的作用就是在 `Vue.prototype` 上添加与 xxx 相关的属性：

- initMixin：为 `Vue.prototype` 添加 `_init` 方法，这个方法在就是 `new Vue` 和 `new VueComponent` 时所执行的
- stateMixin：为 `Vue.prototype` 添加 `$set`、`$delete`、`$watch` 方法
- eventMixin：为 `Vue.prototype` 添加 `$on`、`$once`、`$emit`、`$off` 方法
- lifeCycleMixin：为 `Vue.prototype` 添加 `$forceUpdate`、`$destroy`、`_update` 方法
- renderMixin：为 `Vue.prototype` 添加 `_render`、`$nextTick` 和一些其他 runtime convenience helpers（这些方法名都是以一个下划线和单个字母组成，由 `<template>` 编译而成 `render` 里用的都是这些方法）

**initGlobalAPI** 的作用是往 `Vue` 上添加属性：

- config 和 util：一般不太会用到
- options：包括 components、directives、filters、\_base，其中 \_base 的值一般都为 `Vue` 本身，用于继承
- set、delete、observable、nextTick：这些属性与 `Vue.prototype` 上相关属性一一对应
- use、mixin：用于添加 plugin 和 mixin
- extend：生成 VueComponent
- component、directive、filter：用于 `Vue.options` 里对应的属性里添加属性，比如注册一个组件、指令和 filter

`initGlobalApI(Vue)` 执行后， `Vue.options.components` 里只包含 `builtInComponents` （只有一个 `KeepAlive`），后面又添加了 `platformComponent` （包括 `Transition` 和 `TransitionGroup`）；`Vue.options.directive` 里包含 model 和 show 两个 directive。

**\_\_patch\_\_** 和 **\$mount** 的是两个至关重要的方法，后者用于开始实例的挂载，前者用于通过新旧 vnode 的对比生成 DOM。

以上便是我们从 `import Vue from 'vue'` 拿的到 `Vue` 所包含的所有原型属性和静态属性。

### vm

现在我们来看看 vm 是如何创建以及被创建之后它有哪些属性，开始执行 _main.js_ 里的代码，第一步：`new Vue({ render: h => h(App) })`，即执行 `_init({ render: h => h(App) })`：

```javascript
Vue.prototype._init = function _init(options) {
  const vm = this

  vm._uid = $uid++
  vm._isVue = true
  // VueComponent._init 时下一行代码会有所不同
  vm.$options = mergeOptions(Vue.options, options, vm) // 1

  vm._renderProxy = vm
  vm._self = vm

  // 2
  initLifeCycle(vm)
  initEvents(vm)
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm)
  initState(vm)
  initProvide(vm)
  callHook(vm, 'created')

  if (options.el) {
    vm.$mount(options.el)
  }
}
```

**\_uid** 是每个 vm 的唯一标识，从 0 自增，根组件为 0。

**mergeOptions** 函数的作用在于将第一个参数与第二个参数里包含的属性根据不同的**合并策略**（先记着有这么个东西就好）合并成一个新的 options 保存在 `vm.$options` 属性或 vm 自身（比如 state 相关的属性）上，当我们访问 vm 上的那些属性时会得到最终合并的值。

那些 **initxxx** 的作用就是为 `vm` 添加与 **xxx** 相关的属性：

- initLifeCycle：
  - \$parent、\$root：初始话当前 vm 的父组件和根组件为正确的值
  - \$chidren、\$refs：前者用于保存当前 vm 下所挂载的子组件，初始化为空数组；后者保存当前组件拥有的 refs，初始化为 `{}`
  - \_watcher、\_inactive：前者用于保存当前 vm 的 render-wacher 实例（render-watcher 是一 watcher 实例的一种类型，每个 vm 都有且仅有一个 ）初始化为 `null`；后者用于 `KeepAlive` 组件，初始化为 `null`
  - \_directInactive、\_isMounted、\_isDestroyed、\_isBeingDestroyed：第一个属性也是用于 `KeepAlive` 组件，初始化为 `false`；其余属性见名知义，均初始化为 `false`
- initEvents：
  - \_events：用于保存绑定在当前组件上的事件，初始化为 `Object.create(null)`
  - \_hasHookEvent：标记当前组件的事件中是否包含名称类似于 `hook:created` 这样的事件，初始化为 `false`
- initRender：
  - \_vnode：用于保存 `vm.render()` 的返回值，初始化为 `null`
  - \$vnode：称为组件 vnode 或 placeholder vnode，当前组件在其父组件 `_vnode` 里的表现形式，最终在调用自身 `render()` 后生成 `vm._vnode`，初始化为在其父组件 `_vnode` 里所代表的组件 vnode 值。可以推知根组件 `$vnode` 值为空。
  - \_c 和 \$createElement：都用于生成 vnode 实例，前者在 template 模板编译而成的 render 函数内部使用，后者暴露为手写 `render(h) { return h('div', 'hello') }` 函数的第一个参数，比如 _main.js_ 里的 `{ render: h => h(App) }`
  - \_staticTrees、\$slots、\$listeners 等
- initInjections：处理 `vm.$options.inject` ，使得 `vm.k` 等同于访问 `vm.options.inject.k`
- initState：
  - 初始化 `vm._watchers` 为 `[]`，用于保存当前 vm 下创建的所有 watcher 实例，包括 render-watcher、lazy-watcher（处理 computed 时生成）、一般 watcher 三类
  - 处理 `vm.$options` 里的 props、methods、data、computed，也是使得他们的属性可以直接在 `vm` 上被访问
  - 处理 `vm.$options.watcher`，为每个被 watch 的东西创建 watcher 实例
- initProvide：处理 `vm.$options.provide`，生成 `vm._provide`，供子组件 inject

**callHook** 的作用是执行 `vm.$options` 里的生命周期 hook，并且如果当前 `vm._hasHookEvent` 为 `true` 时触发对应的 hook event。

以上便是一个 vm 的创建过程，紧接着便是执行 `vm.$mount($el)`。

## vnode 和 vm 实例的 render

在说明 vnode 为何物以及从何而来之前先看完 `$mount` 相关的代码：

```javascript
Vue.prototype.$mount = function(el) {
  return mountComponent(this, el)
}

function mountComponent(vm, el) {
  vm.$el = el

  callHook(vm, 'beforeMount')

  const updateComponent = () => vm._update(vm._render())

  new Watcher(
    vm,
    updateComponent,
    () => {},
    {
      before: () => {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, 'beforeUpdate')
        }
      }
    },
    true /* 为 true 说明为 render-watcher */
  )

  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
}
```

可以看到 `mountComponent` 函数就做了：

1. 为 `vm.$el` 赋值
2. `callHook(vm, 'beforeMount')`
3. 为当前 vm 生成一个 render-watcher 实例：先不管生成 render-watcher 的详细过程和内部机制，只记住生成时会执行 `updateComponent` 函数，进而也就会执行 `vm._render()` 和 `vm._update(vnode)`
4. 检查 `vm._$vnode == null` 是否为真，是则手动调用 `callHook(vm, 'mounted')`（前面提到过一般只有根组件的 `vm.$vnode` 为空，所以这第四步只有根组件的 `$mount` 里会走到）

就是这四步使得所有的组件被转换成 DOM，可以想见，定是第三步中某些操作触发了子组件的 render，然后子组件对应的第三步里又触发孙组件的 render，一直到所有叶子组件都 render 完毕。下面先简单介绍一下 vnode。

### VNode

vnode 是 DOM 里真实 node 的一种简化，相比于由 `document.createElement` 创建的拥有着一堆属性的 node，vnode 只需要几个必要的属性：标签名、属性集、子节点列表、文本值，就可以对应一个 node。在 Vue 中，vnode 由构造函数 `VNode` 创建：

```js
class VNode {
  constructor(tag, data, children, text, elm, context, componentOptions) {
    this.tag = tag
    // ...
    this.componentOptions = componentOptions
    this.componentInstance = undefined
  }
}
```

通过这几个参数就可以生成一个 vnode，（当然，vnode 实例还有一些其他的属性，不过暂时仅关注这几个），其中当 **tag** 为空或者与 DOM 里的标签名对应时，我们称此时的 vnode 为一般 vnode，否则称为组件 vnode，每个组件 vnode 对应一个 vm；**data** 用于存储与真实 node 相关的各种属性：class、style、绑定的原生事件等；与真实 node 有子 node 一样，children 用于存储子 vnode；**text** 与文本 node 对应；elm 指向由当前 vnode 生成的 node；**context** 指向当前 vnode 所在的 vm 实例；**componentOptions** 组件 vnode 专有，用于存储一些生成子组件所要用到的数据；对应地，**componentInstance** 也是组件 vnode 专有，在组件 vnode 即将要转化成 node 时，会有一个与这个组件 vnode 对应的 vm 实例生成，随后 componentInstance 便会指向这个实例。

对 vnode 有个基本了解后，我们再来看下 vnode 是何时生成，以及是如何被转换成真实 node 的。

### vm 实例的 render

上面 render-watcher 创建时首先是执行 `vm._render()`，前面提过 `_render` 这个方法是在 `renderMixin(Vue)` 时添加到原型对象上的，方法最终的返回值是一个由 `vm.$options.render.call(vm, vm.$createElement)` 生成的 vnode 实例，这行语句的效果是将 `vm` 作为 `this` 值，`vm.$createElement` 作为参数传给 `vm.$options.render`，对于根组件就是 `vm.$createElement(App)`，而最终起作用的是 `_createElement` 函数：

```javascript
vm.$createElement = function (a, b, c) {
  return _createElement(vm, a, b, c)
}

function _createElement(context, tag, data, children) {
  // context 即为 vm，创建根组件时，tag 即 App
  if(!tag) {
    return createEmptyVNode()
  }

  let vnode

  if(typeof tag === 'string') {
    let Ctor
    // 与 HTML 原生标签同名时
    if(config.isReservedTag(tag)) {
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
     // 为自定义组件时，在 context.$options.components 属性里找是否注册过此组件
     // 子组件的 render 会走这一步
    } else if(Ctor = resolveAsset(context.$options, 'components', tag))) {
      vnode = createComponent(Ctor, data, context, children, tag)
    }
   // tag 为组件对应的 options，比如 App，根组件的 render 会走这一步
  } else {
    vnode = createComponent(tag, data, context, children)
  }

  return vnode || createEmptyVNode()
}
```

当 `tag` 为 HTML 原生标签时，直接调用 `new VNode` 生成一个一般 vnode 返回；当 `tag` 为自定义组件名时，从父组件 `vm` 实例的 `$options.components` 里解析出这个自定义组件的 options 然后为之调用 `createComponent` 并将其返回值赋给 `vnode`；除此之外的其他情形直接把 `tag` 当做一个组件的 options 处理。也许 `new Vue({ render: h => h(App) })` 最初可能的样子是 `new Vue({ components: { App }, render: h => h('App') })`，然后作者感觉这样还是有点繁琐了，于是就加了最后那个直接将组件对应的 options 当成 `tag` 处理的逻辑，让 `main.js` 文件里少写十几个字符。

所以接下来我们要看的是 createComponent1（在源码里还有个函数也叫 createComponent，为避免混淆，分别在后面加个数字）：

```javascript
function createComponent1(Ctor, data, context, children, tag) {
  if (isUndef(Ctor)) {
    return
  }

  // 这个 baseCtor 一般情况下基本都是 Vue
  var baseCtor = context.$options._base

  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  data = data || {}

  var propsData = extractPropsFromVNodeData(data, Ctor, tag)
  var listeners = data.on

  data.on = data.nativeOn

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor)

  // 为组件 vnode 添加其特有的 hooks
  installComponentHooks(data)

  var name = Ctor.options.name || tag

  return new VNode(
    'vue-component-' + Ctor.cid + (name ? '-' + name : ''),
    data,
    undefined,
    undefined,
    undefined,
    context,
    { Ctor, propsData, listeners, tag, children }
  )
}
```

通过对比 `new VNode` 的传参可以看出组件 vnode 与一般 vnode 不同之处在于除了第一个参数 `tag` 名称不同以外，`data` 也被 `installComponentHooks` 处理过，还有就是多了个一般 vnode 没有的 `componentOptions` 参数，也正是这些不同之处使得在 vm 的 patch 过程中，每个组件 vnode 得到处理进而创建出与之对应的 `VueComponent` 构造函数（即 `componentOptions.Ctor`）并由之生成对应的 vm 实例，生成的 vm 又执行自己的 `_init`、`_render`、`_update` 进而生成下一个子实例……如此往复，直到所有的组件 vnode 得到应有的处理。

## 组件的初次 patch 和子组件的生成

**组件的 patch 指的是组件对应的 vnode 被转换成真实 node 并插入到其父节点的过程，因为每个组件实例都有个与之一一对应的 组件 vnode 实例，所以后面组件的 patch、vnode 的 patch 指同一回事。**

拿到 `vm.render()` 返回的 vnode 实例之后，vm 实例就开始 patch 了，这个过程体现在实例层面由 `vm._update` 和 `vm.__patch__`完成，其最终目的是将 vnode 转换成真实 node。我们知道对于一般的 vnode 可以由 DOM 里的相关 API 直接转生成真实 vnode，而在这 patch 过程中，组件 vnode 是怎样被处理的呢？

### 初次 patch

```javascript
Vue.prototype._update = function(vnode) {
  const vm = this
  const prevEl = vm.$el
  const restoreActiveInstance = setActiveInstance(vm)

  vm._vnode = vnode
  // 第一次 patch 时，vm._vnode 为空，直接将 vm.$el 当做 oldVnode 传给 vm.__patch__
  // vm 为根实例时 vm.$el 为 document.getElementById('App')，非根组件时为空
  vm.$el = vm.__patch__(vm.$el, vnode)

  restoreActiveInstance()

  if (prevEl) {
    prevEl.__vue__ = null
  }
  if (vm.$el) {
    vm.$el.__vue__ = vm
  }
}

Vue.prototype.__patch__ = function(oldVnode, vnode) {
  const insertedVnodeQueue = []
  let isInitialPatch = false

  if (isUndef(oldVnode)) {
    // 1.非根组件的第一次 patch
    isInitialPatch = true
    createElm(vnode, insertedVnodeQueue)
  } else if (isDef(oldVnode.nodeType)) {
    // 2.根组件的 patch，new Vue({ render: h => h(App) }).$mount('App')

    oldVnode = emptyNodeAt(oldVnode)

    const oldElm = oldVnode.elm
    const parentElm = nodeOps.parentNode(oldElm)

    createElm(vnode, insertedVnodeQueue, parentElm, nodeOps.nextSibling(oldElm))
  }

  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)

  return vnode.elm
}
```

由上可见 `vm.__patch__` 中除了一些见名知义的工具函数以外，与第一次 patch 相关的函数是 `createElm`，关键代码如下：

```javascript
function createElm(vnode, insertedVnodeQueue, parentElm, refElm) {
  // 3.判断是否为组件 vnode，是的话直接退出当前函数，由组件 vnode 生成对应 VueComponent 再生成对应 vm
  // 均在 createComponent 内部完成，这个 createComponent 便是前面提到的 createComponent2
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return
  }

  const data = vnode.data
  const children = vnode.children
  const tag = vnode.tag
  // 一般 vnode 的处理，createChildren 执行的过程中会对每个 child vnode 递归调用 createElm
  if (isDef(tag)) {
    // 4.tag 为 HTML 合法的标签，createElement 是调用 document.createElement 生成 DOM node
    vnode.elm = nodeOps.createElement(tag, vnode)
    createChildren(vnode, children, insertedVnodeQueue)

    if (isDef(data)) {
      invokeCreateHooks(vnode, insertedVnodeQueue)
    }
    // insert 操作是将 DOM node 插入到其应该在的位置，即在其父元素中的位置
    insert(parentElm, vnode.elm, refElm)
  } else if (isTrue(vnode.isComment)) {
    // 5.注释节点，直接 insert
    vnode.elm = nodeOps.createComment(vnode.text)
    insert(parentElm, vnode.elm, refElm)
  } else {
    // 6.文本节点，直接 insert
    vnode.elm = nodeOps.createTextNode(vnode.text)
    insert(parentElm, vnode.elm, refElm)
  }
}
```

createElm 处理不同类型 vnode 的说明如上面注释。处理组件 vnode 的职责由 `createComponent2` 完成，也正是在这里，子组件开始自己的生命周期。

### 子组件的生成

```javascript
function createComponent2(vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data

  if (isDef(i) && isDef((i = i.hook)) && isDef((i = i.init))) {
    i(vnode)
  }

  if (isDef(vnode.componentInstance)) {
    initComponent(vnode, insertedVnodeQueue)
    insert(parentElm, vnode.elm, refElm)

    return true
  }
}
```

我们知道 `vnode.componentInstance` 这个属性在 vnode 实例的创建之初是为空的，所以定是 `vnode.data.hook.init(vnode)` 的过程中为这个属性赋值，而在之前组件的 render 时 `createComponent1` 中有 `installComponentHooks(data)` 这样一个操作，它为每个组件 vnode 都添加了专属的 hooks，其中就包括 `init`（除此之外其他的 hooks 分别为 `prepatch`、`insert`、`destroy`）：

```javascript
const componentVNodeHooks = {
  init(vnode) {
    const child = (vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      // activeInstance 为 child 的父组件实例
      activeInstance
    ))
    child.$mount()
  }
  // ... 其他 hooks
}

function createComponentInstanceForVnode(vnode, parent) {
  const options = {
    _isComponent: true,
    _parentVnode: vnode,
    parent: parent
  }

  return new vnode.componentOptions.Ctor(options)
}
```

`init` hook 的结果实际是为组件 vnode 生成一个 vm 实例并赋值给 `vnode.componentInstance` 属性（在 `createComponent2` 函数中正是通过这个属性的值来判断需要处理的 vnode 是一般 vnode 还是组件 vnode），然后执行 `vm.$mount`，生成实例的工作由 `vnode.componentOptions.Ctor(options)` 完成，而这个 `Ctor` 就是子组件的构造函数，也即一开始提到的 `VueComponent`，它是在前面 `createComponent1` 中由 `Vue.extend(options)` 生成（这个 options 是每个单文件组件被 vue-loader 处理而得到的对象）：

```javascript
Vue.exntend = function(extendOptions = {}) {
  const Super = this
  const superId = Super.cid
  const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})

  if (cachedCtors[superId]) {
    return cachedCtors[superId]
  }

  const name = extendOptions.name || Super.options.name

  const Sub = function VueComponent(options) {
    this._init(options)
  }

  Sub.prototype = Object.create(Super.prototype)
  Sub.prototype.constructor = Sub
  Sub.cid = cid++
  Sub.options = mergeOptions(Super.options, extendOptions)
  Sub['super'] = Super

  if (Sub.options.props) {
    initProps$1(Sub)
  }
  if (Sub.options.computed) {
    initComputed$1(Sub)
  }

  Sub.extend = Super.extend
  Sub.mixin = Super.mixin
  Sub.use = Super.use

  // Vue.component、Vue.directive、Vue.filter
  ASSET_TYPES.forEach(function (type) {
    Sub[type] = Super[type]
  })

  if (name) {
    Sub.options.components[name] = Sub
  }

  Sub.superOptions = Super.options
  Sub.extendOptions = extendOptions
  Sub.sealedOptions = extend({}, Sub.options)

  cachedCtors[SuperId] = Sub

  return Sub
}

// App 所对应的 options 的 JSON 格式字符串，那两个 null 是因为原始值是函数
{
  "name": "App",
  "components": {
    "home": {
      "name": "Home",
      "staticRenderFns": [],
      "_compiled": true,
      "beforeCreate": [null],
      "beforeDestroy": [null],
      "__file": "src/home.vue"
    }
  },
  "staticRenderFns": [],
  "_compiled": true,
  "beforeCreate": [],
  "beforeDestroy": [],
  "__file": "src/App.vue"
}
```

组件的构造函数 `VueComponent` 虽然直接继承构造函数 `Vue` ，但在静态属性上并没有与后者完全保持一致：

1. 较后者少的：`config`、`util`、`set`、`delete`、`nextTick`、`observable`、`FunctionalRenderContext`

2. 较后者多的：`super`、`superOptions`、`extendOptions`、`sealedOptions`
3. 有变化的：`options`

与 `new Vue(options)` 的 `options` 直接被拿来生成 vm 实例不同，组件的的 `options` 是先被拿来生成对应的 `Vuecomponent` 构造函数的，组件的 `options` 被当做 `extendOptions` 传入 `Vue.extend` 与 `Vue.options` 一起被 `mergeOptions` 处理成一个新的 `options` 赋给 `VueComponent.options` 属性。这样做有助于减少重复操作，因为根组件只有一个（无需这样做），而同一个子组件则可能在多处实例化，所以可以在第一次生成某个 `VueComponent` 时便将之与其 `Super` 的 `cid` 对应起来存到 `extendOptions.Ctor` 里，这样只要 `Super` 不变，每次 `Super.extend` 时就可以省去不少功夫。（其实只要一个组件的 `options` 里没有显式覆盖 `_base` 这个属性，那么在这个组件下生成的子组件 `VueComponent` 都是直接继承自 `Vue`，也就是说每个子组件对应的 `VueComponent.options._Ctor` 里只有一个为 0 的属性，`Vue.cid` 为 0。）

`initComputed$1` 和 `initProps$1` 分别是将子组件的 `computed` 里的各个属性都初始化为 `VueComponent.prototype` 的 getter/setter 和将 `props` 里的各个属性都代理到 `VueComponent.prototype` 的 `_props` 上。

以上便是 `Vuecomponent` 的生成过程，构造函数有了，子组件的实例化与根组件就基本无太大区别了，都是调用 `this._init(options)`，依次经历组件 vm 的每个生命周期。另外，可以看下由 vue-loader 生成的 render 长什么样：

```javascript
ƒ () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [_c("div", [_vm._v("hello, " + _vm._s(_vm.msg))]), _c("home")],
    1
  )
}
```

上面的 `_v`、`_s` 都是前面提到过的 renderMixin 里面为 `Vue.prototype` 上添加的 runtime convenience helpers。

可以料想，从 `new Vue({ render: h => h(App) }).$mount('App')` 到最终所有 vm 实例都被 mount 为 DOM 的过程大致为：

1. 根组件 vm0 patch 过程中处理由 `App` 生成的组件 vnode
2. 为这个组件 vnode 生成一个 vm1 实例， vm1 初始化、挂载
3. 组件 vm1 patch 过程中如果遇见其他组件 vnode 则重复 step 2，否则当成一般 vnode 处理（而处理一般 vnode 的 children 里有可能包含组件 vnode）
4. 重复 step2、step3 直到所有 vnode 都被转换成 DOM node 并被插入到其应该在的位置

所以，以上过程最终会为所有的组件 vnode 生成一个 vm 实例，并依次从最后一个 vm 开始将每个 vm 对应的 DOM node 挂载到其父 DOM node，所以 mounted 这个生命周期的执行顺序是子先父后，最后来看下由每个组件 vnode 生成的真实 node 是如何被插入到父 node 上，对应的 vm 实例是如何有序触发 mounted hook。

## 所有组件触发 mounted hook

在 patch 方法的结尾处，每个组件 vnode 在 patch 结束时会触发 `invokeInsertHook`：

```javascript
function invokeInsertHook(vnode, queue, isInitialPatch) {
  if (isTrue(isInitialPatch) && isDef(vnode.parent)) {
    // vnode.parent 为组件 vnode，当 vm 初次 patch 时，其对应的组件 vnode 会将当前
    // 所有已完成 patch 的 vnode 的队列保存在 data.pendingInsert 里，
    // 在后续 initComponent 时这个 vnode 自己也会被 push 到 其父组件 vnode.data.pendingInsert，
    vnode.parent.data.pendingInsert = queue
  } else {
    // 根组件的 patch 内执行 invokeInsertHook 时，invokeInsertHook 里面是所有按顺序 patch 的组件 vnode，
    // 依次执行它们的 insert hook，也即执行那些组件 vnode 对应的 vm 的 mounted hook
    for (let i = 0; i < queue.length; ++i) {
      // 至此，mounted hook 结束
      queue[i].data.hook.insert(queue[i])
    }
  }
}

function initComponent(vnode, insertedVnodeQueue) {
  // 此时 vnode 对应的 el 已经生成
  if (vnode.data.pendingInsert) {
    // 更新 insertedVnodeQueue
    insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
    vnode.data.pendingInsert = null
  }

  vnode.elm = vnode.componentInstance.$el

  if (isPatchable(vnode)) {
    invokeCreateHooks(vnode, insertedVnodeQueue)
  } else {
    registerRef(vnode)
    insertedVnodeQueue.push(vnode)
  }
}

function invokeCreateHooks(vnode, insertedVnodeQueue) {
  for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
    cbs.create[i$1](emptyNode, vnode)
  }
  i = vnode.data.hook // Reuse variable
  if (isDef(i)) {
    if (isDef(i.create)) {
      i.create(emptyNode, vnode)
    }
    if (isDef(i.insert)) {
      insertedVnodeQueue.push(vnode)
    }
  }
}

componentVNodeHooks.insert = function insert(vnode) {
  const componentInstance = vnode.componentInstance

  if (!componentInstance._isMounted) {
    componentInstance._isMounted = true
    callHook(componentInstance, 'mounted')
  }
}
```

`patch` 的结果是为 vnode 生成了 elm，且这个 elm 已被插入到它其父元素上，实际上 `createElm` 执行完就保证了上述结果，所以在 `patch` 函数内部 `createElm` 之后执行 `invokeInsertHook` 是恰当的时机。

`invokeInsertHook(vnode, queue, isInitialPatch)` 实际上做两件事，当 `vnode` 是子组件 vnode 且是第一次 patch 时，将已经 patch 完的组件 vnode 队列也就是 `queue` 保存在 `vnode.data.peningInsert` 上，否则说明所有的组件 vnode 都被 patch 成真实 node 并被插入到其父 node 中，此时应该依次为 `queue` 里的组件 vnode 触发 insert hook，也即按照那些组件 vnode patch 的顺序为其对应 vm 实例执行 `callHook(componentInstance, 'mounted')`。

对于每个组件 vnode 而言，`vnode.data.pendingInsert` 保存的是当前的 `vnode` patch 时，所包含已经 patch 完的子组件 vnode 队列，然后在 `invokeCreateHooks` 里被 push 到父组件 vnode 的 `pendingInsert` 里，最终所有的组件 vnode 被按照他们 patch 的顺序 push 到根组件的 `patch` 时创建的 `insertedVnodeQueue` 变量里。显然，一个组件叶子 vnode 的 `data.pendingInsert` 是 `[]`。

从 App 开始，所有的组件 vnode 按照深度优先遍历的原则被依次开始 patch，但是只有所有的子组件被 patch 完成，父组件才算 patch 完成，最终，所有组件 vnode 则组成一个井然有序的队列，被保存在根组件开始 patch 时的那个 `insertedVnodeQueue` 中。依照队列的顺序为所有子组件 vnode 对应的 vm 实例触发完各自的 mounted hook 之后，调用栈回到根组件 `$mount` 方法里的 `mountComponent` 函数，在这个函数的结尾处根组件的 mounted hook 被触发。
