---
title: Promise 简单实现
date: 2022-04-17 12:06:56
permalink: /pages/fe5871/
sidebar: auto
categories:
  - 笔记
tags:
  -
---

原理：

- 每个 promise 实例有 value，status，cbs 属性，其中 value 用于存储 resolve 或 reject 时的值，status 保存当前 promise 的状态，初始为 pending，cbs 为一个订阅当前 promise 实例状态的回调数组（初始为空），因为一个 promise 实例可多次调用 then 或 catch
- 创建一个新的 promise 时，初始化三个属性，以及将 \_resolve 和 \_reject 传给 new Promise 的参数函数当参数
- \_resolve 和 \_reject 的处理非 promise 和非 thenable 以外的值逻辑大体一致，都是 setTimeout 后将当前的 promise 实例状态和值更新，以及查看是否有后续的 promise 订阅，有则依次执行对应回调，然后将回调队列置为空；\_reject 函数多出来的逻辑是如果没有订阅则执行 `throw value`。回调队列为空的情况是，promise 状态变化时，还未有对之进行 then 或 catch 的调用
- then 的逻辑：无论如何都其返回值都是一个新的 promise 实例。查看当前状态，如果不是 pending 则说明 promise 状态已经改变，然后根据对应的状态返回的新的 promise 实例的构造函数中执行 resolve 或 reject `this.value`。如果是 pending，则说明需要订阅，则在返回的新 promise 实例的构造函数中生成一个函数，并将之添加到订阅的那个 promise 实例的 cbs 中，这个函数会在被订阅的 promise 实例状态发生变化时触发触发，函数内部会根据被订阅的 promise 实例的状态调用 resolve 或 reject

注意的点：

- setTimeout 放在哪里合适
- 如何保证调用 `then(fulfill, reject)` fulfill 中 throw 的 error 能传到 reject 中
- 如何保证链式调用过程中每个 promise reject 或 resolve 的 value 得到正常消费和传递
- 未被 catch 的 error 应该如何处理，throw error 的动作放在哪里合适
- resolve 如何处理 pending 状态的 promise 和 thenable 的值

核心原理大体如上所言，其余不足的地方应该大多能算作是健壮性的问题，比如处理 xxx 情况。下面是一个极简实现：

```JavaScript
const PENDING_STATUS = 'pending'
const FULFILLED_STATUS = 'fulfilled'
const REJECTED_STATUS = 'rejected'
const identity = v => v
const thrower = v => {
  throw v
}
const _nextTick = setTimeout
const isThenable = value =>
  value && Object.prototype.toString.call(value['then']) === '[object Function]'

function _resolve(value) {
  let realValue
  let realStatus = FULFILLED_STATUS

  if (value instanceof PromisE) {
    realValue = value.value

    if (value.status === REJECTED_STATUS) {
      realStatus = REJECTED_STATUS
    } else {
      value.cbs.push((value, status) => {
        if (status === FULFILLED_STATUS) {
          _resolve.call(this, value, FULFILLED_STATUS)
        } else if (status === REJECTED_STATUS) {
          _reject.call(this, value, REJECTED_STATUS)
        }
      })

      return
    }
  } else if (isThenable(value)) {
    const p = new PromisE((resolve, reject) =>
      _nextTick(() => value.then(resolve, reject))
    )

    p.cbs.push((value, status) => {
      if (status === FULFILLED_STATUS) {
        _resolve.call(this, value, FULFILLED_STATUS)
      } else if (status === REJECTED_STATUS) {
        _reject.call(this, value, REJECTED_STATUS)
      }
    })

    return
  } else {
    realValue = value
  }

  _nextTick(() => {
    if (this.status !== PENDING_STATUS) {
      // 已经 resolve 过
      return
    }

    this.value = realValue
    this.status = realStatus

    if (this.cbs.length) {
      this.cbs.forEach(cb => cb(realValue, realStatus))
      this.cbs = []
    }
  })
}

function _reject(value) {
  let realValue

  if (value instanceof PromisE) {
    realValue = value.value
    if (value.status === PENDING_STATUS) {
      value.cbs.push(_reject.bind(this))
      return
    }
  } else {
    realValue = value
  }

  _nextTick(() => {
    if (this.status !== PENDING_STATUS) {
      // 已经 resolve 过
      return
    }

    this.value = realValue
    this.status = REJECTED_STATUS

    if (this.cbs.length) {
      this.cbs.forEach(cb => cb(realValue, REJECTED_STATUS))
      this.cbs = []
    } else {
      throw realValue
    }
  })
}

class PromisE {
  constructor(func = identity) {
    this.status = PENDING_STATUS
    this.value = void 0
    this.cbs = []

    func(_resolve.bind(this), _reject.bind(this))
  }

  then(onFulfilled, onRejected) {
    onFulfilled = onFulfilled instanceof Function ? onFulfilled : identity
    onRejected = onRejected instanceof Function ? onRejected : thrower

    if (this.status === FULFILLED_STATUS) {
      return new PromisE((resolve, reject) => {
        const func = () => {
          try {
            resolve(onFulfilled(this.value))
          } catch (error) {
            try {
              resolve(onRejected(error))
            } catch (error) {
              reject(error)
            }
          }
        }

        func()
      })
    }

    if (this.status === REJECTED_STATUS) {
      return new PromisE((resolve, reject) => {
        const func = () => {
          try {
            resolve(onRejected(this.value))
          } catch (error) {
            reject(error)
          }
        }

        func()
      })
    }

    return new PromisE((resolve, reject) => {
      const func = (value, status) => {
        if (status === FULFILLED_STATUS) {
          try {
            resolve(onFulfilled(value))
          } catch (error) {
            try {
              resolve(onRejected(error))
            } catch (error) {
              reject(error)
            }
          }
        } else if (status === REJECTED_STATUS) {
          try {
            resolve(onRejected(value))
          } catch (error) {
            reject(error)
          }
        }
      }

      this.cbs.push(func)
    })
  }

  catch(onRejected) {
    return this.then(void 0, onRejected)
  }

  static resolve(value) {
    if (value instanceof PromisE) {
      return value
    }

    return new PromisE(resolve => resolve(value))
  }

  static reject(error) {
    return new PromisE((_, reject) => reject(error))
  }
}
```
