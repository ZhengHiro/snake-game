<template>
  <div id="app">
    <table style="margin-top: 20px;">
      <tr>
        <td></td>
        <td v-for="user of users" :key="user.name" colspan="5">
          {{ user.name }}
        </td>
      </tr>
      <tr v-for="rowUser of users" :key="rowUser.name">
        <td>{{ rowUser.name }}</td>
        <template v-for="(colUser) of users">
          <td colspan="5" :key="colUser.name" v-if="colUser === rowUser">---</td>
          <template v-else>
            <td v-for="(n,index) in 3" :key="colUser.name + index">
              <template v-if="results[`${rowUser.name}|${colUser.name}|${n}`] === 2">胜</template>
              <template v-else-if="results[`${rowUser.name}|${colUser.name}|${n}`] === 1">平</template>
              <template v-else-if="results[`${rowUser.name}|${colUser.name}|${n}`] === 0">负</template>
              <template v-else><span @click="play(colUser.name, rowUser.name, index)">开始</span></template>
            </td>
          </template>
        </template>
      </tr>
    </table>
    <board :socket="this.socket" :gameKey="gameKey" v-if="gameKey"></board>
<!--    <chess-board v-if="histories" :histories="histories" @close="histories = null"></chess-board>-->
  </div>
</template>

<script>
  import io from 'socket.io-client';
  import Board from "./components/Board";

  export default {
    name: 'App',
    components: {Board},
    data() {
      return {
        results: {},
        users: [],
        histories: null,
        socket: null,
        gameKey: '',
      }
    },
    mounted() {
      let socket = this.socket = io("localhost:3000");
      socket.on('connect', () => {
        socket.send(JSON.stringify({ type: 'ADMIN_LOGIN', key: 'qwer1234' }));
      });

      socket.on('echoUser', (users) => {
        this.users = users;
        console.log(users);
      });
    },
    methods: {
      play(playerOne, playerTwo, index) {
        this.socket.emit('START_GAME', { playerOne, playerTwo, index }, (res) => {
          console.log(res);
          this.gameKey = `${playerOne}-${playerTwo}-${index}`;
        })
      }
    },
  }
</script>

<style>
  * {
    margin: 0;
    padding: 0;
    border: 0;
  }
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }

  table
  {
    border-collapse: collapse;
    margin: 0 auto;
    text-align: center;
  }
  table td, table th
  {
    border: 1px solid #cad9ea;
    color: #666;
    height: 30px;
    padding: 5px 12px;
  }
  table thead th
  {
    background-color: #CCE8EB;
    width: 100px;
  }
  table tr:nth-child(odd)
  {
    background: #fff;
  }
  table tr:nth-child(even)
  {
    background: #F5FAFA;
  }

  .battle-btn {
    cursor: pointer;
    padding: 5px 12px;
    background: #00A0EA;
    border-radius: 4px;
    text-align: center;
    color: #FFF;
  }
</style>
