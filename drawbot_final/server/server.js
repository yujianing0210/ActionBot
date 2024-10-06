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
        try {
            const data = JSON.parse(message);

            if (data.type === 'connection') {
                console.log(data.message);
            } else if (data.type === 'disconnection') {
                console.log(data.message);
            } else if (data.type === 'draw') {
                console.log('Broadcasting draw message:', message);
                // Broadcast received draw messages to all connected clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start the server on Glitch's assigned port or 3000
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
