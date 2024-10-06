const WebSocket = require('ws');
const express = require('express');
const http = require('http');

// Create a new express application and server
const app = express();
const server = http.createServer(app);

// Serve static files from the public directory
app.use(express.static('public'));

// Create a WebSocket server on top of the HTTP server
const wss = new WebSocket.Server({ server });

// Array to store all connected clients
let clients = [];

wss.on('connection', (ws) => {
    clients.push(ws);

    ws.on('message', (message) => {
        // Broadcast the message to all connected clients
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        // Remove the client when disconnected
        clients = clients.filter((client) => client !== ws);
    });

    console.log('Client connected!');
});

server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000');
});
