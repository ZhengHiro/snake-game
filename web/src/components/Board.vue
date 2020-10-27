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
                'top': rowIndex === 0,
                'left': colIndex === 0
             }"
             v-for="(point, colIndex) of row" :key="colIndex">
        </div>
      </div>
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
      }
    },
    mounted() {
      console.log(this.socket, this.gameKey);
      this.socket.on(this.gameKey, ({ maps, snake1, snake2 }) => {
        console.log(this.gameKey);
        console.log({ maps, snake1, snake2 });
        if (maps.width !== this.width || maps.height !== this.height) {
          this.initMap(maps.width, maps.height);
        }
        this.$nextTick(() => {
          this.setSnakes(snake1, snake2);
        })
      })
    },
    methods: {
      initMap(width, height) {
        this.points = [];
        this.width = width;
        this.height = height;

        let points = new Array(height);
        for (let i = 0; i < points.length; i++) {
          points[i] = new Array(width).fill(0).map(() => { return {} });
        }
        this.points = points;
      },
      setSnakes(snake1, snake2) {
        let points = this.points;

        for (let row of points) {
          for (let point of row) {
            point['firstHeader'] = false;
            point['firstBody'] = false;
            point['secondHeader'] = false;
            point['secondBody'] = false;
          }
        }
        snake1.forEach(({ x, y }, index) => {
          if (index === 0) {
            points[x][y] && (points[x][y]['firstHeader'] = true);
          } else {
            points[x][y] && (points[x][y]['firstBody'] = true);
          }
        });

        snake2.forEach(({ x, y }, index) => {
          if (index === 0) {
            points[x][y] && (points[x][y]['secondHeader'] = true);
          } else {
            points[x][y] && (points[x][y]['secondBody'] = true);
          }
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
    border-top: 1px solid #999;
  }
  .cell.left {
    border-left: 1px solid #999;
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
</style>
