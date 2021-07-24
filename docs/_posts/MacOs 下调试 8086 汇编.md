---
title: MacOs 下调试 8086 汇编
categories:
  - 汇编
tags:
  - 汇编
  - 8086
sidebar: auto
author:
  name: Kisama
  link: https://github.com/noah19846
date: 2021-07-24 11:59:59
permalink: /pages/492d5d/
---

## 所需工具

- x86 DOS 模拟器：dosbox
- DOS 上运行调试工具：DEBUG.EXE
- 汇编器（链接器）：DOS 上运行的 MASM.EXE、LINK.EXE 或者直接使用 MacOs 自带的 nasm

## dosbox 配置

1. 去 [https://www.dosbox.com/download.php?main=1](https://www.dosbox.com/download.php?main=1) 下载对应 dmg 文件
2. 点击，运行里面的 dosbox，弹出一个窗口
3. 打开 `~/Library/Preferences/DOSBox 0.74-3-3 Preferences` 文件，在文件末尾 \[autoexec\] 下添加

```
mount C: ~/dosbox
C:
```

不加上面两个命令的话，每次都要重复输入。挂载目录可按照自己喜好来选，配置文件名中的 `0.74-3-3` 可能会因实际的 dosbox 软件版本不同而有所差异。

4. 创建挂载目录 dosbox（第 3 步配置文件添加的命令中的挂载目录）
5. 将 DEBUG.EXE、MASM.EXE、LINK.EXE 等可执行文件丢到 dosbox 目录，如果使用的是 MacOs 自带的 nasm 汇编器，那么 DEBUG.EXE 和 MASM.EXE 就不需要了，编译过程在 MacOS 的 shell 里完成就行
6. 重新打开 dosbox

之后通过汇编器生成的 EXE 文件都让它生成到 `~/dosbox` 目录下，然后使用 `debug filename.exe` 命令便可以愉快地开始调试了。

## 相关工具下载链接

[https://pan.baidu.com/s/1M9PlJ6NTyC0lXgR7pr4tnQ](https://pan.baidu.com/s/1M9PlJ6NTyC0lXgR7pr4tnQ) 提取码: v4a4
