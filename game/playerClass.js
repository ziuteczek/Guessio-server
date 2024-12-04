const { nanoid } = require("nanoid");

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

module.exports = Player;  