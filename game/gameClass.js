const { nanoid } = require("nanoid");

const { games } = require(`${__dirname}/../server`);
const { serialize } = require("bson");
class Game {
  code;
  players = new Map();
  board;

  constructor() {
    do {
      this.code = nanoid(6);
    } while (games.has(this.code));
  }

  data() {
    const gameObj = {};

    gameObj.board = this.board;
    gameObj.type = "update";

    gameObj.players = Array.from(this.players.values()).map((player) => ({
      nick: player.nick,
      points: player.points,
    }));

    return gameObj;
  }

  updateUsers(exclude = []) {
    const update = this.data();

    const playerIT = this.players.values();

    for (const player of playerIT) {
      if (exclude.includes(player.id)) {
        continue;
      }

      update.drawingMode = player.drawingMode;

      player.ws.send(serialize(update));
    }
  }
}
module.exports = Game;
