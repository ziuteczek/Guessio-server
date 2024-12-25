const { nanoid } = require("nanoid");

const { games } = require(`${__dirname}/../server`);
const { serialize } = require("bson");

class Chat {
  messages = [];
  game;

  constructor(game) {
    this.game = game;
  }

  newMessage(text, authorID) {
    this.messages.push({
      authorID,
      text,
      time: new Date().getTime(),
    });
    this.game.updateUsers();
  }
}

class Game {
  code;
  board;
  players = new Map();
  chat = new Chat(this);

  constructor() {
    do {
      this.code = nanoid(6);
    } while (games.has(this.code));
  }

  data() {
    const gameObj = {
      board: this.board,
      type: "update",
      chat: this.chat.messages.map((msg) => ({
        time: msg.time,
        content: msg.text,
        author: this.players.get(msg.authorID).nick,
      })),
    };

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
