const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const { deserialize, serialize } = require("bson");

const { nanoid, customAlphabet } = require("nanoid");

const app = express();
const port = 4000;

const expressWs = require("express-ws")(app);

const games = new Map();

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

class Player {
  id = nanoid();
  nick;
  points = 0;
  ws;
  drawingMode = false;
  game;

  constructor(nickname, gameObj) {
    this.nick = nickname;
    this.game = gameObj;
  }
}

const nickCheck = (nick) => nick.length < 10 && nick.length > 3;
const codeCheck = (code) => code.length === 6;

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(cors());

app.route("/create-game").post((req, res) => {
  const nick = req.query.nick;

  // if (!nick) {
  //   console.log("no nick or code");
  //   res.status(400).json({
  //     status: "failed",
  //     message: "parameters not included in reqest",
  //   });
  //   res.end();
  //   return;
  // }

  // if (!nickCheck(nick)) {
  //   console.log("wrong nick");
  //   res
  //     .status(400)
  //     .json({ status: "failed", message: "parameters wrong length" });
  //   res.end();
  //   return;
  // }

  const createGame = new Game();
  games.set(createGame.code, createGame);

  const adminPlayer = new Player("admin");
  createGame.players.set(adminPlayer.id, adminPlayer);

  adminPlayer.drawingMode = true;

  res
    .status(201)
    .json({ status: "succes", userID: adminPlayer.id, code: createGame.code });
});

app.route("/create-user").post((req, res) => {
  const nick = req.query.nick;
  const code = req.query.code;

  if (!nick || !code) {
    console.log("no nick or code");
    res.status(400).json({
      status: "failed",
      message: "parameters not included in reqest",
    });
    res.end();
    return;
  }

  if (!nickCheck(nick) || !codeCheck(code)) {
    console.log("wrong nick or code length");
    res
      .status(400)
      .json({ status: "failed", message: "parameters wrong length" });
    res.end();
    return;
  }

  const userGame = games.get(code);

  if (!userGame) {
    console.log("game does not exist");
    res.status(404).json({ status: "failed", message: "game doesn't exist" });
    res.end();
    return;
  }

  const newPlayer = new Player(nick);
  userGame.players.set(newPlayer.id, newPlayer);

  res.status(201).json({ status: "succes", userID: newPlayer.id });
});

app.ws("/enter-game", (ws, req) => {
  ws.userID = req.query.userid;
  ws.gameID = req.query.code;

  console.log(ws.userID);
  console.log(ws.gameID);

  const userGame = games.get(ws.gameID);

  if (userGame === undefined) {
    console.log("no such game exist");
    ws.send(JSON.parse({ status: "failed", message: "no such game exist" }));
    ws.close();
  }

  const user = userGame.players.get(ws.userID, userGame);

  if (user === undefined) {
    console.log("no such player");
    console.log(ws.userID);
    ws.send(JSON.parse({ status: "failed", message: "no such player exist" }));
    ws.close();
  }

  user.ws = ws;

  userGame.updateUsers();

  console.log("web socket connection created");

  ws.on("message", (message) => {
    const msg = deserialize(message);

    switch (msg.type) {
      case "update":
        userGame.board = msg.boardBlob;

        userGame.updateUsers();

        break;
      default:
        console.log(msg.type);
    }
  });

  ws.on("close", () => {
    console.log("web socket connection closed");
  });
});

app.listen(port, () => console.log(`Server running on ${port}`));
