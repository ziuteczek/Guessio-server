const { deserialize } = require("bson");

const Player = require(`${__dirname}/../game/gameClass.js`);
const Game = require(`${__dirname}/../game/gameClass`)

const {games} = require(`${__dirname}/../server`)


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
}
module.exports = joinGame;