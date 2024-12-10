const { games } = require(`${__dirname}/../server`);

const Player = require(`${__dirname}/../game/playerClass`);

const nickCheck = (nick) => nick.length < 10 && nick.length > 3;
const codeCheck = (code) => code.length === 6;

const joinGame = (req, res) => {
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
};
module.exports = joinGame;
