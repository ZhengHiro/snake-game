const io = require('socket.io-client');

const socket = io('ws://127.0.0.1:3000');

socket.on('connect', () => {
  socket.send(JSON.stringify({ type: 'LOGIN', data: { name: '郑佳生2号' }}));
});

socket.on('message', (message) => {
  let data = JSON.parse(message);
  if (data.type === 'ACTION') {
    console.log(data.data.body);
    socket.send(JSON.stringify({
      type: 'ACTION',
      data: {
        actionKey: data.data.actionKey,
        direct: Math.round(Math.random()) ? 1 : 4,
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
