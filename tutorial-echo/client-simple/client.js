const WebSocket = require('ws');  // Import the WebSocket library

// const serverAddress = "ws://127.0.0.1:5002";
const serverAddress = "wss://grey-achieved-cyclamen.glitch.me/";

const ws = new WebSocket(serverAddress, {
    headers: {
        "User-Agent": "Google Chrome"
    }
});

ws.on('open', function (){
    ws.send("hello, server");
});

ws.on('message', function (msg){
    console.log("Received message from the server: " + msg);
});