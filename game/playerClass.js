const { nanoid } = require("nanoid");

class Player {
  id;
  nick;
  points = 0;
  ws;
  drawingMode = false;
  game;

  constructor(nickname, gameObj) {
    this.nick = nickname;
    this.game = gameObj;
    this.id = nanoid();
    return this.id;
  }
}

module.exports = Player;
