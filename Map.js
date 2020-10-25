const Snake = import('./Snake.js');

class Point {
  x;
  y;
  type = 0; // 0 空地  1 蛇  2 食物   3 墙

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

export default class Map {
  width = 0;
  height = 0;

  points;
  snakes = [];

  constructor(width = 40, height = 40) {
    this.width = width;
    this.height = height;

    this.points = [];
    for (let i = 0; i < height; i++) {
      this.points[i] = [];
      for (let j = 0; j < width; j++) {
        this.points[i][j] = new Point(i, j);
      }
    }

    this.snakes[0] = new Snake(0, 0,); // 初始化蛇1
    this.snakes[1] = new Snake(width - 1, height - 1); // 初始化蛇2
  }

  moveSnakes(directs) {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.points[i][j] === 1) this.points[i][j] = 0; // 清除旧的蛇位置
      }
    }
    this.snakes.forEach((snake, index) => {
      let tmpBody = snake.move(directs[index]);
      tmpBody.forEach(({ x, y }) => {
        this.points[x][y] = 1;
      });
    });
  }
};
