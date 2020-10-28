let fs = require('fs');

const FOLD_NAME = './persistence';
const USERS_FILE_NAME = `${FOLD_NAME}/users.json`;
const GAME_FILE_PREFIX = `game-`;

module.exports = {
  // 持久化用户数据
  saveUsers(users) {
    if (!users) return false;
    let data = {};
    for (let key of Object.keys(users)) {
      data[key] = {};
    }

    fs.writeFileSync(USERS_FILE_NAME, JSON.stringify(data));
  },
  // 读取用户数据
  loadUsers() {
    if (fs.existsSync(USERS_FILE_NAME)) {
      let data = fs.readFileSync(USERS_FILE_NAME);
      data = data.toString();
      if (data) return JSON.parse(data);
    }
    return {};
  },
  saveGame(gameKey, game) {
    let data = Object.assign({}, game);
    delete data['_worldInstance'];
    fs.writeFileSync(`${FOLD_NAME}/${GAME_FILE_PREFIX}${gameKey}.json`, JSON.stringify(data));
  },
  loadGames() {
    let files = fs.readdirSync(FOLD_NAME);
    const games = {};
    files.forEach((filename) => {
      if (filename.includes(GAME_FILE_PREFIX)) {
        let game = fs.readFileSync(`${FOLD_NAME}/${filename}`);
        game = game.toString();
        if (!game) return ;
        let gameKey = filename.slice(GAME_FILE_PREFIX.length, -5);
        games[gameKey] = JSON.parse(game);
      }
    });
    return games;
  }
};
