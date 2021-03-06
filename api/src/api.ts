import * as http from "http";

const hostname = "127.0.0.1";
const port = 4000;

const server = http.createServer((_req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/json");
  res.end(`{ "message": "Hello World!" }`);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
