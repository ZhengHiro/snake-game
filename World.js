// import Maps from './Maps.js';
const Maps = require('./Maps.js');

class World {
  constructor({ width, height, timeout = 3000 }) {
    this.maps = new Maps(40, 40);
    this.players = [
      function() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(2);
          }, 1000);
        })
      },
      function() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(4);
          }, 4000);
        })
      },
    ];
    this.timeout = timeout; // 3秒后超时
  }

  async getPlayerStep(handle) {
    return await Promise.race([
      new Promise((resolve, reject) => {
        handle().then(direct => {
          if (![1, 2, 3, 4].includes(Number(direct))) {
            let error = new Error('错误方向');
            error.name = 'errorDirect';
            reject(error);
          } else {
            resolve(Number(direct));
          }
        });
      }),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          let error = new Error('超时');
          error.name = 'timeout';
          reject(error);
        }, this.timeout);
      })
    ]);
  }

  async runner() {
    let res = await Promise.allSettled([
      this.getPlayerStep(this.players[0]),
      this.getPlayerStep(this.players[1])
    ]);

    let result;
    if (res[0].status === 'rejected' && res[1].status === 'rejected') {
      result = { status: 'end', winner: -1, reasons: [res[0].reason, res[1].reason]};
    } else if (res[0].status === 'rejected') {
      result = { status: 'end', winner: 1, reasons: [res[0].reason, '']};
    } else if (res[1].status === 'rejected') {
      result = { status: 'end', winner: 0, reasons: [res[1].reason, '']};
    } else {
      let directs = res.map(data => data.value);
      result = this.maps.moveSnakes(directs);
    }

    if (!result || result.status === 'end') {
      console.log(result);
      return result;
    }

    this.runner();
  }

  start() {
    this.runner();
  }
};


// polyfill Promise allSettled
Promise.allSettled = Promise.allSettled || function (arr) {
  var P = this;
  return new P(function(resolve,reject) {
    if(Object.prototype.toString.call(arr) !== '[object Array]') {
      return reject(new TypeError(typeof arr + ' ' + arr +
        ' ' +' is not iterable(cannot read property Symbol(Symbol.iterator))'));
    }
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var arrCount = args.length;

    function resolvePromise(index, value) {
      if(typeof value === 'object') {
        var then = value.then;
        if(typeof then === 'function'){
          then.call(value,function(val) {
            args[index] = { status: 'fulfilled', value: val};
            if(--arrCount === 0) {
              resolve(args);
            }
          }, function(e) {
            args[index] = { status: 'rejected', reason: e };
            if(--arrCount === 0) {
              resolve(args);
            }
          })
        }
      }
    }

    for(var i = 0; i < args.length; i++){
      resolvePromise(i, args[i]);
    }
  })
}


let world = new World({ timeout: 3000 });
world.start();
