const io = require('socket.io-client');

const socket = io('ws://127.0.0.1:3000');

socket.on('connect', () => {
  socket.send(JSON.stringify({ type: 'LOGIN', data: { name: '黑白5号' }}));
});

socket.on('message', (message) => {
  let data = JSON.parse(message);
  if (data.type === 'ACTION') {
    console.log('------');
    let points = data.data.points;
    let { width, height } = data.data.mapsInfo;
    for (let i = 0; i < height; i++) {
      let row = '';
      for (let j = 0; j < width; j++) {
        row += '|' + points[j][i].type;
      }
      console.log(row);
    }
    console.log('------');
    socket.send(JSON.stringify({
      type: 'ACTION',
      data: {
        actionKey: data.data.actionKey,
        direct: Math.floor(Math.random() * 2 + 2),
      }
    }));
  }
});

socket.on('connection', (error) => {
  console.error(error);
});
socket.on('connect_error', (error) => {
  console.error(error);
});
