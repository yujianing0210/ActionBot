const WebSocket = require('ws');  // Import the WebSocket library

const serverAddress = "ws://127.0.0.1:5002";

const ws = new WebSocket(serverAddress);

ws.on('open', function (){
    ws.send("hello, server");
});

ws.on('message', function (msg){
    console.log("Received message from the server: " + msg);
});