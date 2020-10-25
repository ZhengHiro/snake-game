const directX = [ -1, 0, 1, 0 ];
const directY = [ 0, 1, 0, -1 ];

export default class Snake {
  body = []; // [{x: 0, y: 0}]

  constructor({ x, y }) {
    this.body.push({ x, y });
  }

  assumeMove(direct) { // 假设朝某个方向移动

  }

  move(direct) { // 朝某个方向移动
    let header = this.body[0];
    let tail = this.body[this.body.length];
    let newHeader = {
      x: header.x + directX[direct],
      y: header.y + directY[direct]
    };
    this.body.unshift(newHeader);
    this.body.pop();

    return this.body;
  }
};
