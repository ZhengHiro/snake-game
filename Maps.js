// import Snake from './Snake.js';
const Snake = require('./Snake.js');

class Point {
  x;
  y;
  type = 0; // 0 空地  1蛇 2蛇 3食物  4墙

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

  constructor(width = 40, height = 40) {
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

    // 目前只支持两条蛇
    this.snakes[0] = new Snake({ x: 0, y: 0 }); // 初始化蛇1
    this.snakes[1] = new Snake({ x: width - 1, y: height - 1 }); // 初始化蛇2
  }

  moveSnakes(directs, isGrow) {
    let reasons = [];
    this.snakes.forEach((snake, index) => {
      let moveRes = snake.move(directs[index], isGrow);
      if (moveRes) {
        let { newHeader, oldTail } = moveRes;
        console.log(newHeader, oldTail);
        console.log(this.width, this.height);

        // 撞墙死
        if (newHeader.x < 0 || newHeader.x >= this.width || newHeader.y < 0 || newHeader.y >= this.height) {
          snake.dead();
          reasons[index] = '撞墙死掉了';
          return;
        }

        // todo: 处理x y 坐标轴问题
        this.points[newHeader.x][newHeader.y].setType(index+1);
        if (!isGrow) {
          this.points[oldTail.x][oldTail.y].setType(0);
        }
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
            this.snakes[i].dead();
            reasons[i] = '撞到别人死掉了';
            break;
          }
        }
        if (!this.snakes[i].isAlive()) break; // 跳出外层循环
      }
    }

    let survivors = [];
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

  getMaps() {
    return this.points;
  }

  getSnakeBody(index) {
    return [].concat(this.snakes[index].getBody());
  }
}

module.exports = Maps;
