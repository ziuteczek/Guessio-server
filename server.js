const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const { nanoid, customAlphabet } = require("nanoid");

const app = express();
const port = 4000;

const expressWs = require("express-ws")(app);

const games = new Map();

class Game {
  code;
  players = new Map();
  board = "";

  data() {
    const gameObj = { board: this.board };

    gameObj.players = Array.from(this.players.values).map((player) => ({
      nick: player.nick,
      points: player.points,
    }));

    return gameObj;
  }

  updateUsers(exclude = []) {
    const playerIT = this.players.values();
    const currentData = JSON.stringify(this.data());

    for (const player of playerIT) {
      if (exclude.includes(player.id)) {
        continue;
      }

      player.ws.send();
    }
  }

  constructor() {
    do {
      this.code = nanoid(6);
    } while (games.has(this.code));
  }
}

class Player {
  id = "2137" /*nanoid()*/;
  nick;
  points = 0;
  ws;
  currentPainter = false;

  constructor(nickname) {
    this.nick = nickname;
  }
}

games.set("123456", new Game());
const g = games.get("123456");
g.players.set("2137", new Player("ziutek"));

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

  // if (!games.has(code)) {
  //   console.log("game does not exist");
  //   res.status(404).json({ status: "failed", message: "game doesn't exist" });
  //   res.end();
  // }

  const userID = nanoid();

  res.status(201).json({ status: "succes", userID });
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

  const user = userGame.players.get(ws.userID);

  if (user === undefined) {
    console.log("no such player");
    ws.send(JSON.parse({ status: "failed", message: "no such player exist" }));
    ws.close();
  }

  user.ws = ws;

  console.log("web socket connection created");

  ws.on("message", (message) => {
    const msg = JSON.parse(message);

    switch (msg.type) {
      case "board update":
        if (user.currentPainter) {
          break;
        }

        userGame.board = msg.boardBlob;
        userGame.updateUsers(["2137"]);

        break;
      default:
        console.log(msg.type);
    }
  });
});

app.listen(port, () => console.log(`Server running on ${port}`));
