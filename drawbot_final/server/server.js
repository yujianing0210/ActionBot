const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve the client HTML page
app.use(express.static(path.join(__dirname, '../client')));

// WebSocket message handler
wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'connection') {
            console.log(data.message);
        } else if (data.type === 'disconnection') {
            console.log(data.message);
        } else if (data.type === 'draw') {
            // Broadcast received draw messages to all connected clients
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});


// Start the server
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});



