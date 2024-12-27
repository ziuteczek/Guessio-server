const { nanoid } = require("nanoid");

const { games } = require(`${__dirname}/../server`);
const { serialize, deserialize } = require("bson");
const Player = require("./playerClass");

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
    this.game.updateAllUsers();
  }
}

class Game {
  code;
  board;
  players = new Map();
  chat = new Chat(this);
  round = {
    type: "lobby",
    endDate: new Date().getTime() + 100000,
  };

  constructor() {
    do {
      this.code = nanoid(6);
    } while (games.has(this.code));
  }

  async roundNormal(duration, painter) {
    return new Promise((resolve) => {
      painter.allowPainting = true;
      this.round = {
        type: "normal",
        endDate: new Date().getTime() + duration,
      };
      setTimeout(() => {
        painter.allowPainting = false;
        resolve();
      }, duration);
    });
  }

  updateData() {
    return {
      board: this.board,
      type: "update",
      round: this.round,
      chat: this.chat.messages.map((msg) => ({
        time: msg.time,
        content: msg.text,
        author: this.players.get(msg.authorID).nick,
      })),
      players: Array.from(this.players.values()).map((player) => ({ nick: player.nick, points: player.points })),
    };
  }

  updateAllUsers() {
    const update = this.updateData();
    const playersArr = Array.from(this.players.values()).filter((player) => player.ws);

    playersArr.forEach((player) => {
      const playerUpdate = { ...update, allowDrawing: player.allowDrawing, isAdmin: player.admin };
      console.log(playerUpdate);
      player.ws.send(serialize(playerUpdate));
    });
  }

  update(updateBSON, authorID) {
    const update = deserialize(updateBSON);

    switch (update.type) {
      case "board update":
        this.board = update.boardBlob;
        this.updateAllUsers();
        break;

      case "message":
        this.chat.newMessage(update.content, authorID);
        break;

      default:
        console.log(update.type);
    }
  }

  addPlayer(nick) {
    const newPlayer = new Player(nick, this);

    this.players.set(newPlayer.id, newPlayer);
    this.updateAllUsers();

    return newPlayer;
  }
}
module.exports = Game;
