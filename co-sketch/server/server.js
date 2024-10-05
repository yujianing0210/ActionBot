const WebSocket = require('ws');

// Setup WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New client connected');

  // When the server receives a message from a client
  ws.on('message', (message) => {
    let data = JSON.parse(message);

    // Broadcast received data to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Handle connection close
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
