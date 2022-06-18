---
title: git 笔记
date: 2022-05-28 16:44:12
permalink: /pages/88f810/
sidebar: auto
categories:
  - 笔记
tags:
  - Git
---

## git 笔记

一个目录中包含名为 _.git_ 的目录（同时这个目录里需要存在些特定的东西）时，即表示这个目录正被 git 管理，_.git_ 目录包含的所有东西即为对应的 repository。当我们在某个目录下执行 `git init` 后，命令造成的结果就是为这个目录生成一个空的 repository，之后所有的 commit 都会被记录在 _.git_ 目录中。一个刚刚初始化的 _.git_ 目录包含 _HEAD_、_description_、_config_ 三个文件和 _objects_、_refs_、_hooks_、_info_ 四个目录，这里主要需要了解的是 HEAD、objects 和 refs。其中 HEAD 文件是一个文本文件，里面存储的是当前所在的 branch，可以通过 `cat .git/HEAD` 直接写查看它的内容：_ref: refs/heads/master_，表示当前正处于 master branch，可以说 HEAD 就是指向当前 branch 的一个 reference。而 refs 目录则是保存 branch 和 tag 等相关信息的地方，其中 branch 的信息保存在 _refs/heads_ 目录下，一个 branch 就对应一个文本文件，文件的内容是一个 40 个字符的 hash 串（git 中生成 hash 的算法是 SHA-1），对应某个 commit，也即这个 branch 当前最新的一次 commit 的 id。比如上面 `refs/heads/master` 的即代表 master branch，如果新建一个 test branch，那么对应的在 `refs/heads` 目录下就会生成一个 test 文件。所以，所谓的 **Branch** 本质上就是一个指向某个 commit 的 reference（这个 reference 的形式是一个 hash）。同样，**Tag** 也是一个 reference，它的形式也是一个 hash，作为字符串存储在 _refs/tag/{tag-name}_ 文件中，但是这个 hash 或如同 branch 一样指向一个 _commit object_，或指向一个包含某个 commit object 的 _tag object_。所以这保存 branch 和 tag 相关信息的目录名为 refs。

所以，branch 和 tag 以及 HEAD 都是指向某个 commit 的 reference。

上面提到 commit object 和 tag object，这两个东西存在 objects 目录下，除此之外还有对应某个具体文件的 blob object 和描述一组文件的 tree object。这些 object 都是二进制文件（区别于文本文件）。它们在 objects 中存储的形式为：以某个 object 所存储的内容本身对应的 40 位 hash 前两位为目录名，以剩下的 38 为为文件名存在目录下。比如一个 hash 为 ead7ca9f7ab0f7b8fae3eccae01f245edc95bc0c 的 object 对应的文件为 `objects/ea/d7ca9f7ab0f7b8fae3eccae01f245edc95bc0c`，可以通过 `git cat-file -p ead7ca9f7ab0f7b8fae3eccae01f245edc95bc0c` 来查看文件的实际内容，objects 中的所有 object 都可以同个这种方式查看。比如通过 cat `.git/HEAD` 可以找到对应的 commit 的 hash，然后再通过 `git cat-file -p {实际 commit-hash}` 就可以查看 commit 究竟是何物：

```
tree c150e44e1fdbddbf4c764a9e403a5978764a4971
parent 1e838aa2565f5844c95a4184f6d40df4bef64572
author xxx <xxx@gmail.com> 1653719967 +0800
committer yyy <yyy@gmail.com> 1653719967 +0800

test
```

- tree：当前 commit 的 snapshot（本质是一个 tree object） 的 hash
- parent: 当前 commit 上一个 commit 的 hash
- commit author
- committer
- commit message

利用同样的方式，我们可以看看 tree object 的内容：

```
100644 blob 3c3629e647f5ddf82548912e337bea9826b434af   .gitignore
040000 tree 0d2ff273d5e76e104618e7908222e4d35ff1e05a   hi
100644 blob de939122727d80fdd377ffda8b4cf5e788f126bc   index.js
100644 blob 2897e323d35108b98bbe777b0124ed061d75b960   p.jpeg
100644 blob 4ee68f1dcfcf218e153a399959dac8ef095f94af   package-lock.json
100644 blob f2095a8bc39ee0ecbc0c5dfaedf64c358fb0ec25   package.json
100644 blob 5dc1ae17337df915b749a8451bd44b9b7ec40224   server.cert
100644 blob 193afbf91a7cc740f737c866c969c2b11d79e865   server.key
```

tree object 里包含 blob object、tree object，这是很自然的事，tree 里面不只包含 blob 还包含嵌套的 tree，就跟目录里除了文件只还有有目录一样。第一列是类型对应的 code，第二列是类型，第三列是对应 object 的 hash，最后一列是 object 名。

blob object 就不用通过这个命令看了。

最后再看下 tag object。Tag 其实分为 lightweight tag 和 annotated tag，前者由 `git tag xxx` 创建，后者由 `git tag -a xxx -m "yyy"` 创建。这也是造成上面说的 tag 可能是直接指向某个 commit 或通过某个指向某个 tag object 而间接指向某个 commit 的原因。现在创建一个 annotated tag，然后通过 `git cat-file -p {hash}` 可查看其内容：

```
object c2073552557463a4c73cf9bf9087251ae371db61
type commit
tag v1.2
tagger yelqgd <yelqgd@gmail.com> 1653723380 +0800

test annotated tag
```

c2073552557463a4c73cf9bf9087251ae371db61 便是此 annotated tag 指向的 commit。

所以 commit 就是一个由与此 commit 对应的 snapshot reference 和前一个 commit reference 以及其他一些信息组成的对象。通过 snapshot reference，git 可以还原出对应 commit 提交时工作区的文件的全貌（前提是所有 hash 对应的 object 都未丢失）；通过 parent reference 可以找出完整的 commit 链。

以上内容为 https://git-scm.com/book/en/v2 书籍的翻阅笔记。

## 其他的一些问题

### core.autocrlf 到底是怎么回事

为了统一换行符（windows 系统是 CRLF，linux 系统是 LF），即存储到 .git 目录下的文件都是用统一的换行符，git 有一个 _core.autocrlf_ 的配置，取值为：

- true：推荐为 windows 系统默认配置，含义包括，
  1. 当依据某个 snapshot 从 .git 目录下 checkout 出所有与之对应的文件时，不管那些文件在 .git 目录中的换行符是什么，都统一转换为 CRLF 保存在 working directory；
  2. 反之，当把 working directory 的文件 commit 到 .git 目录时，不管 working directory 的文件是以采取何种换行符，都将之转换成 LF
- false：什么转换也不做，即 .git 目录下的文件是什么换行符，checkout 到 working directory 时就是什么换行符，反过来也是一样
- input：只做上面值为 _input_ 时两个转换中的第 1 个转换

### git 常见撤销操作

- working directory 内：`git restore <file>`
- staged area -> working directory：`git restore --stage <file>`
- repository -> staged area：`git reset --soft HEAD^`
- repository 中多个 commit 合并成一个：`git rebase -i HEAD~{n}`，n 为以之为 base 的那个 commit 到 git history 中最近的那个 commit 的距离，比如历史有 a, b, c 三个 commit，其中以 c 这个 commit 为 base 那么 n 的值就取 2，然后可以把 a，b 两个 commit 合并成一个（操作是 pick a，squash b）；如果想要把 c 连同 a，b 一起都合并成一个，那么在 c 之前必须存在一个 d，因为 rebase 的前提必须是存在一个 base
- remote history 回滚：`git revert [commitId]`

## 其他疑问

### stash reference 指向的 commit 为何会有多个 parent

stash 不仅要 stash working directory 和 stage 里的改动（此时会创建一个 commit），甚至还要 stash untracked files 的改动（此时也会创建一个 commit），所以 stash 时会创建多个 commit，因此 stash reference 指向的 commit 里也就有了多个 parent。

实际上一次 stash 最少会创建 2 个 commit，暂存 working directory 和 stage 里的一个 commit1，stash 本身对应的一个 commit3，如果 stage 了 untracked 的 file，那么还会创建一个 commit2，其中，commit 3 以 commit0、commit1、commit2 为 parent，commit1 和 commit2 以 commit0 为 parent（commit0 为 history 中最近的那个 commit）。

TODO:

- stash area、working directory、index(aka stage area)、local repository、remote repository 等概念的理解
