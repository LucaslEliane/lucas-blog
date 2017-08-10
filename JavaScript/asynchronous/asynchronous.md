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

### generator

生成器是基于ES6的迭代器概念的一种函数，这个函数可以被暂停执行，来方便实现异步代码。

迭代器是用来对数据结构进行遍历，也就是迭代的。每次调用`next()`方法就可以让迭代器进行一步迭代。

生成器的思想和迭代器类似，当构建了一个生成器函数的时候，我们可以对这个生成器进行迭代，不过每次迭代会让函数执行到下一个关键字`yield`标记的暂停的位置。

生成器的样子如下：

```javascript
const readFile = function(filename) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
function * gen(filename) {
  const f1 = yield readFile(filename);
  const f2 = yield readFile(filename);
}
// 构建生成器
const g = gen('./readme');
// 迭代
g.next();
g.next();
g.next();
```

第一个`next()`会执行到第一个`yield`的时候暂停，来让第一个异步操作完成。

第二个`next()`会执行到第二个`yield`的时候暂停，等待第二个异步操作完成。

第三个`next()`会将函数执行完成。

如果`yield`后面跟的不是异步操作，那么会直接将同步值返回，并且仍然会暂停。

但是generator存在一个比较大的问题，就是对于现在经常使用的`Promise`需要手动进行处理，来调用`next()`函数，这也是co这种异步编程库出现的原因。

上面的生成器需要进行手动的`Promise`处理：

```javascript
const g = gen('./readme');
g.next().value.then(function(data) {
  return data.toString('utf-8');
}, function(err) {
  console.log(err);
}).then(function(data) {
  g.next(data).value.then(function(data) {
    return data.toString('utf-8');
  }, function(err) {
    console.log(err);
  }).then(function(data) {
    g.next(data);
  });
});
```

可以看到如果进行大规模的手动处理的话，会存在很大的问题，而且非常不方便，所以ES2017的预定义标准中出现了一种针对于异步编程的终极解决方案。

### async & await

async和await其实本质上就是生成器关于`Promise`的一个语法糖方案。

`async`标志类似于生成器的`*`符号，`await`类似于生成器的`yield`关键字，标记函数暂停的位置。

区别在于对于`Promise`异步，async不需要手动进行处理了，而是会自动调用`resolve`或者`reject`方法，对于异步结果进行处理，所以上面对于生成器的异步代码重写之后应该是这个样子的。

```javascript
const as = async function(filename) {
  const f1 = await readFile(filename).catch(function(err) {
    console.error(err);
    return false;
  });
  const f2 = await readFile(filename).catch(function(err) {
    console.error(err);
    return false;
  });
  console.log(f1.toString('utf-8'));
  console.log(f2.toString('utf-8'));
}
as('./readme');
```

