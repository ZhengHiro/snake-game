// import Snake from './Snake.js';
const Snake = require('./Snake.js');

class Point {
  x;
  y;
  type = 0; // 0 空地 1蛇 2蛇 3石头

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getType() {
    return this.type;
  }

  setType(type) {
    this.type = type;
  }
}

class Maps {
  width = 0;
  height = 0;

  points;
  snakes = [];

  constructor(width = 40, height = 40, stones = []) {
    this.width = width;
    this.height = height;
    this.snakes = [];

    this.points = [];
    for (let i = 0; i < width; i++) {
      this.points[i] = [];
      for (let j = 0; j < height; j++) {
        this.points[i][j] = new Point(i, j);
      }
    }
    for (let { x, y } of stones) {
      if (this.points[x][y]) {
        this.points[x][y].setType(3);
      }
    }

    // 目前只支持两条蛇
    this.snakes[0] = new Snake({ x: 0, y: 0 }); // 初始化蛇1
    this.snakes[1] = new Snake({ x: width - 1, y: height - 1 }); // 初始化蛇2
    this.points[0][0].setType(1);
    this.points[width - 1][height - 1].setType(2);
  }

  moveSnakes(directs, isGrow) {
    this.snakes.forEach((snake, index) => {
      let moveRes = snake.move(directs[index], isGrow);
      if (moveRes) {
        let { newHeader, oldTail } = moveRes;
        console.log(newHeader, oldTail);
        console.log(this.width, this.height);

        if (!isGrow) {
          this.points[oldTail.x][oldTail.y].setType(0);
        }

        // 撞墙死
        if (newHeader.x < 0 || newHeader.x >= this.width || newHeader.y < 0 || newHeader.y >= this.height) {
          snake.dead('撞墙死掉了');
          return;
        }

        // 撞墙死
        if (this.points[newHeader.x][newHeader.y].type === 3) {
          snake.dead('撞石头死掉了');
          return;
        }

        this.points[newHeader.x][newHeader.y].setType(index+1);
      }
    });

    for (let i = 0; i < this.snakes.length; i++) {
      let targetSnake = this.snakes[i];
      if (!targetSnake.isAlive()) continue; // 已经死掉了

      let targetHeader = targetSnake.getHeader();

      for (let j = 0; j < this.snakes.length; j++) {
        let source = this.snakes[j];
        if (j === i) continue;

        // 是否撞其他蛇
        for (let { x, y } of source.getBody()) {
          if (targetHeader.x === x && targetHeader.y === y) {
            this.snakes[i].dead('撞到别人死掉了');
            break;
          }
        }
        if (!this.snakes[i].isAlive()) break; // 跳出外层循环
      }
    }

    let survivors = [];
    let reasons = this.snakes.map((snake) => snake.reason);
    console.log(this.snakes);
    this.snakes.forEach((snake, index) => {
      if (snake.isAlive()) survivors.push(index);
    });
    if (survivors.length === 1) {
      return {
        status: 'end',
        winner: survivors[0] + 1, // 胜者
        reasons,
      }
    } else if (survivors.length === 0) {
      return {
        status: 'end',
        winner: -1, // 平局
        reasons,
      }
    } else {
      return {
        status: 'running', // 继续进行比赛
      }
    }
  }

  getPoints() {
    return this.points;
  }

  getMapsInfo() {
    return {
      width: this.width,
      height: this.height,
    }
  }

  getSnakeBody(index) {
    return [].concat(this.snakes[index].getBody());
  }
}

module.exports = Maps;
