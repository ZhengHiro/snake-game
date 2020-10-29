<template>
  <div class="wrap">
    <div class="container">
      <div class="row" v-for="(row, rowIndex) of points" :key="rowIndex">
        <div class="cell"
             :class="{
                'first-header': point.firstHeader,
                'first-body': point.firstBody,
                'second-header': point.secondHeader,
                'second-body': point.secondBody,
                'stone': point.isStone,
                'top': rowIndex === 0,
                'left': colIndex === 0,
                'right': colIndex === row.length - 1,
                'bottom': rowIndex === points.length - 1,
             }"
             v-for="(point, colIndex) of row" :key="colIndex">
        </div>
      </div>

      <div class="game-tips">
        <p class="player-one" v-if="playerOne">玩家1: {{ playerOne }} <span class="danger" v-if="reasons && reasons[0]">({{ reasons[0] }})</span></p>
        <p class="player-two" v-if="playerTwo">玩家2: {{ playerTwo }} <span class="danger" v-if="reasons && reasons[1]">({{ reasons[1] }})</span></p>
      </div>

      <div @click="() => this.$emit('close')" class="close-btn">关闭</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Board',
    props: {
      // histories: Array,
      gameKey: String,
      socket: Object,
    },
    data() {
      return {
        width: 0,
        height: 0,
        points: [],
        playerOne: '',
        playerTwo: '',
        timer: null,
        histories: [],
        reasons: [],
        step: 0,
      }
    },
    mounted() {
      this.socket.emit('GET_GAME_RESULT', this.gameKey, (res) => {
        console.log(res);
        if (res.code !== 200) {
          alert(res.msg);
          this.$emit('close');
        } else {
          let { mapInfo, playerOne, playerTwo, histories, reasons } = res.data;
          this.playerOne = playerOne;
          this.playerTwo = playerTwo;
          this.histories = histories;
          this.reasons = reasons;
          this.initMap(mapInfo.width, mapInfo.height, mapInfo.stones || []);
        }
      });

      this.timer = setInterval(() => {
        console.log(this.step);
        this.goStep();
      }, 33)
      // console.log(this.socket, this.gameKey);
      // this.socket.on(this.gameKey, (data) => {
      //   console.log(this.gameKey);
      //   console.log(data);
        // if (maps.width !== this.width || maps.height !== this.height) {
        //   this.initMap(maps.width, maps.height);
        // }
        // this.setSnakes(snake1, snake2);
      // })
    },
    destroyed() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    methods: {
      goStep() {
        const data = this.histories[this.step];
        if (data) {
          let { snake1, snake2 } = this.histories[this.step];
          this.step++;
          this.setSnakes(snake1, snake2);
        } else if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
      },

      initMap(width, height, stones) {
        this.points = [];
        this.width = width;
        this.height = height;

        let points = new Array(height + 2);
        for (let i = 0; i < points.length; i++) {
          points[i] = new Array(width + 2).fill(0).map(() => { return {
            firstHeader: false,
            firstBody: false,
            secondHeader: false,
            secondBody: false,
          } });
        }
        for (let { x, y } of stones) {
          points[y+1][x+1].isStone = true;
        }
        this.points = points;
      },

      setSnakes(snake1, snake2) {
        let points = this.points;

        for (let row of points) {
          for (let point of row) {
            point.firstHeader && (point.firstHeader = false);
            point.firstBody && (point.firstBody = false);
            point.secondHeader && (point.secondHeader = false);
            point.secondBody && (point.secondBody = false);
          }
        }

        snake1.forEach(({ x, y }, index) => {
          // if (x >= 0 && x <= points.length && y >= 0 && y < points[0].length) {
            if (index === 0) {
              points[y + 1][x + 1]['firstHeader'] = true;
              // this.$set(points[y + 1][x + 1], 'firstHeader', true);
            } else {
              points[y + 1][x + 1]['firstBody'] = true;
              // this.$set(points[y + 1][x + 1], 'firstBody', true);
            }
          // }
        });

        snake2.forEach(({ x, y }, index) => {
          // if (x >= 0 && x <= points.length && y >= 0 && y < points[0].length) {
            if (index === 0) {
              points[y + 1][x + 1]['secondHeader'] = true;
              // this.$set(points[y + 1][x + 1], 'secondHeader', true);
            } else {
              points[y + 1][x + 1]['secondBody'] = true;
              // this.$set(points[y + 1][x + 1], 'secondBody', true);
            }
          // }
        });
      }
    }
  }
</script>

<style scoped>
  .wrap {
    width: 100vw;
    height: 100vh;
    background: RGBA(0,0,0,0.4);
    position: fixed;
    top: 0;
    left: 0;
  }
  .container {
    padding: 20px;
    display: inline-block;
    background: #FFF;
    border-radius: 4px;
    margin: 100px auto 0;
  }
  .row {
    height: 14px;
  }
  .cell {
    width: 14px;
    height: 14px;
    border-right: 1px solid #999;
    border-bottom: 1px solid #999;
    display: inline-block;
    position: relative;
  }
  .cell.top {
    border-top: 1px dotted transparent;
    border-right: 1px dotted transparent;
  }
  .cell.left {
    border-left: 1px dotted transparent;
    border-bottom: 1px dotted transparent;
  }
  .cell.bottom {
    border-bottom: 1px dotted transparent;
    border-right: 1px dotted transparent;
  }
  .cell.right {
    border-right: 1px dotted transparent;
    border-bottom: 1px dotted transparent;
  }
  .cell.first-header {
    background: #006FFF;
  }
  .cell.first-body {
    background: #00e0ff;
  }
  .cell.second-header {
    background: #FF7E44;
  }
  .cell.second-body {
    background: #FFD08C;
  }
  .cell.stone {
    background: green;
  }
  .cell.stone.first-header,
  .cell.stone.second-header,
  .cell.first-header.first-body,
  .cell.first-header.second-header,
  .cell.first-header.second-body,
  .cell.first-body.second-header,
  .cell.first-body.second-body,
  .cell.second-header.second-body,
  .danger {
    color: red;
  }

  .game-tips {
    text-align: left;
    font-size: 14px;
    position: relative;
  }
  .game-tips p {
    margin-top: 5px;
  }
  .game-tips .player-one {
    color: #006FFF;
  }
  .game-tips .player-two {
    color: #FF7E44;
  }

  .close-btn {
    margin-top: 10px;
    display: inline-block;
    border: 1px solid #CCC;
    padding: 0 4px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;
  }
</style>
