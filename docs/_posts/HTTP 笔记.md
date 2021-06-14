---
title: HTTP 笔记
categories: 
  - HTTP
tags: 
  - HTTP
sidebar: auto
author: 
  name: Kisama
  link: https://github.com/noah19846
date: 2021-06-14 17:46:19
permalink: /pages/cadb32/
---

- Q：GET 方法和 POST 方法的区别是什么？
  A：除了 POST 方法可以有 body，GET 没有 body 之外其他的基本都是语义上的区别。比如 GET 方法是「安全的」、「幂等的」、GET 方法对应的 response 默认是应该被 cache 的，而 POST 方法的 response 只有在 headers 中包含 cache-control 或 Expires header 且为合适的值时才能被 cache。

- Q：HTTP cache 是什么？如何起作用的？
  A：cache 指的是 HTTP 中定义的用来减少不必要的 message 发送和不必要的 entity 传输的一套机制，也指专门实现这种机制的服务器，也可以指与原始服务器 response 对应的 copy。cache 的机制分为两部分：expiration 和 validation，前者用于减少不必要的 message 发送，后者用于不必要的 entity 传输。expiration 的机制表现为：当客户端发送一个 request 到 cache server 时，cache server 会检查对应的 cache（假设有这样的 cache）是否是 fresh，如果是的话，直接从那个 cache 构造出对应的 response 发送给客户端。每个 cache 都有它对应的 freshness_lifetime 和 current_age，每次检验是否 fresh 时，只有当计算出来的 current_age 小于 freshness_lifetime 时，这个 cache 才会被认为是 fresh 的。其中 current_age 的算法与 origin server 的 response headers 里的 Date，Age 的值有关。freshness_lifetime 的算法则与 cache-control header 的 max-age 声明的值和 Expires header 的值有关。validation 的机制表现为：当一条 cache 过期被判定为不是 fresh 的之后，cache server 会像 origin server 重新发一条带有 if-none-match (其值来源于被 cache 的 response 的 etag header 值) 或/和 if-modified-since (其值来源于被 cache 的 response 的 last-modified header 值) 请求头的 request，origin server 会根据这两个请求头的值来决定 validation 是否通过，如果通过会给 cache 返回一个状态码为 304 的 response，收到这个 response 和 cache server 根据本地的 cache 构造出对应 response 返回给客户端；如果未通过，origin server 会返回一个新的状态码为 200 的 response 给 cache server，cache server 将这个 response 原本返回给客户端，并据此更新对应的已经不再 fresh 的 cache。

- 计算 current_age 时，cache-control: max-age=xxx 的优先级高于 Expires
- Pragma: no-cache 的作用与 cache-control: no-cache 一致，用于向后兼容。
- response header 的 cache-control 的声明：public、private、no-store、no-cache、must-validation、proxy-validation、max-age=xxx、s-maxage=xxx、no-transform、扩展
- request header 的 cache-control 的声明：no-store、no-cache、max-age、max-stale\[=xxx\]、min-fresh=xxx、only-if-cached、no-transform、扩展
- response 没有 body 的情况：1.对应 request 的 方法为 GET 或 HEADER 2.状态码 为 1xx、204、304

- Q：response 被 cache server cache 需要满足哪些条件吗？
- Q：cache-control 所有的声明可以分为几类？具体的作用分别是什么？
- Q：cache server 从 cache 中构造 response 的过程是怎样？
