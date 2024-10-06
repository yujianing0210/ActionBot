// // Server-Side Code (Node.js + WebSocket)
// const WebSocket = require('ws');
// const server = new WebSocket.Server({ port: 8081 });

// server.on('connection', (client) => {
//     console.log('New client connected');

//     // Send instructions to allow webcam access
//     client.send(JSON.stringify({ type: 'instruction', message: 'You can use any object as your paintbrush. Please show an object in front of the camera' }));

//     client.on('message', (data) => {
//         const message = JSON.parse(data);
//         switch (message.type) {
//             case 'object_detected':
//                 // Ask client for confirmation to use detected object as brush
//                 client.send(JSON.stringify({ type: 'confirmation', object: message.object }));
//                 break;
//             case 'confirm_object':
//                 if (message.confirmed) {
//                     // Set brush color and instruct to start drawing
//                     client.send(JSON.stringify({ type: 'set_color', color: message.color }));
//                     client.send(JSON.stringify({ type: 'instruction', message: 'Now draw with your ' + message.object + ' with your friends' }));
//                 } else {
//                     // Reset and ask to show another object
//                     client.send(JSON.stringify({ type: 'instruction', message: 'Resetting... You can reselect an object as your paintbrush. Please show an object to the camera' }));
//                 }
//                 break;
//             case 'draw':
//                 // Broadcast the (x, y) coordinates to all clients
//                 server.clients.forEach((c) => {
//                     if (c !== client && c.readyState === WebSocket.OPEN) {
//                         c.send(JSON.stringify({ type: 'draw', x: message.x, y: message.y }));
//                     }
//                 });
//                 break;
//         }
//     });
// });

// // Server-Side Code (Node.js + WebSocket)
// const WebSocket = require('ws');
// const server = new WebSocket.Server({ port: 8080 });

// server.on('connection', (client) => {
//     console.log('New client connected');

//     client.on('message', (data) => {
//         const message = JSON.parse(data);
//         switch (message.type) {
//             case 'draw':
//                 // Broadcast the (x, y) coordinates to all clients
//                 server.clients.forEach((c) => {
//                     if (c !== client && c.readyState === WebSocket.OPEN) {
//                         c.send(JSON.stringify({ type: 'draw', x: message.x, y: message.y }));
//                     }
//                 });
//                 break;
//         }
//     });
// });




// Server-Side Code (Node.js + WebSocket)
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (client) => {
    console.log('New client connected');

    client.on('message', (data) => {
        const message = JSON.parse(data);
        switch (message.type) {
            case 'draw':
                // Broadcast the (x, y) coordinates to all clients
                server.clients.forEach((c) => {
                    if (c !== client && c.readyState === WebSocket.OPEN) {
                        c.send(JSON.stringify({ type: 'draw', x: message.x, y: message.y, color: message.color }));
                    }
                });
                break;
            case 'refresh':
                // Broadcast refresh message to all clients
                server.clients.forEach((c) => {
                    if (c.readyState === WebSocket.OPEN) {
                        c.send(JSON.stringify({ type: 'refresh', color: message.color }));
                    }
                });
                break;
        }
    });
});