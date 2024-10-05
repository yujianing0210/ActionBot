// A simple WebSockets chat server that 
// bounces incoming messages around between clients. 

// Load WS module
const WebSocket = require('ws');

// Set up the server
const PORT = 5544;
const wsServer = new WebSocket.WebSocketServer({
    port: PORT
});
console.log( (new Date()) + " Server is listening on port " + PORT);

// Program the actions of the WS server
wsServer.on('connection', (socket, req) => 
{
    // Some feedback on the console
    console.log("A client just connected...");

    // Attach some behavior to the incoming socket
    socket.on('message', data => {
        // Parse incoming string into a JSON object
        const jsonData = JSON.parse(data);

        console.log(`Received doodle from ${jsonData['creator']}: ${jsonData['vertices'].length} vertices`);

        // Optionally attach custom data to the message
        jsonData['broadcasted'] = Date.now();
        
        // Broadcast that message to all connected clients
        // (including the sender)
        wsServer.clients.forEach(client => {
            client.send(JSON.stringify(jsonData));  // json needs to be converted to string again
        });
    });

    socket.on('close', function () {
        console.log('Client disconnected...');
    });
});


