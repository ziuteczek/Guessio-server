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

app.use(express.static("public"));

app.use(cors());

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

  if (nick.length > 10 || code.length != 6 || nick.length < 3) {
    console.log("wrong nick or code length");
    res
      .status(400)
      .json({ status: "failed", message: "parameters wrong length" });
    res.end();
    return;
  }

  if (!games.has(code)) {
    console.log("wrong nick or code length");
    res.status(404).json({ status: "failed", message: "game doesn't exist" });
    res.end();
  }

  const userID = nanoid();

  res.status(201).json({ status: "succes", userID });
});

app.ws("/enter-game", (ws, req) => {
  console.log("web socket connection created");

  ws.userID = req.query.userid;
  ws.gameID = req.query.code;

  console.log(ws.userID);
  console.log(ws.gameID);
});

app.listen(port, () => console.log(`Server running on ${port}`));
