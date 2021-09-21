---
title: Vue2.6 slot 笔记
categories: 
  - 前端
tags: 
  - Vue
  - slot
sidebar: auto
author: 
  name: Kisama
  link: https://github.com/noah19846
date: 2021-09-21 21:07:57
permalink: /pages/c0fb45/
---

什么是 slot？——精确的定义不好下，可以类比为电脑主板上用于插网卡、内存条等各种硬件的那些东西。因为有那些插槽，人们可以在上面插上不同的网卡和内存条。

slot 有什么用？——先设想，如果没有 slot，那些硬件就必须集成在主板上，显然不是一种灵活的做法，slot 就赋予了这种灵活性。

拿电脑主板打比方后，Vue 的 slot 的作用也就是一样的：赋予组件直接将 vnode 填充到组件的渲染内容中特定地方的能力。slot 相关的用法 Vue 文档有详述，本篇主要记录 slot 的实现原理，v2.6 之前的 slot attribute 的即将废弃的写法不作讨论，主要说明 v-slot 写法的 slot。

## renderSlot

先从有 slot 的组件的 render 方法说起，比如下面的组件：

```
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Hello'
}
</script>
```

的 render 函数会是：

```
function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [_vm._t("default")], 2)
}
```

其中 `_vm._t` 就是 _renderSlot_

```
function renderSlot(name, fallbackRender, props, bindObject) {
  const scopedSlotFn = this.$scopedSlots[name]
  let nodes

  if (scopedSlotFn) {
    props = props || {}

    if (bindObject) {
      props = { ...bindObject, ...props}
    }

    nodes = scopedSlotFn(props) || (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender)
  } else {
    nodes = this.$slots[name] || (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender)
  }

  return nodes
}
```

显然，_renderSlots_ 的返回值是也不过是 vnode(s)，在调用 `_vm.render` 时通过 v-slot 指令指定的 slot 都已经被解析到 `_vm.$scopedSlots` 或 `_vm.$slots` 中，且可以知道的是前者是由以 slot name 为 key，返回对应 vnode 的函数为 value 组成的对象，后者看起来则是以 slot name 为 key，vnode （或返回 vnode 的 getter）为值组成的对象。`<slot :xx="yy"></slot>` 里传的 xx prop 则会被传为 props 的属性。

## resolveSlots 和 resolveScopedSlots

假设上面说的 _Hello_ 组件（包含了默认 slot、named slot、named-scoped slot，以及 children）在某个父组件的模板中如下：

```
<template>
  <Hello>
    <template v-slot>hello, default slot</template>
    <template v-slot:named>a named slot</template>
    <template #scopedAndNameSlot="props">a named-scoped slot, {{ props.a }}</template>
    <template>hello, slot</template>
  </Hello>
</template>
```

其 render 方法内容为：

```
function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "Hello",
    {
      scopedSlots: _vm._u([
        {
          key: "default",
          fn: function() {
            return [_vm._v("hello, default slot")]
          },
          proxy: true
        },
        {
          key: "named",
          fn: function() {
            return [_vm._v("a named slot")]
          },
          proxy: true
        },
        {
          key: "scopedAndNameSlot",
          fn: function(props) {
            return [_vm._v("a named-scoped slot, " + _vm._s(props.a))]
          }
        }
      ])
    },
    [[_vm._v("hello, slot")]],
    2
  )
}
```

可以看到，通过 v-slot 指令设定的 slot 不管是一般的 slot 还是 scoped slot 都会被解析到 `vnode.data.scopedSlots` 中，区别是如果为非 scoped slot，那么生成的对应的 slots 对象有个值为 true 的 proxy 属性，而且对应的 _fn_ 比 scoped slot 而言少了参数。

上面说道 _resolveSlots_ 需要在 `_vm._c` 执行之前就将与 slots 相关的值接解析到 `vm.$slots` 和 `vm.$scopedSlots` 上的，这主要通过 _resolveSlots_ 和 _resolveScopedSlots_ 来完成。上面的 `_vm._u` 就是 resolveScopedSlots。

在 _Hello_ 组件的 `vm._init()` 内部的 `initRender(vm)` 中 `vm.$slots = resolveSlots(vm.$options._renderChildren, vm.$options._parentVnode.context)`

```
function resolveSlots(children) {
  const slots = {}

  if (children && children.length) {
    for (lei i = 0; i < children.length; i++) {
      (slots.default || (slots.default = []).push(children[i])
    }
  }

  return slots
}
```

_resolveSlots_ 的作用就是把 `vnode.children` 里的 child 依次添加到 `slots.default` 对应的数组中，然后返回 slots 对象。但是如果 scoped slots 里有 default slot 且为非 scoped slot，那么添加为 children 的 `vm.$slots.default` 会被覆盖为以 `vnode.data.scopedSlots` 里 default 对应的函数为 getter 的访问器属性。

处理 scoped slots 的过程就复杂一些，先是在 _Hello_ 组件的父组件 `vm.render` 中被 _resolveScopedSlots_ 处理为 `vnode.data.scopedSlots`；然后同样是在 `initRender(vm)` 中，`vm.$scopedSlots = emptyObject`；接着是在 _Hello_ 组件 `vm._render()` 中，`vm.$scopedSlots = normalizeScopedSlots(vm.$options._parentVnode.data.scopedSlots, vm.$slots, vm.$scopedSlots)`；最后再接上上一节的 `_vm._t` 。

```
function resolveScopedSlots(fns, res, hasDynamicKeys, contentHashKey) {
  res = res || { $stable: hasDynamicKeys }

  for (let i = 0; i < fns.length; i++) {
    const slot = fns[i]

    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys)
    } else if (slot) {
      if (slot) {
        if (slot.proxy) {
          slot.fn.proxy = true
        }
        res[slot.key] = slot.fn
      }
    }
  }

  if (contentHashKey) {
    res.$key = contentHashKey
  }

  return res
}
```

_resolveScopedSlots_ 的逻辑也很简单，将 `_vm._u` 由形如 `{ key: 'name', fn: () => {}, proxy: true }` 的对象元素组成的数组参数转换成一个 `{ name1: fn1, name2: fn2, ... }` （如果原本某个元素有 proxy 为 true 的属性，那么对应的 fn 也有相同值的属性）的对象返回，返回的对象还有个 _\$stable_ 以及可能的 _\$key_ 属性。

下面来看 _normalizeScopedSlots_，

```
function normalizeScopedSlots(slots, normalSlots, prevSlots) {
  let res
  const hasNormalSlots = Object.keys(normalSlots).length > 0
  const isStable = slots ? Boolean(slots.$stable) : !hasNormalSlots
  const isStableAndNoNormalSlots = isStable && prevSlots && prevSlots !== emptyObject && key === prevSlots.$key && !hasNormalSlots && !prevSlots.$hasNormal

  if (!slots) {
    res = {}
  } else if (slots._normalized){
    return slots._normalized
  } else if (isStableAndNoNormalSlots) {
    return prevSlots
  } else {
    res = {}

    for (let key in slots) {
      if (slots[key] && key[0] !== '$') {
        res[key] = normalizeScopedSlot(normalSlots, key, slots[key])
      }
    }
  }

  for (let key in normalSlots) {
    if (!(key in res)) {
      res[key] = proxyNormalSlot(normalSlots, key)
    }
  }

  if (slots) {
    slots._normalized = res
  }

  res.$stable = isStable
  res.$key = key
  res.$hasNormal = hasNormalSlots

  return res
}

function normalizeScopedSlot(normalSlots, key, fn) {
  const normalized = (...args) => {
    let res = args.length > 0 ? fn(...args) : fn({})

    res = res instanceof VNode ? [res] : normalizeChildren(res)

    return res
  }

  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    })
  }

  return normalized
}

```

其作用为将 `vm.$options._parentVnode.data.scopedSlots` 里对应 `fn.proxy` 为 true 的 slot 的 fn 返回的 vnode(s) 应用一下 normalizeChildren。

normalize 之后 renderSlot 里就可以通过 `this.$slots[name]` 或 `this.$scopedSlots[name]` 取得对应的 vnode(s) 了。
