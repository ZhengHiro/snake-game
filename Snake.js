const directY = [ 0, -1, 0, 1, 0 ];
const directX = [ 0, 0, 1, 0, -1 ];

class Snake {
  body = []; // [{x: 0, y: 0}]
  status = 'alive';

  constructor({ x, y }) {
    this.body.push({ x, y });
  }

  move(direct, isGrow) { // 朝某个方向移动
    if (!this.isAlive()) return false; // 死掉就不能动了

    let header = this.body[0];
    let oldTail = this.body[this.body.length - 1];
    let newHeader = {
      x: header.x + directX[direct],
      y: header.y + directY[direct]
    };

    // 自己撞自己
    for (let { x, y } of this.body) {
      if (newHeader.x === x && newHeader.y === y) {
        this.dead();
        return false;
      }
    }

    this.body.unshift(newHeader);
    if (!isGrow) {
      this.body.pop();
    }

    return { newHeader, oldTail };
  }

  dead() {
    this.status = 'dead';
  }

  isAlive() {
    return this.status === 'alive';
  }

  getHeader() {
    return this.body[0];
  }

  getBody() {
    return this.body;
  }
}

module.exports = Snake;
