const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const games = new Map();

module.exports = { games };

const joinGame = require("./join/joinGame");

const createGame = require("./create/createGame");
const createUser = require("./create/createUser");

const app = express();
const port = 4000;

const expressWs = require("express-ws")(app);

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(cors());

app.route("/create-game").post(createGame);

app.route("/create-user").post(createUser);

app.ws("/enter-game", joinGame);

app.listen(port, () => console.log(`Server running on ${port}`));
