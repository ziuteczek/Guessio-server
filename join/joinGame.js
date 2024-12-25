const { deserialize } = require("bson");

const { games } = require(`${__dirname}/../server`);

const joinGame = (ws, req) => {
  ws.userID = req.query.userid;
  ws.gameID = req.query.code;

  console.log(ws.userID);
  console.log(ws.gameID);

  const userGame = games.get(ws.gameID);

  if (userGame === undefined) {
    console.log("no such game exist");
    ws.send(JSON.parse({ status: "failed", message: "no such game exist" }));
    ws.close();
    return;
  }

  const user = userGame.players.get(ws.userID, userGame);

  if (user === undefined) {
    console.log("no such player");
    console.log(ws.userID);
    ws.send(JSON.parse({ status: "failed", message: "no such player exist" }));
    ws.close();
    return;
  }

  user.ws = ws;
  
  console.log("users updated");
  userGame.updateUsers();

  console.log("web socket connection created");

  ws.on("message", (message) => {
    const msg = deserialize(message);

    switch (msg.type) {
      case "board update":
        userGame.board = msg.boardBlob;

        userGame.updateUsers();

        break;
      case "message":
        userGame.chat.newMessage(msg.content, ws.userID);
        console.log(userGame.chat.messages);
        break;
      default:
        console.log(msg.type);
    }
  });

  ws.on("close", () => {
    console.log("web socket connection closed");
  });
};
module.exports = joinGame;
