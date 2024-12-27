const { nanoid } = require("nanoid");

class Player {
  id;
  nick;
  ws;
  game;
  admin = false;
  points = 0;
  allowDrawing = false;

  constructor(nickname, gameObj) {
    this.nick = nickname;
    this.game = gameObj;
    this.id = nanoid();
  }
}

module.exports = Player;
