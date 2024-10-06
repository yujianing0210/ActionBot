// Revised Client-Side Code for Face Detection using face-api.js, p5.js, and WebSocket Communication
// Dependencies: p5.js, face-api.js
let ws;
let video;
let isDrawingStage = false;
let objectX = 0.5;
let objectY = 0.5;
let detections = [];

async function setup() {
    // Create p5.js canvas
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '1'); // Ensure canvas is above the video
    clear(); // Set transparent background
    fill(0);
    textSize(20);
    text("d  r  a  w  B  O  T        v.1          click to refresh ♺", 50, 40);

    // Create video capture for live stream
    video = createCapture(VIDEO);
    video.size(windowWidth, windowHeight);
    video.position(0, 0);
    video.style('z-index', '-1'); // Place video under p5.js canvas

    // Initialize WebSocket
    ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
        console.log('Connected to the server');
        alert('You can use any object as your paintbrush. Please show an object in front of the camera');
    };

    // Handle messages from the server
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'draw':
                drawBall(data.x * width, data.y * height, data.color);
                break;
            case 'refresh':
                background(data.color);
                break;
        }
    };

    // Load face-api.js models
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

    detectFaces(); // Start detecting faces
}

async function detectFaces() {
    // Estimate faces in the video
    detections = await faceapi.detectAllFaces(video.elt, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    if (detections.length > 0) {
        const face = detections[0].detection.box;
        const x = face.x;
        const y = face.y;
        const width = face.width;
        const height = face.height;

        // Draw bounding box and show coordinates
        drawBoundingBox(x, y, width, height);  // Draw the bounding box
        showCoordinates(x, y);  // Show the object's coordinates

        if (!isDrawingStage) {
            let confirmation = confirm("Do you want to use the detected face as your paintbrush?");
            if (confirmation) {
                alert('Now draw with your detected face with your friends');
                isDrawingStage = true;
                setTimeout(() => {
                    alert('Now draw with your detected face with your friends');
                }, 5000);
                trackFace(face);  // Start tracking the face
            }
        }
    }

    // Call detectFaces again for continuous detection
    setTimeout(detectFaces, 1000);  // Check for faces every second
}

// Function to draw a bounding box around the detected face
function drawBoundingBox(x, y, width, height) {
    noFill();  // No fill for the box
    stroke(0, 255, 0);  // Green color for the bounding box
    strokeWeight(4);  // Border thickness
    rect(x, y, width, height);  // Draw the rectangle for the bounding box
}

// Function to display (x, y) coordinates on the canvas
function showCoordinates(x, y) {
    fill(255);  // White text for the coordinates
    textSize(16);  // Font size
    text(`(${Math.round(x)}, ${Math.round(y)})`, x + 10, y + 10);  // Display the coordinates next to the top-left corner
}

// Function to track the face
function trackFace(face) {
    setInterval(() => {
        if (isDrawingStage) {
            const objectCenterX = face.x + face.width / 2;
            const objectCenterY = face.y + face.height / 2;
            // Scale the coordinates to match canvas size
            objectX = objectCenterX / video.width;
            objectY = objectCenterY / video.height;
        }
    }, 100); // Update object tracking every 0.1 seconds
}

function drawBall(x, y, color) {
    fill(color);
    noStroke();
    ellipse(x, y, 20, 20); // Fixed diameter for the drawing ball
}

function draw() {
    if (isDrawingStage) {
        // Drawing logic during the drawing stage using tracked face coordinates
        clear();
        ws.send(JSON.stringify({ type: 'draw', x: objectX, y: objectY, color: [255, 0, 0] })); // Example color
        drawBall(objectX * width, objectY * height, [255, 0, 0]); // Example color
    }
}

function mouseClicked() {
    if (mouseX > 45 && mouseX < 310 && mouseY > 0 && mouseY < 55) {
        let bgColor = [random(255), random(255), random(255)];
        background(bgColor, 255); // Set opaque background
        fill(0);
        text("d  r  a  w  B  O  T        v.1          click to refresh ♺", 50, 40);
        if (ws && ws.readyState === WebSocket.OPEN) {
            let refreshMessage = JSON.stringify({ type: 'refresh', color: bgColor });
            ws.send(refreshMessage);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    video.size(windowWidth, windowHeight);
}
