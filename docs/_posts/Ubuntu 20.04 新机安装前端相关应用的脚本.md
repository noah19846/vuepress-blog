---
title: Ubuntu 20.04 新机安装前端相关应用的脚本
date: 2022-06-05 10:31:05
permalink: /pages/e6d181/
sidebar: auto
categories:
  - 笔记
tags:
  - 
---
新建一个 ubuntu 虚拟机到可以开始前端开发中间所需的基本步骤：

1. 更换系统镜像源
2. 配置 git 信息，比如 committer 信息和个人常用的 alias（zsh 的 git 插件已经有这个功能，如果使用它的话可以不用自己配置）
3. 安装 zsh 和 oh-my-zsh 以及常用的插件（由于 github 经常连不上，可以考虑 git clone 时更换 github 镜像源，但记得及时改回来）
4. 安装 nvm 以及 nodejs
5. 通过 npm 安装 yarn，配置 yarn 镜像源
6. 通过 yarn 安装 nrm，配置 npm 镜像源
7. 安装 vscode 以及常用插件

所需文件：

_source.list_，注释懒得删，这里是更换中科大的源

```
# deb cdrom:[Ubuntu 20.04.4 LTS _Focal Fossa_ - Release amd64 (20220223)]/ focal main restricted

# See http://help.ubuntu.com/community/UpgradeNotes for how to upgrade to
# newer versions of the distribution.
deb http://mirrors.ustc.edu.cn/ubuntu/ focal main restricted
# deb-src http://cn.archive.ubuntu.com/ubuntu/ focal main restricted

## Major bug fix updates produced after the final release of the
## distribution.
deb http://mirrors.ustc.edu.cn/ubuntu/ focal-updates main restricted
# deb-src http://cn.archive.ubuntu.com/ubuntu/ focal-updates main restricted

## N.B. software from this repository is ENTIRELY UNSUPPORTED by the Ubuntu
## team. Also, please note that software in universe WILL NOT receive any
## review or updates from the Ubuntu security team.
deb http://mirrors.ustc.edu.cn/ubuntu/ focal universe
# deb-src http://cn.archive.ubuntu.com/ubuntu/ focal universe
deb http://mirrors.ustc.edu.cn/ubuntu/ focal-updates universe
# deb-src http://cn.archive.ubuntu.com/ubuntu/ focal-updates universe

## N.B. software from this repository is ENTIRELY UNSUPPORTED by the Ubuntu
## team, and may not be under a free licence. Please satisfy yourself as to
## your rights to use the software. Also, please note that software in
## multiverse WILL NOT receive any review or updates from the Ubuntu
## security team.
deb http://mirrors.ustc.edu.cn/ubuntu/ focal multiverse
# deb-src http://cn.archive.ubuntu.com/ubuntu/ focal multiverse
deb http://mirrors.ustc.edu.cn/ubuntu/ focal-updates multiverse
# deb-src http://cn.archive.ubuntu.com/ubuntu/ focal-updates multiverse

## N.B. software from this repository may not have been tested as
## extensively as that contained in the main release, although it includes
## newer versions of some applications which may provide useful features.
## Also, please note that software in backports WILL NOT receive any review
## or updates from the Ubuntu security team.
deb http://mirrors.ustc.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
# deb-src http://cn.archive.ubuntu.com/ubuntu/ focal-backports main restricted universe multiverse

## Uncomment the following two lines to add software from Canonical's
## 'partner' repository.
## This software is not part of Ubuntu, but is offered by Canonical and the
## respective vendors as a service to Ubuntu users.
# deb http://archive.canonical.com/ubuntu focal partner
# deb-src http://archive.canonical.com/ubuntu focal partner

deb http://mirrors.ustc.edu.cn/ubuntu/ focal-security main restricted
# deb-src http://security.ubuntu.com/ubuntu focal-security main restricted
deb http://mirrors.ustc.edu.cn/ubuntu/ focal-security universe
# deb-src http://security.ubuntu.com/ubuntu focal-security universe
deb http://mirrors.ustc.edu.cn/ubuntu/ focal-security multiverse
# deb-src http://security.ubuntu.com/ubuntu focal-security multiverse

# This system was installed using small removable media
# (e.g. netinst, live or single CD). The matching "deb cdrom"
# entries were disabled at the end of the installation process.
# For information about how to configure apt package sources,
# see the sources.list(5) manual.
```

步骤 123 脚本

_install_zsh.sh_

```
# 更换镜像源
replace_image_src() {
  sudo mv /etc/apt/sources.list /etc/apt/sources.list.bak
  sudo cp ./sources.list /etc/apt/sources.list

  sudo apt update
  sudo apt upgrade
}

# 配置 git
config_git() {
  git config --global alias.cl clone
  git config --global alias.sw switch
  git config --global alias.ch checkout
  git config --global alias.l "log --pretty=oneline"
  git config --global alias.s status
  git config --global alias.df diff
  git config --global alias.a add
  git config --global alias.c commit
  git config --global alias.rr restore
  git config --global alias.rs reset
  git config --global alias.pl pull
  git config --global alias.ps push

  # 更换加速镜像
  git config --global url.https://kgithub.com.insteadOf https://github.com
  # 加速镜像要求
  git config --global http.version HTTP/1.1
  git config --global http.sslverify false
  # 如有影响需要及时取消
  # git config --global --unset url.https://kgithub.com.insteadOf
  # git config --global --unset http.version
  # git config --global --unset http.sslverify

  echo "git alias configured."
}

# 安装 zsh 并将当前 SHELL 切换为 zsh
install_and_config_zsh() {
  touch ~/.zshrc # 创建一个 zshrc 文件避免后续进入 zsh 的时候被回答问题的提示打断
  sudo apt install zsh

  # 安装 oh-my-zsh
  sh -c "$(curl -fsSL https://raw.kgithub.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

  # 安装插件
  git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
  git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

  # zsh 插件仓库 clone 充公后需要手动去 .zshrc 里在 plugins 字段里添加插件名（即仓库名），然后 `source ~/.zshrc` 方生效。如果不知道选什么主题好的话，可以改成 random
}

main() {
  replace_image_src
  config_git
  install_and_config_zsh
}

main

```

安装 nodejs 相关的脚本

_install_nodejs.sh_

```
# 在 zsh 中执行

# 安装 nvm
install_nvm() {
  curl -o- https://raw.kgithub.com/nvm-sh/nvm/v0.39.1/install.sh | bash
}

# 安装 nodejs v12.22.12 版本
install_nodejs() {
  source ~/.nvm/nvm.sh

  nvm install 12.22.12
  nvm use 12.22.12
}

# 安装 yarn 并配置镜像源为淘宝
install_and_config_yarn() {
  TAOBAO_REGISTRY=https://registry.npmmirror.com/

  npm install -g yarn --registry=$TAOBAO_REGISTRY
  yarn config set registry $TAOBAO_REGISTRY

  # 将 yarn 的执行路径写到 .zshrc　里
  echo 'export PATH="$PATH:${HOME}/.config/yarn/global/node_modules/.bin"' >> ~/.zshrc
  source ~/.zshrc
}

# 通过 yarn 安装 nrm，并配置镜像源为淘宝
install_and_config_nrm() {
  yarn global add nrm
  nrm use taobao
}

# 安装 vscode 以及常用插件
install_vscode_exts() {
  # vscode extensions: eslint, prettier, code spell checker, todo hilight, gitlens
  VSCODE_EXTS="dbaeumer.vscode-eslint esbenp.prettier-vscode streetsidesoftware.code-spell-checker wayou.vscode-todo-highlight eamodio.gitlens"

  echo "$VSCODE_EXTS" | tr ' ' '\n' | while read item

  do
    code --install-extension $item
  done
}

install_vscode_and_exts() {
  sudo apt install curl

  VSCODE_DOWNLOAD_URL=https://update.code.visualstudio.com/latest/linux-deb-x64/stable
  OCT_MIME=application/octet-stream

  RES_INFO=`curl $VSCODE_DOWNLOAD_URL -I -o /dev/null -s -w "%{http_code} %{url_effective} %{content_type}" -L`
  HTTP_CODE=`echo $RES_INFO | cut -d\  -f1`
  TARGET_URL=`echo $RES_INFO | cut -d\  -f2 | cut -d ? -f1`
  CONTENT_TYPE=`echo $RES_INFO | cut -d\  -f3`

  if [ $HTTP_CODE -eq 200 -a $CONTENT_TYPE==$OCT_MIME ]
    then
      # echo "downloading vscode..."
      # curl -o ~/Downloads/vscode.deb $TARGET_URL
      # sudo apt install ~/Downloads/vscode.deb

      install_vscode_exts
    else
      echo "download vscode failed."
      exit 0
  fi
}

main() {
  install_nvm
  install_nodejs
  install_and_config_yarn
  install_and_config_nrm
  # 如果是 wsl 则不必安装 vscode
  # install_vscode_and_exts

  # unset git 设置
  git config --global --unset url.https://kgithub.com.insteadOf
  git config --global --unset http.version
  git config --global --unset http.sslverify
}

main
```

执行步骤：

1. 将三个文件放在当前用户某个目录下，进入到该目录
2. 执行 `bash install_zsh.sh`，执行中会要求输入密码，以及安装 oy-my-zsh 的时候会让输入选择，选择替换 zsh 为当前用户默认 bash，安装完成后输入当前 shell 会变成 zsh，`exit` 退出，然后会继续 git clone 后面两个插件，将插件添加到 .zshrc 文件对应位置（以及修改主题）
3. 输入 `source ~/.zshrc`，重新进入 zsh
4. `zsh install_nodejs.sh`
