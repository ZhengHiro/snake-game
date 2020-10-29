// import Maps from './Maps.js';
const Maps = require('./Maps.js');

class World {
  status = 'created'; // created  running  end
  winner = 0; // 0 未决出胜者  -1 平局  1 玩家1胜  2 玩家2胜
  round = 0; // 轮次
  reasons = null; // 结束原因
  stones = []; // 石头

  constructor({ width, height, stones, timeout = 3000, growStep = 3, players, runnerCb }) {
    this.maps = new Maps(width, height, stones);

    this.timeout = timeout; // 超时时间
    this.runnerCb = runnerCb; // 每轮runner后回调
    this.players = players; // 玩家列表
    this.growStep = growStep; // 多少步成长
    this.stones = stones;
    // this.players = [
    //   function() {
    //     return new Promise(resolve => {
    //       setTimeout(() => {
    //         resolve(2);
    //       }, 1000);
    //     })
    //   },
    //   function() {
    //     return new Promise(resolve => {
    //       setTimeout(() => {
    //         resolve(4);
    //       }, 4000);
    //     })
    //   },
    // ];
  }

  getGameStatus() {
    return {
      stones: this.stones,
      status: this.status,
      winner: this.winner,
      round: this.round,
      snake1: this.maps.getSnakeBody(0),
      snake2: this.maps.getSnakeBody(1),
      reasons: this.reasons,
    }
  }

  // 控制超时，handle为一个玩家promise
  async getPlayerStep(handle) {
    return await Promise.race([
      new Promise((resolve, reject) => {
        handle.then(direct => {
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
    this.round++;
    let res = await Promise.allSettled([
      this.getPlayerStep(this.players[0]({
        round: this.round,
        mapsInfo: this.maps.getMapsInfo(),
        points: this.maps.getPoints(),
        body: this.maps.getSnakeBody(0),
        otherSnake: this.maps.getSnakeBody(1),
      })),
      this.getPlayerStep(this.players[1]({
        round: this.round,
        mapsInfo: this.maps.getMapsInfo(),
        points: this.maps.getPoints(),
        body: this.maps.getSnakeBody(1),
        otherSnake: this.maps.getSnakeBody(0),
      })),
    ]);

    let result;
    if (res[0].status === 'rejected' && res[1].status === 'rejected') {
      result = { status: 'end', winner: -1, reasons: [res[0].reason, res[1].reason]}; // 平局
    } else if (res[0].status === 'rejected') {
      result = { status: 'end', winner: 1, reasons: [res[0].reason, '']}; // 玩家1胜
    } else if (res[1].status === 'rejected') {
      result = { status: 'end', winner: 2, reasons: ['', res[1].reason]}; // 玩家2胜
    } else {
      let directs = res.map(data => data.value);

      let isGrow = !(this.round % this.growStep);
      result = this.maps.moveSnakes(directs, isGrow);
    }

    if (!result || result.status === 'end') {
      console.log(result);
      this.status = 'end';
      this.winner = result.winner;
      this.reasons = result.reasons;
      this.runnerCb();
      return result;
    }

    this.runnerCb();
    this.runner();
  }

  start() {
    this.status = 'running';
    this.runnerCb();
    this.runner();
  }
}



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

module.exports = World;
