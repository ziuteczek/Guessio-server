const { deserialize } = require("bson");

const { games } = require(`${__dirname}/../server`);

const joinGame = (ws, req) => {
  const userID = req.query.userid;
  const gameID = req.query.code;

  console.log(userID);
  console.log(gameID);

  const userGame = games.get(gameID);

  if (!userGame) {
    console.log("no such game exist");
    ws.send(JSON.parse({ status: "failed", message: "no such game exist" }));
    ws.close();
    return;
  }

  const user = userGame.players.get(userID, userGame);

  if (!user) {
    console.log("no such player");
    console.log(userID);
    ws.send(JSON.parse({ status: "failed", message: "no such player exist" }));
    ws.close();
    return;
  }

  user.ws = ws;

  if (userGame.round.type === "lobby") {
    user.allowDrawing = true;
  }

  userGame.updateAllUsers();

  console.log("web socket connection created");

  ws.on("message", (message) => userGame.update(message, user));

  ws.on("close", () => {
    console.log("web socket connection closed");
  });
};
module.exports = joinGame;
