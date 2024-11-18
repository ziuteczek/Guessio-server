"use strict";

const main = document.querySelector("main");

const getPage = async (req) => {
  try {
    const res = await fetch(req);
    const html = await res.text();
    return html;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

async function changeContent(component, e) {
  e?.preventDefault();
  component = component === "/" ? "/index" : component;

  const componentPath = `components${component}.html`;
  const html = await getPage(componentPath);

  if (html === undefined) {
    return;
  }

  window.history.pushState({ html: main.innerHTML }, "", component);
  main.innerHTML = html;
}

function loadScript(name) {
  const scriptEl = document.createElement("script");
  scriptEl.src = `js/${name}.js`;
  document.body.append(scriptEl);
}

(async function loadInitialPage() {
  const path = new URL(document.URL).pathname;
  const componentURL = path === "/" ? "/index" : path;
  const html = await getPage(`components${componentURL}.html`);

  if (html !== undefined) {
    window.history.replaceState({ html }, "", componentURL);
    main.innerHTML = html;
  }

  if (path === "/play") {
    loadScript("game");
  }

  if (path === "/join") {
    loadScript("join");
  }
})();

window.addEventListener("popstate", (e) => {
  if (e.state?.html !== "") {
    main.innerHTML = e.state.html;
  }
});
