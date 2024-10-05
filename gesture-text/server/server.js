const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 500 });

server.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
    
    // Process the gesture data and send feedback
    const feedback = processGesture(message);
    ws.send(feedback);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function processGesture(gestureData) {
  // Example: Return different feedback based on gesture data
  if (gestureData === 'wave') {
    return 'Hello! Nice to meet you!';
  } else if (gestureData === 'thumbs up') {
    return 'Great job!';
  }
  return 'Gesture not recognized.';
}
