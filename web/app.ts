const WS_RECONNECT_COOLDOWN = 5000;

const locale = "en-US";
const dateFormat: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
};

const messageElement: HTMLInputElement = document.querySelector("#message")!;
const formElement: HTMLFormElement = document.querySelector("#sendMessage")!;

let ws = createWS();

const state = {
  running: true,
  nextReconnect: 0,
};

function createWS() {
  const ws = new WebSocket("ws://localhost:3000/Mitchel");

  ws.onopen = function () {
    appendMessage("Connection opened.");
  };

  ws.onclose = function () {
    appendMessage("Connection closed.");
    state.nextReconnect = Date.now() + WS_RECONNECT_COOLDOWN;
  };

  ws.onmessage = function (event) {
    appendMessage(event.data);
  };

  ws.onerror = function (event) {
    console.error("Socket error: ", event);
    ws.close();
  };

  return ws;
}

function appendMessage(message: string) {
  const li = document.createElement("li");
  const date = new Date().toLocaleDateString(locale, dateFormat);
  li.textContent = `${date}: ${message}`;
  document.querySelector("body")!.append(li);

  console.log(message);
}

function onSubmit(event: Event) {
  event.preventDefault();

  if (messageElement.value) {
    sendMessage(messageElement.value);
  }
}

function sendMessage(message: string) {
  ws.send(message);
}

function tick() {
  if (state.nextReconnect > 0 && Date.now() >= state.nextReconnect) {
    ws = createWS();
    state.nextReconnect = 0;
  }

  window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);

formElement.addEventListener("submit", onSubmit);
