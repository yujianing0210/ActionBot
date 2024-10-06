// Modified sketch.js
let video;
let serverConnection;
let drawReady = false;
let brushColor;
let detectedObject = '';
let objectDetector;
let objectTracking = false;
let objectX = 0;
let objectY = 0;

// List of allowed objects to be used as a brush
const allowedObjects = ['apple', 'banana', 'bottle', 'cup', 'pen', 'notebook', 'watch'];

function setup() {
    // Set both canvas and video to be square
    let canvasSize = windowWidth / 2;
    createCanvas(canvasSize, canvasSize).position(windowWidth / 2, (windowHeight - canvasSize) / 2);
    video = createCapture(VIDEO);
    video.size(windowWidth / 2, windowHeight);
    video.style('transform', 'scaleX(-1)');

    video.position(0, 0);

    // Draw bounding boxes for canvas and video
    let canvasBoundingBox = createDiv();
    canvasBoundingBox.style('border', '2px solid red');
    canvasBoundingBox.size(canvasSize, windowHeight);
    canvasBoundingBox.position(windowWidth / 2, (windowHeight - canvasSize) / 2);

    let videoBoundingBox = createDiv();
    videoBoundingBox.style('border', '2px solid blue');
    videoBoundingBox.size(canvasSize, windowHeight);
    videoBoundingBox.position(0, 0);

    video.elt.addEventListener('loadeddata', () => {
        console.log('Video loaded, starting object detection');
        objectDetector = ml5.objectDetector('yolo', modelLoaded);
    });

    // Start the WebSocket connection to the server
    serverConnection = new WebSocket('ws://localhost:3000');

    // WebSocket event listeners
    serverConnection.onopen = () => {
        console.log('Connected to the server');
    };

    serverConnection.onmessage = (event) => {
        let data = JSON.parse(event.data);
        if (data.type === 'draw') {
            drawBall((1 - data.x) * width, data.y * height, data.color);
        }
    };
}

function modelLoaded() {
    console.log('YOLO model loaded');
    detectObjects();
}

function detectObjects() {
    objectDetector.detect(video, (err, results) => {
        if (err) {
            console.error(err);
            return;
        }

        // Filter results to find an allowed object
        let allowedResult = results.find(result => allowedObjects.includes(result.label.toLowerCase()));

        if (allowedResult) {
            detectedObject = allowedResult.label;
            let response = confirm(`Do you want to use "${detectedObject}" as your paintbrush?`);
            if (response) {
                drawReady = true;
                objectTracking = true;
                alert(`Now draw with your "${detectedObject}" with your friends`);
            } else {
                detectObjects();
            }
        } else {
            setTimeout(detectObjects, 500);
        }
    });
}

function draw() {
    background(255);
    // Draw the mirrored video feed
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
    if (drawReady && objectTracking) {
        // Object tracking using YOLO results
        objectDetector.detect(video, (err, results) => {
            if (err) {
                console.error(err);
                return;
            }

            // Filter results to find an allowed object
            let allowedResult = results.find(result => allowedObjects.includes(result.label.toLowerCase()));

            if (allowedResult) {
                // Correct the object coordinates to match the canvas scale
                let videoWidth = video.width;
                let videoHeight = video.height;
                objectX = width - ((allowedResult.x + allowedResult.width / 2) * (width / videoWidth));
                objectY = (allowedResult.y + allowedResult.height / 2) * (height / videoHeight);
                brushColor = [random(255), random(255), random(255)];
                drawBall(objectX, objectY, brushColor);

                // Draw bounding box around detected object
                let objectBoundingBox = createDiv();
                objectBoundingBox.style('border', '2px dashed green');
                objectBoundingBox.position(allowedResult.x * (width / videoWidth), allowedResult.y * (height / videoHeight));
                objectBoundingBox.size(allowedResult.width * (width / videoWidth), allowedResult.height * (height / videoHeight));

                // Display object center coordinates
                fill(0);
                textSize(16);
                textAlign(CENTER, CENTER);
                text(`(${Math.round(objectX)}, ${Math.round(objectY)})`, objectX, objectY - 15);

                // Send the current drawing coordinates and color to the server
                if (serverConnection.readyState === WebSocket.OPEN) {
                    serverConnection.send(JSON.stringify({
                        type: 'draw',
                        x: objectX / width,
                        y: objectY / height,
                        color: brushColor
                    }));
                }
            }
        });
    }
}

function drawBall(x, y, color) {
    fill(color);
    noStroke();
    ellipse(x, y, 10, 10);
}

function windowResized() {
    let canvasSize = min(windowWidth / 2, windowHeight);
    resizeCanvas(canvasSize, canvasSize);
}