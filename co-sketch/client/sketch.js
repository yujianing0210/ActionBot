let video;
let model;
let tracking = false;
let objectColor = [255, 0, 0];
let serverConnection;

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Setup WebSocket connection
  serverConnection = new WebSocket('ws://localhost:8080');

  // Load the object detection model
  cocoSsd.load().then((loadedModel) => {
    model = loadedModel;
    detectObject();
  });

  // Handle messages from the server
  serverConnection.onmessage = function (event) {
    let data = JSON.parse(event.data);
    if (data.type === 'draw') {
      drawFromServer(data.x, data.y);
    }
  };
}

function detectObject() {
  model.detect(video).then(predictions => {
    if (predictions.length > 0) {
      let detectedObject = predictions[0].class;
      if (confirm(`Use ${detectedObject} as your brush?`)) {
        tracking = true;
        objectColor = [random(255), random(255), random(255)];
      }
    }
  });
}

function draw() {
  if (tracking) {
    let x = mouseX;
    let y = mouseY;
    let message = JSON.stringify({ type: 'draw', x: x / width, y: y / height });
    serverConnection.send(message);
  }
}

function drawFromServer(x, y) {
  fill(objectColor);
  ellipse(x * width, y * height, 50, 50);
}
