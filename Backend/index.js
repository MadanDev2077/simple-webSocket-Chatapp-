const webSocketServerPort = 8000;
const WebSocketServer = require("websocket").server;
const http = require("http");

const server = http.createServer();
server.listen(webSocketServerPort);
console.log("Listening on port 8000");

const wsServer = new WebSocketServer({
  httpServer: server,
});

const clients = {};

const getUniqueId = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + "-" + s4();
};

wsServer.on("request", function (request) {
  const userId = getUniqueId();
  console.log(
    new Date() +
      " Received a new connection from origin " +
      request.origin +
      "."
  );

  const connection = request.accept(null, request.origin);
  clients[userId] = connection;
  console.log(
    "Connected: " + userId + " in " + Object.keys(clients).join(", ")
  );

  connection.on("message", function (message) {
    if (message.type === "utf8") {
      console.log("Received Message: " + message.utf8Data);
      // Broadcast to all clients
      Object.keys(clients).forEach((key) => {
        clients[key].sendUTF(message.utf8Data);
        console.log("Sent Message to: ", key);
      });
    }
  });

  connection.on("close", function (reasonCode, description) {
    console.log(new Date() + " Peer " + userId + " disconnected.");
    delete clients[userId];
  });
});
