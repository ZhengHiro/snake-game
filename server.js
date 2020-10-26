const Koa = require('koa');
const app = new Koa();
const http = require('http');
const socket = require('socket.io');

const server = http.createServer(app.callback());
const io = socket(server);

let users = {};

io.on('connection', function (client) {
  console.log(`[SERVER] connection()`);
  client.on('message', async function (message) {
    let data = JSON.parse(message);
    if (data.type === 'REGISTER') {
      let userName = data.data.name;
      if (users[userName]) userName += '_' + Date.now();
      users[userName] = {};
    }
  });


});


app.use(async ctx => {
  ctx.body = 'Hello World';
});
app.listen(3000);
