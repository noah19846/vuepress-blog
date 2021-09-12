---
title: Vue2 函数式组件
categories: 
  - 前端
tags: 
  - Vue
  - 函数式组件
sidebar: auto
author: 
  name: Kisama
  link: https://github.com/noah19846
date: 2021-09-12 21:30:42
permalink: /pages/06e7a3/
---

## 函数式组件简介

1. 何为函数式组件？——当组件对应的 options 对象中 _functional_ 属性值为 _true_ 时，这个组件就是一个函数式组件
2. 函数式组件与一般组件有何不同？——它没有响应式的数据（组件对应的 options 里没有 _data_、_computed_ 等与 state 相关的属性）；也不像一般组件一样有通过 options 创建的 vm 实例（自然也没有那一系列的生命周期），所以在函数式组件内部的方法中也没有 _this_ 可以访问，它所拥有的只是一个包含 _props_、_children_、_slots_、_scopedSlots_、_parent_、_listeners_、_injections_ 属性的 _functionalRenderContext_ 对象，这个对象供函数式组件的 _render_ 方法访问，以达到父组件向其传值以及访问函数式组件渲染内容的目的
3. 为什么要有函数式组件？——有些时候一个组件并不需要创建和维护自己的内部状态，而只用完全根据 _props_ 的值来决定渲染的内容，创建 vm 会略显多余，此时则是函数式组件的用武之地，相比于创建 vm 实例并执行一系列生命周期 hooks，创建一个 _functionalRenderContext_ 对象的开销则小得多

## 函数式组件内部机制

不管是何种组件，调用自身 render 方法的结果都是返回一个 vnode 实例用于 patch，函数式组件也不例外，与一般组件的 render 方法不同的是函数式组件的 render 方法多了个 _functionalRenderContext_ 对象用来弥补没有与之对应的 vm 实例所带来的的不足：没有内部状态固然不用创建 vm，但与此同时 _props_、_children_ 之类的东西也没了。所以函数式组件的内部机制主要在于 _functionalRenderContext_ 对象的创建，也即对象包含的属性的创建。与函数式组件相关的源码大致如下：

```
function createComponent(Ctor, data, context, children, tag) {
  // ...
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  if (Ctor.options.functional === true) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }
  // ...
}

function createFunctionalComponent(Ctor, propsData, data, contextVm, children) {
  const options = Ctor.options;
  const props = {};
  const propOptions = options.props;
  if (isDef(propOptions)) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject)
    }
  } else {
    if (isDef(data.attrs)) {
      mergeProps(props, data.attrs)
    }
    if (isDef(data.props)) {
      mergeProps(props, data.props)
    }
  }
  const renderContext = new FunctionRenderContext(data, props, children, contextVm, Ctor)

  const vnode = Ctor.options.render.call(null, renderContext._c, renderContext)

  return vnode
}

function FunctionRenderContext(data, props, children, parent, Ctor) {
  const options = Ctor.options
  let contextVm

  if (hasOwn(parent, '_uid')) {
    // 说明要渲染的函数组件是在一般组件里渲染的
    contextVm = Object.create(parent)
    contextVm._original = parent
  } else {
    // 说明要渲染的函数组件是在另一个函数组件里渲染的
    contextVm = parent
    parent = parent._origin
  }

  this.data = data
  this.props = props
  this.children = children
  this.listeners = data.on || emptyObject
  this.injections = resolveInjections(options.inject, parent)
  this.slots = () => { // ... 一个返回 slots 对象的函数 }
  Object.defineProperty(this, 'scopedSlots', {
    enumerable: true,
    function get() {
      // 返回 scopedSlots 对象
    }
  })

  this._c = (a, b, c, d) => createElement(contextVm, a, b, c, d)
}

installRenderHelpers(FunctionalRenderContext.prototype)
```

可以看到在由某个一般组件开始 render 进而执行 _createComponent_ 函数之前，作为那个一般组件的子组件的函数式组件得到的待遇与一般组件区别无二，只在真正开始创建 vnode 实例时才执行不同的逻辑，即 `return createFunctionalComponent(Ctor, propsData, data, context, children)`，其内部执行步骤如下：

1. 如果函数式组件对应的 options 里有定义 _props_，那么依据其和 _propsData_ 生成一个 props 对象，否则将 `data.attrs` 和 `data.props` 合并生成一个 props 对象
2. 通过 `new FunctionalRenderContext(data, props, children, contextVm, Ctor)` 生成 _renderContext_ 实例，其中 _props_ 为 step1 生成的对象
3. 调用 `options.render.call(null, renderContext._c, renderContext)` 生成 vnode
4. 返回 step3 生成的 vnode

_FunctionalRenderContext_ 构造函数的内部则根据传的参数生成包含前面所述那些属性的实例，其内部步骤如下：

1. 依据 _parent_ 是一般组件还是也是函数式组件确定对应的 _contextVm_，用于传给 _createElement_
2. 为  实例确定 _props_、_children_、_slots_、_scopedSlots_、_parent_、_listeners_、_injections_ 属性的值
3. 为实例添加 _\_c_ 方法，用于传给 `options.render` 方法的第一个参数

`installRenderHelpers(FunctionalRenderContext.prototype)` 的作用是为之添加一些由 `<template functional></template>` 编译而成的 render 函数内部可能会用到的 render helpers，与添加到 `Vue.prototype` 上的完全一致。

源码中关于函数式组件相关的内容就是这些，因为不生成 vm，所以流程比较简单，就是根据父组件可能会传的那几个属性以及可能会有的 children 来生成对应的 vnode 然后静待 patch 到 dom 上即可。而不像一般 vm 那样需要预生成一个安装了 vnode hooks 的 placeholder vnode，然后在 patch 时在已安装的 vnode hooks 里生成对应的 vm 实例继而 vm 实例再 render。

## 一个直接将 vnode 写在 template 里的想法
虽然没了 vm，单函数式组件还是多创建了个 _functionalRenderContext_ 实例以及对应的 _contextVm_ 实例，有没有办法把这两个开销也省掉呢？比如直接把 vnode 写在 template 里的。

目前 Vue 好像没有这样的 api 或组件提供这样的功能，虽然有 dynamic component，但这个组件的花销还是不少于创建一个函数组件的花销。如果 Vue 提供可以直接将 vnode 写到 template 里的功能会是什么样？

比如提供一个名为 vnode 的内置组件，compiler 会把 vnode 组件中 `{{}}` 里的东西当成 vnode 来处理，即 `<div><vnode>{{` `aVnodeOrVnodeArray` `}}</vnode></div>` 这样的模板内容在 render 方法中会被编译成 `vm._c('div', null, aVnodeOrVnodeArray)`，这样的话在 render 时就不会创建不必要的 _contextVm_ 和 _functionalRenderContext_ 实例了，因为 **aVnodeOrVnodeArray** 已经是 vnode 了。**aVnodeOrVnodeArray** 应该可以是依赖 data 或是 props 的某个 computed value，也可以是某个 method 的返回值。
