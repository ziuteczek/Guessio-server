const express = require("express");
const morgan = require("morgan");
const { nanoid, customAlphabet } = require("nanoid");

const app = express();
const port = 3000;

const expressWs = require("express-ws")(app);

const games = new Map();

class Game {
  code;
  players = [];
  constructor(code) {
    this.code = code;
  }
}

class Player {
  id;
  nick;
  order;
  points = 0;
  gameCode;
  ws;

  constructor(nickname) {
    this.nick = nickname;
  }
}

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));

const sendEmptyPage = (req, res) =>
  res.sendFile(`public/empty-page.html`, { root: __dirname });

app.use(express.static("public"));

app.route("/").get(sendEmptyPage);

app.route("/index").get(sendEmptyPage);

app.route("/join").get(sendEmptyPage);

app.route("/play").get(sendEmptyPage);

app.route("/game").get(sendEmptyPage);

app.route("/lobby").get(sendEmptyPage);

app.route("/create-user").post((req, res) => {
  const nick = req.query.nick;
  const code = req.query.code;

  if (!nick || !code) {
    res.status(400).json({
      status: "failed",
      message: "parameters not included in reqest",
    });
    res.end();
    return;
  }

  if (nick.length > 10 || code.length != 6) {
    res
      .status(400)
      .json({ status: "failed", message: "parameters wrong length" });
    res.end();
    return;
  }

  const userID = nanoid();
  const gameID = nanoid();

  res.status(201).json({ status: "succes", userID, gameID });
});

app.ws("/create-game", (ws, req) => {
  ws.on("connect", () => {
    const playerNick = req.query.nick;

    const gameID = nanoid(6);
    games.set(gameID, new Player(playerNick));
  });
});

app.ws("/enter-game", (ws, req) => {
  const gameID = req.query.gameID;
  const userID = req.query.userID;

  const game = games.get(gameID);

  if (game === undefined) {
    // error game ended
    // return;
  }
});

app.listen(port, () => console.log(`Server running on ${port}`));
