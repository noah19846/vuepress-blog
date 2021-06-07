---
title: github action 配置自动打包发布前端项目
categories:
  - github action
tags:
  - github action
  - CI/CD
sidebar: auto
author:
  name: Kisama
  link: https://github.com/noah19846
date: 2021-06-07 18:24:13
permalink: /pages/22953a/
---

## 前置条件

1. 存在一对公、私钥，公钥在远程服务器用户 A（具体用户名随意）的 ~/.ssh/authrized_key 中，本地主机可通过私钥 ssh 登录用户 A
2. 用户 A 对 /var/www/任意目录名（nginx 服务启动的根目录）有读写权限
3. 私钥保存到项目的 secret 中（最好通过文本编辑器打开，然后粘贴复制，直接 cat 粘贴复制可能会导致 "invalid format"）

## github action 操作步骤

1. 将保存在 secret 中的私钥存到环境变量（感觉好像不存应该也可以？）
2. 通过 actions/checkout 拉取代码和切换到项目根目录
3. 通过 actions/setup-node 安装 node 和 npm
4.  安装依赖，打包
5. 将存在当前环境变量的私钥通过 `echo` 命令写到 github runner 的 ~/.ssh/id_rsa 文件中（其他目录或者其文件名也可以，只不过那样的话，scp 的时候就要显示指定完整路径名），并且将远程服务器的 host 添加到 ~/.ssh/known_hosts 文件中（此举好像为了是避免在第一次 ssh 陌生服务器时，系统会询问「是否确认要与远程服务器连接」而使得后续 action 中断）
6. 通过 scp 命令将打包好的文件复制到远程服务器指定位置

## 完整 yml 文件

这里 `SSH_KEY`、`SSH_PORT`、`HOST`、`SSH_PORT`、`USERNAME`、`TARGET_DIR` 为提前在项目 secret 下配置的变量，如有需要像打包后的文件生成目录（此处是 ./docs/.vuepress/dist）也可以写进去。

```
name: Deploy to nginx
on:
  push:
    branches:
      - master
jobs:
  Build-And-Deploy:
    runs-on: ubuntu-latest
    env:
      SSH_KEY: ${{ secrets.SSH_KEY }}
    steps:
      - run: echo "🎉 The job was automatically triggered by a ${{ github.event_name }} event."
      - name: Checkout
        uses: actions/checkout@v2

      - name: Build and Deploy
        uses: actions/setup-node@v2.1.5
        with:
          node-version: '12'
      - run: npm i
      - run: npm run build
      - run: |
          mkdir -p ~/.ssh/
          echo "${SSH_KEY}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -p ${{ secrets.SSH_PORT }} ${{ secrets.HOST }} > ~/.ssh/known_hosts
          scp -r -P ${{ secrets.SSH_PORT }} ./docs/.vuepress/dist/* ${{ secrets.USERNAME }}@${{ secrets.HOST }}:${{ secrets.TARGET_DIR }}
          echo "files copied to remote server successfully."
      - run: echo "🍊 This job's status is ${{ job.status }}."
```
