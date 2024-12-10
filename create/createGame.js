const Player = require(`${__dirname}/../game/playerClass`);
const Game = require(`${__dirname}/../game/gameClass`);

const { games } = require(`${__dirname}/../server.js`);

const nickCheck = (nick) => nick.length < 10 && nick.length > 3;
const codeCheck = (code) => code.length === 6;

const createGame = (req, res) => {
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

  console.log(adminPlayer.id);
  console.log(adminPlayer.code);

  res
    .status(201)
    .json({ status: "succes", userID: adminPlayer.id, code: createGame.code });
};
module.exports = createGame;
