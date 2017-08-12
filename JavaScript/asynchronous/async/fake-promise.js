var FPromise = (function() {
  // 保存状态和当前Promise操作得到的值，无论是成功还是失败
  const promiseStatusSymbol = Symbol('PromiseStatus');
  const promiseValueSymbol = Symbol('PromiseValue');
  const STATUS = {
    PENDING: 'PENDING',
    FULFILLED: 'FULFILLED',
    REJECTED: 'REJECTED'
  }
  const transition = function(status) {
    return (value) => {
      this[promiseValueSymbol] = value;
      setStatus.call(this, status);
    }
  }
  /** 
    * 对于状态的改变进行控制，类似于存取器的效果。
    * 如果状态从 PENDING --> FULFILLED，则调用链式的下一个onFulfilled函数
    * 如果状态从 PENDING --> REJECTED， 则调用链式的下一个onRejected函数
    *
    * @returns void
    */
  const setStatus = function(status) {
    this[promiseStatusSymbol] = status;
    if (status === STATUS.FULFILLED) {
      this.deps.resolver && this.deps.resolver();
    } else if (status === STATUS.REJECTED) {
      this.deps.rejecter && this.deps.rejecter();
    }
  }
  const FPromise = function(resolver) {
    if (typeof resolver !== 'function') {
      throw new TypeError(`parameter 1 must be a function, but get a ${typeof func}`);
    }
    if (!(this instanceof FPromise)) {
      return new FPromise(resolver);
    }
    this[promiseStatusSymbol] = STATUS.PENDING;
    this[promiseValueSymbol] = [];
    this.deps = {};
    resolver(
      transition.call(this, STATUS.FULFILLED),
      transition.call(this, STATUS.REJECTED)
    );
  }
  FPromise.prototype.then = function(onFulfilled, onRejected) {
    const self = this;
    return FPromise(function(resolve, reject) {
      const callback = function() {
        const resolveValue = onFulfilled(self[promiseValueSymbol]);
        // 这里是对于当返回值是一个thenable对象的时候，
        // 需要对其进行特殊处理，直接调用它的then方法来
        // 获取一个返回值
        if (resolveValue && typeof resolveValue.then === 'function') {
          resolveValue.then(function(data) {
            resolve(data);
          }, function(err) {
            reject(err);
          })
        } else {
          // 注意，这里是then方法进行链式调用的连接点
          // 当初始化状态或者上一次Promise的状态发生改变的时候
          // 这里会通过调用当前Promise成功的方法，来进行当前Promise的状态改变
          // 以及调用链式的下个Promise的回调
          resolve(resolveValue);
        }
      }
      const errCallback = function() {
        const rejectValue = onRejected(self[promiseValueSymbol]);
        // 这里是和上面是一致的
        reject(rejectValue);
      }
      // 这里是对当前Promise状态的处理，如果上一个Promise在执行then方法之前就已经
      // 完成了，那么下一个Promise对应的回调应该直接执行
      if (self[promiseStatusSymbol] === STATUS.FULFILLED) {
        return callback();
      } else if (self[promiseStatusSymbol] === STATUS.REJECTED) {
        return errCallback();
      } else if (self[promiseStatusSymbol] === STATUS.PENDING) {
        self.deps.resolver = callback;
        self.deps.rejecter = errCallback;
      }
    })
  }
  FPromise.resolve = function(obj) {
    if (obj && typeof obj === 'function') {

    }
  }

  return FPromise;
})();

const fs = require('fs');

var p1 = new FPromise(function(resolve, reject){
  fs.readFile('./readme', function(err, data) {
    if (err) {
      reject(err.toString());
    } else {
      resolve(data.toString());
    }
  });
}).then(function(data) {
  console.log(data);
  return data;
}, function(err) {
  console.log(err);
}).then(function(data) {
  console.log(data);
})