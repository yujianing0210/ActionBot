const WebSocket = require('ws');  // Import the WebSocket library

const PORT = 5002;

const wsServer = new WebSocket.Server({  // Create a WebSocket Server
    port: PORT 
}); 

// Here we define how we want our Server to Respond --> a call-back function
wsServer.on('connection', function (socket) { // Define the socket to respond to the client when there is a connection
    
    console.log("A client just connected"); // Some feedback on the console
    
    socket.on('message', function (msg) { // Attach some behavior to the incoming socket
        console.log("Received message from client: " + msg);  // Report what message does the client send in the console
       
        // socket.send("Echo: " + msg); // Echo the message back to the original client
        
        wsServer.clients.forEach(function (client){  // Boradcast the message to all connected clients
            client.send("Someone said: " + msg);
        });

    });

});

console.log((new Date()) + " Server is listening on port " + PORT);
