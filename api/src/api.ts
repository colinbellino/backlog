import * as http from "http";
import * as WebSocket from "ws";

const API_HOSTNAME = "127.0.0.1";
const API_PORT = 4000;
const WS_PORT = 4001;

const wss = new WebSocket.Server({ port: WS_PORT });

const dummyMessages = [
  "Morbi et neque iaculis, ultricies nisl et, posuere arcu.",
  "Nam vulputate eget nisl tempus elementum.",
  "Fusce laoreet scelerisque odio quis venenatis.",
  "Ut nec metus neque.",
  "Aenean commodo mauris et ante luctus viverra.",
  "Aliquam in leo vestibulum, iaculis ex sed, laoreet eros.",
  "Vivamus aliquam ex eget tortor posuere, commodo fermentum dolor congue.",
  "Proin sodales pulvinar mauris.",
  "Morbi fringilla porttitor finibus.",
  "Donec ipsum elit, suscipit auctor tortor sit amet, eleifend facilisis augue.",
  "Mauris condimentum justo vel viverra aliquet.",
  "Morbi quis leo purus.",
  "Sed justo eros, pretium quis ligula ac, consequat tempus mauris.",
  "Suspendisse potenti.",
  "Aenean congue est nec nisi facilisis, molestie congue enim auctor.",
  "Cras vulputate mi nec felis tempor condimentum.",
  "Aliquam a aliquam eros.",
  "Praesent nec tortor sit amet nisi lobortis facilisis.",
  "Maecenas scelerisque dui id nibh porttitor, eu porta lectus volutpat.",
  "Mauris hendrerit quam nunc, id imperdiet magna maximus non.",
  "Etiam auctor, velit et laoreet hendrerit, erat metus rhoncus felis, nec lacinia erat augue non sem.",
  "Ut ac posuere justo.",
  "Fusce aliquam pretium elit eu laoreet.",
  "Curabitur rutrum sagittis magna at posuere.",
];

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    broadcastToAll(message.toString());
  });
});

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/json");

  if (req.url == "/test-message") {
    broadcastToAll(
      dummyMessages[Math.floor(Math.random() * dummyMessages.length)]!
    );

    res.end(`{ "message": "Message broadcasted to all clients!" }`);
    return;
  }

  if (req.url == "/test-binary") {
    const array = new Float32Array(5);
    for (var i = 0; i < array.length; ++i) {
      array[i] = i + 1;
    }

    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(array, { binary: true });
      }
    });
    res.end(`{ "message": "Message broadcasted to all clients!" }`);
    return;
  }

  if (req.url == "/test-json") {
    const json = {
      type: dummyMessages[Math.floor(Math.random() * dummyMessages.length)]!,
    };
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(json));
      }
    });

    res.end(`{ "message": "Message broadcasted to all clients!" }`);
    return;
  }

  res.end(`{ "message": "Hello World!" }`);
});

server.listen(API_PORT, API_HOSTNAME, () => {
  console.log(`[Core] Starting API at http://${API_HOSTNAME}:${API_PORT}/`);
  console.log(`[Core] Starting WebSocket at ws://${API_HOSTNAME}:${WS_PORT}/`);
});

setInterval(function () {
  broadcastToAll(
    dummyMessages[Math.floor(Math.random() * dummyMessages.length)]!
  );
}, Math.floor(Math.random() * 10000));

function broadcastToAll(message: string) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
