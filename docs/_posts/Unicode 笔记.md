---
title: Unicode 笔记
date: 2021-05-13 14:40:32
categories: 
  - 编码
tags: 
  - 编码
  - Unicode
sidebar: auto
author: 
  name: Kisama
  link: https://github.com/noah19846
permalink: /pages/d88593/
---

- 什么是 Unicode：Unicode 是一个将现今世界大部分用于交流信息的字符（为组成文本的最小组成单元）映射成从 0 到 16 \* 2^16 -1 的连续自然数集合的方案，为每个字符分配的自然数即成为该字符的 code point，通常是通过以十六进制表示的数字值（带有 "U +" 前缀）来引用它们。所有的字符被分为 17 个组（一共 1114112 个，每组 65536 个），大部分常用字符基本都被分到第一组（第一组被称为 Basic Multiple Plane），该组前 128 个字符与 ASCII 码对应的字符集一一对应。所以本质上讲，Unicode 与 ASCII 码将 128 个字符映射成 0 到 127 的自然数没有什么区别，只不过较 ASCII 码而言，Unicode 的编码方案要复杂得多得多。
- 按照基本用途，1114112 个 code point 分为 7 个基本类型：

  - Graphic：字母，标记，数字，标点，符号和空格
  - Format：不可见，但会影响邻近的字符；包括行、段落分隔符
  - Control：共 _65_ 个（U+0000 到 U+001F 和 U+007F 到 U+009F 之间的 code point）
  - Private-use：用于代表私用字符的 code point，这些字符的解释未由本标准规定，并且其使用可能由合作用户之间的专用协议确定，共 _6400_ 个（U+E000 到 U+F8FF）
  - Surrogate：用于 UTF-16 编码的代理，共 _2048_ 个（U+D800 到 U+DBFF 和 U+DC00 到 U+DFFF 之间的 code point，前 1024 个称为前导代理，后 1024 个称为后尾代理）
  - Noncharacter：Unicode 标准中永久保留供内部使用的 code point，共 _66_ 个（U+FDD0 到 U+FDEF 中的 32 个加上 17 个组中每组的最后两个）
  - Reserved：保留以供将来分配，但被限制用于信息交换
- 并非所有的 code point 都被分配给了某个字符的，只有 Graphic、Format、Control 和 Private-use 几个类型的 code point 有与之对应的字符；Surrogate 和 Noncharacter 两个类型的 code point 已经被分配，但分配的对象并不是字符；Reserved 保留以供将来分配，但被限制用于信息交换。所有未分配给特定字符的 code point 均被限制用于信息交换。
- UTF-8、UTF-16、UTF-32：本质上讲，此三者与 Unicode 也无区别，都是将一个集合映射到另一个集合的方案。如果说 Unicode 的作用是 A --f--> B，其中 A 代表 Unicode 所能处理的字符集，B 代表对应的有序自然数集，f 即 Unicode，那么 B --g--> C、B --h--> D、B --l-->E 中的 g、h、l 就分别代表 UTF-8、UTF-16、UTF-32，而 C、D、E 则分别代表三者将 B（即 0 到 16 \* 2^16 -1）中的每个自然数映射成以一个或多个比特组成的序列为成员的集合，由这类集合里成员组成的信息更利于计算机处理。
- UTF-16 编码方案：将 code point 映射成一个或两个 16 bit 的序列，也就是说一个使用 UTF-16 编码的 code point 最终存到内存里的内容可能是一个 16 bit 或是 32 bit 的二进制序列：

  - 16 bit：若 code point 属于 0 ~ 65535，code point 对应的 16 bit 序列即表示该 code point
  - 32 bit：code point 超出 65535 的， 先将 code point 减去 `0x10000` 得到一个属于 `0x00000` ~ `0xFFFFF` 之间的数，高十位加上 `0xD800` 之后得到的数字对应的 16 bit 序列与低十位加上 `0xDC00` 之后得到的数字对应的 16 bit 序列即拼接成一个表示该 code point 的 32 bit 序列
- UTF-8 编码方案：将 code point 映射成一个、两个、三个或四个 8 bit 的序列，如下表所示，其中 'x' 代表 code point 对应的二进制 bit

```
   Char. number range  |        UTF-8 octet sequence
      (hexadecimal)    |              (binary)
   --------------------+---------------------------------------------
   0000 0000-0000 007F | 0xxxxxxx
   0000 0080-0000 07FF | 110xxxxx 10xxxxxx
   0000 0800-0000 FFFF | 1110xxxx 10xxxxxx 10xxxxxx
   0001 0000-0010 FFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
```

| First code point | Last code point |  Byte 1  |  Byte 2  |  Byte 3  |  Byte 4  |
| :--------------: | :-------------: | :------: | :------: | :------: | :------: |
|      U+0000      |     U+007F      | 0xxxxxxx |          |          |          |
|      U+0080      |     U+07FF      | 110xxxxx | 10xxxxxx |          |          |
|      U+0800      |     U+FFFF      | 1110xxxx | 10xxxxxx | 10xxxxxx |          |
|     U+10000      |    U+10FFFF     | 11110xxx | 10xxxxxx | 10xxxxxx | 10xxxxxx |

示例：

|                          Character                           | Binary code point |        Binary UTF-8        |              Hex UTF-8              |             |
| :----------------------------------------------------------: | :---------------: | :------------------------: | :---------------------------------: | ----------- |
|             [$](https://en.wikipedia.org/wiki/$)             |      U+0024       |          010 0100          |              00100100               | 24          |
|             [¢](https://en.wikipedia.org/wiki/¢)             |      U+00A2       |       000 1010 0010        |          11000010 10100010          | C2 A2       |
| [ह](https://en.wikipedia.org/wiki/Devanagari_(Unicode_block)) |      U+0939       |    0000 1001 0011 1001     |     11100000 10100100 10111001      | E0 A4 B9    |
|         [€](https://en.wikipedia.org/wiki/Euro_sign)         |      U+20AC       |    0010 0000 1010 1100     |     11100010 10000010 10101100      | E2 82 AC    |
|     [한](https://en.wikipedia.org/wiki/Hangul_Syllables)     |      U+D55C       |    1101 0101 0101 1100     |     11101101 10010101 10011100      | ED 95 9C    |
|           [𐍈](https://en.wikipedia.org/wiki/Hwair)           |      U+10348      | 0 0001 0000 0011 0100 1000 | 11110000 10010000 10001101 10001000 | F0 90 8D 88 |

我们称 UTF-16 编码结果中的 16 bit 以及 UTF-8 编码结果中的 8 bit 这样组成一个 code point 最终 bit 序列的单元称为 code unit。两种编码方案下，对于任意给定的 code unit，通过这个 code unit 来确定其所代表的 code point 对应的 bit 序列的边界，显然 UTF-16 比 UTF-8 要更方便一些，因为一个 16 bit 的 code unit 要么是一个代理对中的前导或后尾代理，要么不是代理，仅通过分析这个 code unit 自身就可以推断出对应 bit 序列的边界。而对于 UTF-8 的 code unit 来讲，它可能是 `0b0xxxxxxx`、`0b110xxxxx`、`0b1110xxxx` 、`0b11110xxx ` 或 `0b10xxxxxx` 五种情况中的一种，如果刚好是前四者还好，通过分析 8 bit 前的 1 的个数就能知道边界，而如果是最后一种情况就需要再往前找出 bit 序列的第一个 8 bit 才能确定边界。也就是说对于任意给定的 UTF-16  code unit，仅凭分析这个 code unit 自身就能直接确定整个 bit 序列的边界，而对于任意给定的 UTF-8  code unit，只有当这个 code unit 是某个 bit 序列的首个 bit 时才能直接确定边界。

UTF-8 较于 UTF-16 好处的地方在于它兼容 ASCII 码以及所大多数情况下占存储空间更小。
