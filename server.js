const World = require('./World');

const Koa = require('koa');
const app = new Koa();
const http = require('http');

const server = http.createServer(app.callback());
const io = require('socket.io')(server);

let users = {}; // 所有用户
let adminSocket = null; // 管理员socket
let games = {}; // 所有正在进行的游戏

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
  adminSocket.on('START_GAME', ({ playerOne, playerTwo, index }, callback) => {
    if ([0, 1, 2].includes(Number(index))) {

    }
    if (!playerOne || !playerTwo) {
      return callback({ code: 400, msg: '用户不能为空' });
    }
    if (!users[playerOne] || !users[playerTwo]) {
      return callback({ code: 400, msg: '用户不存在' });
    }
    if (games[`${playerOne}-${playerTwo}-${index}`] && games[`${playerOne}-${playerTwo}-${index}`].getStatus() !== 'end') {
      return callback({ code: 400, msg: '上轮对局未结束' });
    }

    let socketOne = users[playerOne]['_socket'];
    let socketTwo = users[playerTwo]['_socket'];

    let game = new World({
      players: [
        function(params) {
          return new Promise(resolve => {
            let randomKey = Math.random().toString(36).slice(2);
            socketOne.send(JSON.stringify({
              type: 'ACTION',
              data: {
                randomKey,
                ...params
              },
            }));

            function tmp(message) {
              console.log(`${playerOne}: ${message}  ${randomKey}`);

              let payload = JSON.parse(message);
              let data = payload.data;
              if (payload.type === 'ACTION' && data.randomKey === randomKey) {
                resolve(data.direct);
                socketOne.removeListener('message', tmp);
              } else {
                console.warn(`${message} 不符合要求`);
              }
            }

            socketOne.on('message', tmp);
          })
        },
        function(params) {
          return new Promise(resolve => {
            let randomKey = Math.random().toString(36).slice(2);
            socketTwo.send(JSON.stringify({
              type: 'ACTION',
              data: {
                randomKey,
                ...params
              },
            }));

            function tmp(message) {
              console.log(`${playerTwo}: ${message}  ${randomKey}`);

              let payload = JSON.parse(message);
              let data = payload.data;
              if (payload.type === 'ACTION' && data.randomKey === randomKey) {
                resolve(data.direct);
                socketTwo.removeListener('message', tmp);
              } else {
                console.warn(`${message} 不符合要求`)
              }
            }

            socketTwo.on('message', tmp);
          })
        },
      ],
      runnerCb: () => {
        echoGames(adminSocket, `${playerOne}-${playerTwo}-${index}`, game.getGameStatus());
      }
    });
    game.start();
    games[`${playerOne}-${playerTwo}-${index}`] = game;
    echoGames(adminSocket, `${playerOne}-${playerTwo}-${index}`, game.getGameStatus());

    return callback({
      code: 200,
      data: {
        tips: `${playerOne}-${playerTwo}-${index} 对局开始`
      }
    });
  });
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
function echoGames(socket, gameKey, data) {
  if (!socket) return false;
  console.log(gameKey, data);
  return socket.emit(gameKey, data);
}




const Router = require('koa-router');
let router = new Router();

const bodyParser = require('koa-bodyparser');
app.use(bodyParser());

// router.post('/start-game', async ( ctx ) => {
//   let { playerOne, playerTwo } = ctx.request.body;
//   if (!playerOne || !playerTwo) {
//     return ctx.body = { code: 400, msg: '用户不能为空' };
//   }
//   if (!users[playerOne] || !users[playerTwo]) {
//     return ctx.body = { code: 400, msg: '用户不存在' };
//   }
//   if (games[`${playerOne}-${playerOne}`] && games[`${playerOne}-${playerOne}`].getStatus() !== 'end') {
//     return ctx.body = { code: 400, msg: '上轮对局未结束' };
//   }
//
//   let socketOne = users[playerOne]['_socket'];
//   let socketTwo = users[playerTwo]['_socket'];
//
//   let game = new World({
//     players: [
//       function(params) {
//         return new Promise(resolve => {
//           let randomKey = Math.random().toString(36).slice(2);
//           socketOne.send(JSON.stringify({
//             type: 'ACTION',
//             data: {
//               randomKey,
//               ...params
//             },
//           }));
//
//           function tmp(message) {
//             console.log(`${playerOne}: ${message}  ${randomKey}`);
//
//             let payload = JSON.parse(message);
//             let data = payload.data;
//             if (payload.type === 'ACTION' && data.randomKey === randomKey) {
//               resolve(data.direct);
//               socketOne.removeListener('message', tmp);
//             } else {
//               console.warn(`${message} 不符合要求`);
//             }
//           }
//
//           socketOne.on('message', tmp);
//         })
//       },
//       function(params) {
//         return new Promise(resolve => {
//           let randomKey = Math.random().toString(36).slice(2);
//           socketTwo.send(JSON.stringify({
//             type: 'ACTION',
//             data: {
//               randomKey,
//               ...params
//             },
//           }));
//
//           function tmp(message) {
//             console.log(`${playerTwo}: ${message}  ${randomKey}`);
//
//             let payload = JSON.parse(message);
//             let data = payload.data;
//             if (payload.type === 'ACTION' && data.randomKey === randomKey) {
//               resolve(data.direct);
//               socketTwo.removeListener('message', tmp);
//             } else {
//               console.warn(`${message} 不符合要求`)
//             }
//           }
//
//           socketTwo.on('message', tmp);
//         })
//       },
//     ]
//   });
//   game.start();
//   games[`${playerOne}-${playerOne}`] = game;
//
//   ctx.body = {
//     code: 200,
//     data: {
//       tips: `${playerOne}-${playerOne} 对局开始`
//     }
//   };
// });

app.use(router.routes()).use(router.allowedMethods());
server.listen(3000);
