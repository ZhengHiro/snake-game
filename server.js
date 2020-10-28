const World = require('./World');
const storage = require('./storage');

const Koa = require('koa');
const app = new Koa();
const http = require('http');

const server = http.createServer(app.callback());
const io = require('socket.io')(server);

let users = storage.loadUsers(); // 所有用户
let adminSocket = null; // 管理员socket

// let games = {
//   '佳生测试1号-佳生测试2号-0': {
//     _worldInstance: new Maps(), // 地图实例
//     mapInfo: { width: 40, height: 40 },
//     status: 'created', // 'created', 'running', 'end'
//     winner: -1, // -1 平局  0 未决出胜负 1 playerOne赢  2 playerTwo赢
//     playerOne: '佳生测试1号',
//     playerTwo: '佳生测试2号',
//     histories: [{
//       snake1: [{x: 0}, {y: 0}],
//       snake2: [{x: 10}, {y: 10}],
//     }]
//   }
// }
let games = storage.loadGames(); // 所有正在进行的游戏

io.on('connection', function (client) {
  console.log(`[SERVER] connection()`);
  client.on('message', async function (message) {
    let data = JSON.parse(message);
    if (data.type === 'LOGIN') {
      // 登录
      let userName = data.data.name;
      console.log(`${userName}: 登录`);

      if (!users[userName]) {
        users[userName] = {};
      } else if (users[userName]['_socket']) {
        users[userName]['_socket'].disconnect(true);
      }
      users[userName]['_socket'] = client;
      echoUser(adminSocket, users);
      storage.saveUsers(users);
    } else if (data.type === 'ADMIN_LOGIN' && data.key === 'qwer1234') {
      if (adminSocket) adminSocket.disconnect(true);
      adminSocket = client;
      initAdmin(adminSocket);
      echoUser(adminSocket, users);
    }
  });
});


// admin 相关
function initAdmin(adminSocket) {
  // 开始比赛
  adminSocket.on('START_GAME', ({ playerOne, playerTwo, index, forceStart = false }, callback) => {
    let mapInfo;
    if (![0, 1, 2].includes(Number(index))) {
      return callback({ code: 400, msg: '地图不存在' });
    } else {
      if (Number(index) === 0) {
        mapInfo = { width: 10, height: 10 };
      } else if (Number(index) === 1) {
        mapInfo = { width: 10, height: 20 };
      } else if (Number(index) === 2) {
        mapInfo = { width: 20, height: 20 };
      }
    }
    if (!playerOne || !playerTwo) {
      return callback({ code: 400, msg: '用户不能为空' });
    }
    if (!users[playerOne] || !users[playerTwo]) {
      return callback({ code: 400, msg: '用户不存在' });
    }

    let gameKey = `${playerOne}-${playerTwo}-${index}`;
    if (forceStart) delete games[gameKey];
    if (games[gameKey] && games[gameKey].status !== 'end') {
      return callback({ code: 400, msg: '上轮对局未结束' });
    }

    let socketOne = users[playerOne]['_socket'];
    let socketTwo = users[playerTwo]['_socket'];

    // 根据玩家信息，生成player函数
    function getPlayer(playerIndex, playerName, socket) {
      return function(params) {
        // 佳生测试1号-佳生测试2号-0-1-1
        let actionKey = `${gameKey}-${params.round}-${playerIndex}`;
        delete params.round;

        return new Promise(resolve => {
          socket.send(JSON.stringify({
            type: 'ACTION',
            data: {
              actionKey,
              ...params
            },
          }));

          function tmp(message) {
            console.log(`${playerName}: ${message} ${actionKey}`);

            let payload = JSON.parse(message);
            let data = payload.data;
            if (payload.type === 'ACTION' && data.actionKey === actionKey) {
              resolve(data.direct);
              socket.removeListener('message', tmp);
            } else {
              console.warn(`${message} 不符合要求`);
            }
          }

          socket.on('message', tmp);
        });
      }
    }

    let game = {
      _worldInstance: null,
      mapInfo,
      status: 'created',
      winner: 0,
      playerOne,
      playerTwo,
      histories: [],
    };

    let world = new World({
      ...mapInfo,
      players: [
        getPlayer(1, playerOne, socketOne),
        getPlayer(2, playerTwo, socketTwo),
      ],
      runnerCb: () => {
        let gameStatus = world.getGameStatus();

        console.log('-----');
        console.log(gameStatus);
        console.log('-----');
        game.status = gameStatus.status;
        game.winner = gameStatus.winner;
        game.reasons = gameStatus.reasons;
        game.histories[gameStatus.round] = { snake1: gameStatus.snake1, snake2: gameStatus.snake2 };

        if (game.status === 'end') {
          echoGames(adminSocket);
          storage.saveGame(gameKey, game);
        }
        // echoGames(adminSocket, gameKey, game.getGameStatus());
      }
    });
    game._worldInstance = world;

    world.start();

    games[`${playerOne}-${playerTwo}-${index}`] = game;

    echoGames(adminSocket);
    return callback({
      code: 200,
      data: {
        tips: `${playerOne}-${playerTwo}-${index} 对局开始`
      }
    });
  });

  // 获取某个比赛详细情况
  adminSocket.on('GET_GAME_RESULT', (gameKey, callback) => {
    let game = games[gameKey];
    if (!game) return callback({ code: 400, msg: '比赛不存在' });
    if (game.status !== 'end') return callback({ code: 400, msg: '比赛未结束' });
    return callback({
      code: 200,
      data: {
        mapInfo: game.mapInfo,
        status: game.status,
        winner: game.winner,
        playerOne: game.playerOne,
        playerTwo: game.playerTwo,
        histories: game.histories,
        reasons: game.reasons
      }
    })
  });

  // 初始化就推送所有比赛
  echoGames(adminSocket);
}
function echoUser(socket, users) {
  if (!socket) return false;
  let arr = [];
  for (let key in users) {
    arr.push({
      name: key,
      score: 0,
    });
  }
  return socket.emit('echoUser', arr);
}
function echoGames(socket) { // 输出所有比赛情况
  if (!socket) return false;
  let data = {};
  for (let key of Object.keys(games)) {
    const game = games[key];
    data[key] = {
      status: game.status,
      winner: game.winner,
    }
  }
  return socket.emit('echoGames', data);
}


//
// const Router = require('koa-router');
// let router = new Router();
//
// const bodyParser = require('koa-bodyparser');
// app.use(bodyParser());

// app.use(router.routes()).use(router.allowedMethods());
server.listen(3000);
