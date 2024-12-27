const Player = require(`${__dirname}/../game/playerClass`);
const Game = require(`${__dirname}/../game/gameClass`);

const { games } = require(`${__dirname}/../server.js`);

const nickCheck = (nick) => nick.length < 10 && nick.length > 3;

const createGame = (req, res) => {
  const nick = req.query.nick;

  if (!nick) {
    console.log("no nick or code");
    res.status(400).json({
      status: "failed",
      message: "parameters not included in reqest",
    });
    res.end();
    return;
  }

  if (!nickCheck(nick)) {
    console.log("wrong nick");
    res.status(400).json({ status: "failed", message: "parameters wrong length" });
    res.end();
    return;
  }

  const game = new Game();
  games.set(game.code, game);

  const adminPlayer = game.addPlayer(nick);

  adminPlayer.allowDrawing = true;
  adminPlayer.admin = true;

  console.log(adminPlayer.id);
  console.log(adminPlayer.code);

  res.status(201).json({ status: "succes", userID: adminPlayer.id, code: game.code });
};
module.exports = createGame;
