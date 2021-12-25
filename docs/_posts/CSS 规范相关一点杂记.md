---
title: CSS 规范相关一点杂记
date: 2021-12-25 18:02:42
permalink: /pages/11554b/
sidebar: auto
categories:
  - 笔记
tags:
  - 
---
## 规范本身相关

- 制定规范的工作由一个叫 W3C 的组织承担
- 即便是那些与规范有关联的文档，也不一定就是标准，从规范文档到最终称为推荐标准，中间会经过一系列流程，从最初的 Draft 状态到最终 Recommendation 状态
- 而且已经是 Recommendation 状态的也不一定就是一成不变，随着 Web 的发展，后续可能会被别的规范所更新
- 在 CSS3 及其以前，CSS 的规范都是作为一个整体统一演进，比如 CSS2 到 CSS3 即是 CSS 从 level 2 更新到 level 3，但从那以后 CSS 规范被分为不同的模块独立更新，所以从此便没有 CSS level 4 一说，有的只是 CSS module level
- 一般 W3C 会在每年年末的时候发布一个关于当年 CSS 规范更新工作的 snapshot，通过这个总览一些相关的信息

### css current work

https://www.w3.org/Style/CSS/current-work

### How to Read W3C Specs

https://alistapart.com/article/readspec/

### Understanding the CSS Specifications

https://www.w3.org/Style/CSS/read

## Visual Formatting Model 相关

- CSS 按照一系列特定的规则将 由 element 和 text 组成的 DOM tree 转换成 box tree，这些特定规则就是所谓的 visual formatting model。DOM 上需要在浏览器上渲染出来的东西都对应 box tree 上的某个（或些） box
- 一个 element 可能会创建多个 box，比如 display 值为 list-item 的会创建两个 box，其中包含子 box 的那个被称为 principal box
- 引用一个 box 的 CSS 某个属性，即是指创建它的那个 element 对应的 CSS 属性
- 浏览器的 media type 是 screen，除此之前了 CSS 规范还包含其他的 CSS 属性，比如 print、tty 等其他各式 media type
- 暂时只考虑 media type 为 screen 的浏览器，对应的 root element 则指 html 元素

### 概念

#### Display 属性的值

实际上目前 box 的 display 属性值都是缩写，各种值其实蕴含 inner display type 和 outer display type 两种，outer display type 则分为 block 和 inline 两种（不考虑 run-in），它的取值决定了**它自身**是参与怎样的 formatting context 在其 containing block 中进行 layout 的；而 inner display type 就分好多种了，比如 table、flex、flow 等，它的取值决定了**其包含的内容**在其内部是以何种规则进行 layout 的。平时写的 display 值为 block、flex、inline 等其实都是只指明了一种 type 的缩写，只需要只定义一种是因为另一种 type 已经由 CSS 规范规定好，比如 block 值实际的意义是 inner type 为 flow 且 outer type 为 block，而 flex 的值意义为 inner type 为 flex 且 outer type 为 block。

#### Block-level box

outer display type 为 block 的 box 就是 block-level box

#### Inline-level box

outer display type 为 inline 的 box 就是 inline-level box

#### Flow-layout

在不指定特殊的 display 值时，一般 box （由 element 创建，而每个 element 都有对应的默认 display 值）所包含的内容在该 box 中就是按照 block-level box 从上到下、inline-level 从左到右的规则进行 layout，这种规则就很形象地被称之为 flow-layout

#### Block container

如果一个 box 满足：其内容只包含参与 block formatting context(BFC) 或只包含 inline formatting context(IFC) 的 box，那么这个 box 就是一个 block container。比如

```
<div id=div1>
  <div id=div2>
    xx
  	<div id=div3>
      1234
    </div>
    yy
    <div id="div4" style="display: flex;"></div>
  </div>
</div>
```

中 div1、div2 和 div3 都是一个 block container，div 1 和 div2 只包含参与 BFC 的 （anonymouse）Box，div3 只包含参与 IFC 的 box；而 div4 则不是一个 block container，因为它包含的 box 参与的 formatting context 是 flex formatting context(FFC)。

A：其实 block container 可以差不多理解成 inner display type 为 flow 或 flow-root 的 box？

#### Formatting Context（FC）

可以联想成一个由某些共同遵守特定 layout 规则的 box 组成的一个结界，结界内的 layout 的结果不会影响结界外的。比如同一个 BFC 内的 box 要遵循垂直方向 margin 重叠的规则，假设相邻两个 box1、box2 参与同一个 BFC，box1 的后代 box1-1 参与的也是这个 BFC，那么 box1 和 box1-1 在应用垂直 margin 重叠的规则后产生的布局结果还会继续与 box2 应用垂直 margin 重叠规则；而如果 box1 为 box1-1 生成了一个 BFC 那么，box1 和 box1-1 便不会应用同一个 BFC 内的垂直 margin 重叠的规则了，因为它们属于两个不同的 BFC（即便看起来 BFC1 像是 BFC 的「子结界」）。Formatting context 由 box 生成，满足不了同条件时生成不同的 formatting context，除上面说的 BFC、IFC、FFC 以外还有 grid formatting context(GFC)、ruby formatting context(RFC)等。

#### BFC

如果一个 Block-level box 遵循的是 flow-layout 规则，那么这个 box 一定参与某个 BFC。应该差不多也可以等价为：如果一个 Block-level box 的父 box 的 inner display type 是 flow 或 flow-root，那么这个 box 一定参与某个 BFC。

- 一个 block container 可以为其子 box 创建一个新的 BFC 供它们 layout，也可以让其子 box 与其在同一个 BFC 中 layout

- 根元素 html 就属于一个初始化的 BFC，如果一个 document 对应的 box tree 在 layout 时没有创建任何新的 BFC，可以想见，所有的 box 都参与这个 BFC

- 创建 BFC 情形（包括但可能不仅限于）：

  - 如果一个 block container 其本身所参与的 FC 不是 BFC（比如某个其父 Box 的 inner display type 为 flex 的 box），那么它会为其子 box 创建新的 BFC

  - 如果一个 box 满足以下条件之一：

    - 由 float 或绝对定位的 element 创建的 box

    - 是 block container 但非 block-level box

    - 同时是 block container 和 block-level box 但其 overflow 属性不为 visible

      那么这个 box 会为其子 box 创建新的 BFC

#### IFC

类似 BFC，如果一个 inline-level 的父 box 的 inner display type 是 flow 或 flow-root，那么这个 box 一定参与某个 IFC。

#### 其他 FC

某个 box 的 inner display type 不为 flow 或 flow-root，那么这个 box 就可能为其子 box 创建与其 inner display type 对应的 FC。比如 display: flex; 的 box，其子 box 参与一个 FFC，display: grid; 的 box，其子 box 参与一个 GFC。

#### Containing block

一个矩形，是一个 box 在 layout 时计算位置相关数据参照的「坐标系」，矩形的左上角是原点。通常是一个 box 其父 box 的 content box 所对应的矩形，参与绝对定位的 box 例外。与 html 所参与的初始 BFC 类似，html 的 containing block 是 viewport 对应的那个矩形，被称为 initial containing block。

## 心得

英文文档困难的地方就在于概念不太好把握，感觉 visual foramtting model 相关的核心概念主要是：

- Box：与 Dom tree 中的 element 或 text 对应
- Formatting conntext：box layout 时需要遵循的规则
- Containing block：box layout 时计算位置参照的坐标系

还有就是理解树形结构相关的东西：

- 其中的枝干节点一般都承担两种角色，作为上一层节点的子，和作为下一层节点的父，就像 box 的 outer display type 和 inner display type，如果不能意识到这一点，在辨析 block container 和 block-level box 的概念时可能会云里雾里
- 找到「无中生有」的东西，比如 initial containing block 和为根元素 layout 创建的那个初始 BFC
