const fs = require('fs');

const readFile = function(filename) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, function(err, data) {
      if (err) {
        reject(`this is error: ${err}`);
      } else {
        resolve(data);
      }
    })
  })
}

readFile('readme').then(function(data) {
  return readFile(data.toString());
}, function(err) {
  return Promise.reject(err.toString());
}).then(function(data) {
  console.log(data.toString());
}, function(err) {
  console.log(err);
});


// const as = async function(filename) {
//   const f1 = await readFile(filename + 'a').catch(function(err) {
//     console.error(`there is something error occurring reading file ${err}`);
//     return false;
//   });
//   const f2 = await readFile(filename).catch(function(err) {
//     console.error(`there is something error occurring reading file ${err}`);
//     return false;
//   });
//   console.log(f1.toString('utf-8'));
//   console.log(f2.toString('utf-8'));
// }

// as('./readme');
// console.log('this is a piece sync code');

// const gen = function *(filename) {
//   console.log(filename);
//   const f1 = yield readFile(filename);
//   const f2 = yield readFile(filename);
//   console.log(f1.toString('utf-8'));
//   console.log(f2.toString('utf-8'));
// }

// const generator = gen('./readme');
// const result1 = generator.next();
// result1.value.then(function(data) {
//   return data;
// }, function(err) {
//   console.log(err);
// }).then(function(data) {
//   const result2 = generator.next(data);
//   result2.value.then(function(data) {
//     return data;
//   }, function(err) {
//     console.log(err);
//   }).then(function(data) {
//     generator.next(data);
//   });
// });