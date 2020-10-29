<template>
  <div id="app">
    <rank-list :users="users"></rank-list>
    <div class="main-container">
      <table style="margin-top: 20px;">
        <tr>
          <td></td>
          <td v-for="user of users" :key="user.name" colspan="3">
            {{ user.name }}
          </td>
        </tr>
        <tr v-for="rowUser of users" :key="rowUser.name">
          <td>{{ rowUser.name }}</td>
          <template v-for="(colUser) of users">
            <td colspan="3" :key="colUser.name" v-if="colUser === rowUser">---</td>
            <template v-else>
              <td v-for="(n,index) in 3" :key="colUser.name + index">
                <template v-if="games[`${rowUser.name}-${colUser.name}-${index}`]">
                  <span>{{games[`${rowUser.name}-${colUser.name}-${index}`].statusLabel}}</span>
                  <div class="btn-list">
                    <span class="btn" @click="showGame(`${rowUser.name}-${colUser.name}-${index}`)">查看</span>
                    <span class="btn btn-danger" @click="play(rowUser.name, colUser.name, index, true)">重赛</span>
                  </div>
                </template>
                <template v-else>
                  <span>未比赛</span>
                  <div class="btn-list">
                    <span class="btn" @click="play(rowUser.name, colUser.name, index)">开始</span>
                  </div>
                </template>
              </td>
            </template>
          </template>
        </tr>
      </table>
    </div>
    <board :socket="this.socket" :gameKey="gameKey" v-if="gameKey" @close="closeBoard"></board>
<!--    <chess-board v-if="histories" :histories="histories" @close="histories = null"></chess-board>-->
  </div>
</template>

<script>
  import io from 'socket.io-client';
  import Board from "./components/Board";
  import RankList from "./components/RankList";

  export default {
    name: 'App',
    components: {RankList, Board},
    data() {
      return {
        games: {},
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
        users.forEach(user => user.score = 0);
        this.users = users;
        this.calculateResult();
        console.log(users);
      });

      socket.on('echoGames', (games) => {
        this.games = games;
        this.calculateResult();
        console.log(games);
      });
    },
    methods: {
      calculateResult() {
        this.users.forEach(user => user.score = 0);
        for (let userA of this.users) {
          for (let userB of this.users) {
            if (userA === userB) continue;
            for (let i = 0; i < 3; i++) {
              const game = this.games[`${userA.name}-${userB.name}-${i}`];
              if (!game) continue;
              if (game.status === 'running') {
                this.$set(game, 'statusLabel', '进行中');
              } else if (game.winner === -1) {
                this.$set(game, 'statusLabel', '平');
                userA.score += 1;
                userB.score += 1;
              } else if (game.winner === 1) {
                this.$set(game, 'statusLabel', '赢');
                userA.score += 2;
              } else if (game.winner === 2) {
                this.$set(game, 'statusLabel', '输');
                userB.score += 2;
              }
            }
          }
        }
      },
      play(playerOne, playerTwo, index, forceStart = false) {
        this.socket.emit('START_GAME', { playerOne, playerTwo, index, forceStart }, (res) => {
          if (res.code !== 200) {
            alert(res.msg);
          }
          // this.gameKey = `${playerOne}-${playerTwo}-${index}`;
        })
      },
      showGame(gameKey) {
        this.gameKey = gameKey;
      },
      closeBoard() {
        this.gameKey = '';
      }
    },
  }
</script>

<style >
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

  .btn {
    display: inline-block;
    border: 1px solid #CCC;
    padding: 0 4px;
    margin-right: 6px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;
  }
  .btn:last-of-type {
    margin-right: 0;
  }
  .btn:hover {
    background: #006FFF;
    border-color: #006FFF;
    color: #FFF;
  }
  .btn.btn-danger:hover {
    background: #FF5048;
    border-color: #FF5048;
    color: #FFF;
  }
  .btn-list span {

  }
</style>
