"use strict";

const form = document.querySelector("form");

const getGameData = async (code, nick) => {
  try {
    const gameData = fetch(`/enter-game?code=${code}&nick=${nick}`);
    return gameData;
  } catch {
    return false;
  }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formInput = new FormData(form);

  const nick = formInput.get("nick").replaceAll(" ", "-");
  const code = formInput.get("code");

  if (nick && code) {
    // show error
    return;
  }

  if (nick.length < 3 && code.length !== 6) {
    //show  error
    return;
  }

  const gameData = getGameData(code, nick);

  if (!getGameData) {
    //show error
    return;
  }
});
