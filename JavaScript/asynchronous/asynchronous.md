## Promise、generator和async

这三个对象或者方法都是标准为了实现更方便、实用的异步处理方法而实现的。`Promise`在一定程度上解决了回调函数嵌套调用的callback hell的问题，而后面两个方法将JavaScript的异步方案进行了类似同步方式的优化，和`Promise`结合使用可以实现更加清晰的异步代码。

### Promise

`Promise`是三者中的根本，也是基础，`Promise`是一个含有状态的对象，这个对象根据其内部操作的执行程度，来分别调用`resolve`和`reject`方法。当`new`了一个`Promise`的时候，其开始执行内部的操作，状态变更为`pending`，当异步操作执行完成之后，异步操作的状态可能是成功或者失败，对应着`Promise`的`resolve`和`reject`的状态，然后会分别调用其`then`方法中的对应的回调函数。

第一个`then`方法的调用是根据`Promise`初始化时候的处理过程进行的，而后续的`then`方法则是根据之前的返回值来确定的。

```javascript
const fs = require('fs');
const readFile = function(filename) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(err);
      }
    });
  });
}

readFile('readme').then(function(data) {
  return data;
}, function(err) {
  return err;
}).then(function(result) {
  console.log(result.toString());
});
```

上面的代码中，调用函数的时候会返回一个已经开始执行的`Promise`，之后，根据这个`Promise`的执行状态会分别调用`then`方法中的两个函数，由于两个函数的返回值都是一个同步值(也就是字面量)，这样下一个`then`方法就会将其当做一个成功的`Promise`来进行处理，类似于返回了一个`Promise.resolve()`的结果。

如果需要进行异步操作的顺序调用的话，那么需要将返回值设置为一个新的`Promise`对象，然后下面的`then`方法就会根据返回的`Promise`对象来调用`resolve`和`reject`的回调了。

```javascript
// 第一个读取的文件的内容就是第二个需要读取文件的文件名
// 这两个异步操作，必须要保证第一个异步操作完成之后再开始
// 第二次的异步操作
readFile('readme').then(function(data) {
  return readFile(data.toString());
}, function(err) {
  return Promise.reject(err.toString());
}).then(function(data) {
  console.log(data.toString());
}, function(err) {
  console.log(err);
});
// 这样就实现了两个需要顺序进行的异步操作的顺序保证
```

