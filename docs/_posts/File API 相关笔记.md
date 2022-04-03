---
title: File API 相关笔记
date: 2022-04-03 10:06:46
permalink: /pages/c23c17/
sidebar: auto
categories:
  - 笔记
tags:
  - 
---
## 概念

- buffer：指的是内存里用于临时存储数据的区域。当数据生产者和消费者处理数据的速率不一致时，便需要 buffer，当然，这只是用途的应用之一。无论如何，其本质就是内存里的一段区域，我们可以对之进行读、写
- ArrayBuffer：JavaScript 里的一种对象类型，用于创建固定长度原始数据缓冲区。比如代码 `new ArrayBuffer(8)` 就创建一个 ArrayBuffer 实例，对应一个长度为 8 byte 的 buffer，但是 ArrayBuffer 实例本身没有提供读、写 buffer 的途径
- TypedArray：JavaScript 中一系列的对象类型（比如 _Uint8Array_、_Int16Array_ 等）的统称，这些对象类型对应的对象内部都关联一个 ArrayBuffer 实例，TypedArray 实例则可以对由它们创建的 buffer 进行读写，直接像操作数组一样，通过下标赋值、取值
- DataView: 与 TypedArray 类似，是 JavaScript 的另一个提供读写 buffer 底层接口的对象类型，其对 buffer 的读写不用关注代码所运行的平台的大、小端类型

TypedArray 和 DataView 实例都与一个 ArrayBuffer 实例相关联，每个 ArrayBuffer 实例都对应一个特定字节数的 buffer，但 ArrayBuffer 实例本身没有接口去读写这些 buffer，TypedArray 和 DataView 实例便提供了途径去读写，但针对不同类型的数据（比如操作一个 ASCII 码字符串就可以使用 Uint8Array，而对一些范围在 0 到 65535 的整数就可以用 Uint16Array），开发者可以依据自己的需求使用不同的 TypedArray。

总而言之，在 JavaScript 中只要是读写 buffer 的必定离不开某个 ArrayBuffer 实例。

## Blob 和 File

这两个都是浏览器提供的用于存储二进制数据的 API，其中 _File_ 继承自 _Blob_，都可以通过各自实例的 _.arrayBuffer()_ 方法返回一个 resolve 对应二进制数据的 Promise。

### Blob

全称 _Binary Large Object_，Blob() 构造函数以一个由 ArrayBuffer，TypedArray, DataView, Blob, USVString 实例为元素的数组和一个选传的 options 对象为参数，返回一个 blob 对象。属性/方法：type, size, slice(), arrayBuffer(), text(), stream()。

### File

File() 构造函数接受两个必传参数，和一个选传 option 参数，第一个参数与 Blob() 构造函数一致，第二个参数为文件名称，生成一个 File 实例，File 继承 Blob，所以共享 Blob 实例的属性/方法。与 Blob 实例不同的是，File 实例多了文件名称 _name_ 和文件最后修改时间 _lastModified_ 的属性。

## 使用 Blob（和 File） 实例里的数据

主要是通过 _FileReader_ 实例和 _URL.createObjectURL_ 两种途径:

- FileReader 实例：实例有 _readAsDataURL_、_readAsArrayBuffer_、_readAsBinaryString_、_readAsText_ 四个将 Blob 读取为不同格式数据的方法，其中 readAsDataURL 则是将 Blob 读取为一个行内的 _data:_ scheme 的 url 串；readAsBinaryString 则是读取为原始二进制数据；而 读取为 ArrayBuffer 和 Text 两种类型的数据 Blob 本身也有对应的异步 API。FileReader 读取 Blob 是通过事件的机制来完成的，因为它本身就是继承自 EventTarget，读取的过程中会触发不同的事件，比如 progress 事件，显然与 Blob 本身提供的异步 API 相比 FileReader 提供的 API 要繁琐一些，但是其功能也更丰富
- URL.createObjectURL：这主要是用于将 Blob 转换成定位到浏览器内部的某个资源的 _blob:_ scheme 的 url 串，比如用于图片展示、文档下载等，在展示完对应的资源后，还可以调用 _Object.revokeObjectURL(url)_ 来释放内存

除了上述两个方法以外，还可以调用 `new Response(blob)` 来生成一个 Response 实例，然后调用实例的方法来消费 blob 里的数据。

## 应用

两个 MIME type

- application/octet-stream：octet 的意思是一个 8 bit 的组。一个 HTTP response header 里有 `Content-Type: application/octet-stream`，即表明对应的 content 是一个二进制流
- multipart/form-data：表示 content 是一个 HTML Form 类型

第一个 MIME type 多见于前端下载某个文件，后端返回这个文件的二进制流给前端，此时前端就可以通过 `new Blob([binary])` 来将之存到一个 blob 对象里，然后将之转换成 _blob:_ 下载。

第二个 MIME type 多见与前端向后端服务上传某个文件，对应的 File 实例被 append 到某个 FormData 实例，然后被 post 到后端服务，此时的 Content-Type 就是 _multipart/form-data_。与之相似的还有个 _application/x-www-form-urlencoded_，除非是需要发送大的二进制数据，否则不需要用 _multipart/form-data_（因为当 FormData 有很多个 field 时，每个 filed 都会有的 boundary 会增加 payload），而发送大的二进制数据也不应该用 _application/x-www-form-urlencoded_，因为对于非字母和数字的 string 会被 encode 成 `%HH` 的格式，等于增加了两倍的 payload。

突然想到之前下载文件时，对应的后端返回的 response 都不像寻常接口那样返回一个将真实数据包裹一层的 json，而是直接将下载的数据以 application/octet-stream 返回，现在终于知道原因：二进制的数据不适合放在 json 里。当然，理论上非要放的话，将之先转换成 binary string 然后放进去应该也不是不可，但这样的话应该是不是也会出现像把二进制数据以 _application/x-www-form-urlencoded_ 的格式放在 FormData 里一样会被 encode 然后产生额外的 payload。

既然前端可以将二进制数据以 _multipart/form-data_ 的形式发送给后端，那反过来，后端应该可以在下载文件时将对应的二进制数据以 _multipart/form-data_ 的形式返回给前端，试了下确实是可以的：

创建一个 test.js 文件，同目录下放置一个 p.jpeg 图片

```JavaScript
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const FormData = require('form-data')
const cors = require('cors')

const buffer = fs.readFileSync('./p.jpeg')
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/img', function (req, res) {
  const form = new FormData()

  form.append('code', 200)
  form.append('msg', 'success')
  // 不带 filename 浏览器 fetch 后调用 formData 会报错
  form.append('img', buffer, { type: 'image/jpeg', filename: 'p.jpeg' })
  res.setHeader('Content-Type', 'multipart/form-data; boundary='+form.getBoundary());

  form.pipe(res);
})

app.listen(3030, '0.0.0.0')
console.log('Listening on port 3030...')

```

node ./test.js 文件启动服务，然后在一个打开本地 localhost（比如本地其他端口开启跑一个 vue 的项目） 的浏览器页面的控制台下输入：

`fetch('http://localhost:3030/img').then(res => res.formData()).then(d => console.log([...d.values()]))`

就可以看到 `['200', 'success', File]` 的打印，其中最后一个就是后端返回的文件。
