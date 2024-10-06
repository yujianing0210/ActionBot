// Start a p5.js sketch that we can use to draw 
// shapes on the screen.

// Some global variables.
// Consider that these could be set in the UI instead. 
// Or these could come from the server, on a per-doodle basis.
const strokeThickness = 5;
const strokeColor = 'coral';

let prevDoodles = [];
let currentDoodle;

// Run once at the beginning of the program
function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
}

// Run multiple times per second
function draw() {
  background(255);

  // Draw current doodle (thinner)
  if (currentDoodle != undefined)
  {
    push();
    noFill();
    stroke(strokeColor);
    strokeWeight(1);
    beginShape();
    for (let j = 0; j < currentDoodle['vertices'].length; j++) {
      vertex(width * currentDoodle['vertices'][j][0], 
        height * currentDoodle['vertices'][j][1]);
    }
    endShape();
    pop();
  }

  // Draw all previously stored doodles
  for (let i = 0; i < prevDoodles.length; i++)
  {
    const doodle = prevDoodles[i];
    const vertices = doodle['vertices'];
    
    push();
    noFill();
    stroke(doodle['color']);
    strokeWeight(doodle['thickness']);
    beginShape();
    for (let j = 0; j < vertices.length; j++)
    {
      vertex(width * vertices[j][0], height * vertices[j][1]);
    }
    endShape();
    pop();
  }

}

// Mouse handling functions, to update 
// the management of doodle drawing.
function mousePressed() {
  // Start a blank doodle
  currentDoodle = {
    creator: nameInput.value,
    color: strokeColor,
    thickness: strokeThickness,
    vertices: []
  };
  currentDoodle['vertices'].push([mouseX / width, mouseY / height]);
}

function mouseDragged() {
  currentDoodle['vertices'].push([mouseX / width, mouseY / height]);
}

function mouseReleased() {
  // Send the finished doodle to the server
  if (ws)
  {
    ws.send(JSON.stringify(currentDoodle));
  }

  // prevDoodles.push(currentDoodle);
  currentDoodle = undefined;
}

// Make sure canvas always covers the full window.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}




// We can define here the behavior for the elements on the website...

// Fetch DOM elements
const nameInput = document.getElementById('name-input');
const serverAddress = document.getElementById('server-address');
const connectButton = document.getElementById('connect-button');
const connectionStatus = document.getElementById('connection-status');

// Define a global WS object
let ws = undefined;

/**
 * Attach behavior to the connect button
 * @param {*} e 
 */
connectButton.onclick = (e) => {
  // Update UI
  const address = serverAddress.value;
  connectionStatus.innerText = `Trying to connect to ${address}...`;

  // Establish WS connection
  ws = new WebSocket("ws://" + serverAddress.value);

  // What to do when connection is established
  ws.onopen = event => {
    // Update UI
    connectionStatus.innerText = `Connected!`;
  }

  // What to do when receiving a message from the server
  ws.onmessage = event => {
    // Convert the message to JSON
    const jsonData = JSON.parse(event.data);

    console.log(jsonData);

    prevDoodles.push(jsonData);
  }
}