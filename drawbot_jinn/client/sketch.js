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
const allowedObjects = ['apple', 'peach', 'banana', 'bottle', 'cup', 'pen', 'notebook', 'watch'];

function setup() {
    // Set dark background color for the browser
    document.body.style.backgroundColor = '#222';
    // Set both canvas and video to be square
    let canvasWidth = 640;
    let canvasHeight = 480;
    createCanvas(canvasWidth, canvasHeight).position((windowWidth * 3 / 4) - (canvasWidth / 2), (windowHeight / 2) - (canvasHeight / 2));
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.style('transform', 'scaleX(-1)');

    video.position((windowWidth / 4) - (video.width / 2), (windowHeight / 2) - (video.height / 2));

    // Draw bounding boxes for canvas and video
    let canvasBoundingBox = createDiv();
    canvasBoundingBox.style('border', '2px solid red');
    canvasBoundingBox.size(canvasWidth, canvasHeight);
    canvasBoundingBox.position((windowWidth * 3 / 4) - (canvasWidth / 2), (windowHeight / 2) - (canvasHeight / 2));

    let videoBoundingBox = createDiv();
    videoBoundingBox.style('border', '2px solid blue');
    videoBoundingBox.size(video.width, video.height);
    videoBoundingBox.position((windowWidth / 4) - (video.width / 2), (windowHeight / 2) - (video.height / 2));

    video.elt.addEventListener('loadeddata', () => {
        // Handle client disconnection
        window.addEventListener('beforeunload', () => {
            if (serverConnection.readyState === WebSocket.OPEN) {
                serverConnection.send(JSON.stringify({ type: 'disconnection', message: 'Client disconnected' }));
            }
        });
        console.log('Video loaded, starting object detection');
        objectDetector = ml5.objectDetector('yolo', modelLoaded);
    });

    // Start the WebSocket connection to the server
    // serverConnection = new WebSocket('ws://localhost:3000');
    serverConnection = new WebSocket('ws://100.86.216.25:3000');

    // WebSocket event listeners
    // serverConnection.onopen = () => {
    //     console.log('Connected to the server');
    //     // Send a message to the server when a client is connected
    //     serverConnection.send(JSON.stringify({ type: 'connection', message: 'Client connected' }));
    // };
    serverConnection.onopen = () => {
        console.log('Connected to the server');
        // Assign a random brush color to this client
        brushColor = [random(100, 255), random(100, 255), random(100, 255)];
        // Send a message to the server when a client is connected
        serverConnection.send(JSON.stringify({ type: 'connection', message: 'Client connected' }));
    };


    // serverConnection.onmessage = (event) => {
    //     let data = JSON.parse(event.data);
    //     if (data.type === 'draw') {
    //         drawBall((1 - data.x) * width, data.y * height, data.color);
    //     }
    // };
    serverConnection.onmessage = (event) => {
        let data = JSON.parse(event.data);
        if (data.type === 'draw') {
            // Use consistent brush color per client, perhaps identified by an ID
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
    // Keep canvas background white, retain previous drawings
    if (!drawReady) background(255);
    // Draw the mirrored video feed

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
                if (!brushColor) brushColor = [random(100, 255), random(100, 255), random(100, 255)];
                drawBall(objectX, objectY, brushColor);

                // Draw bounding box around detected object
                let objectBoundingBox = createDiv();
                objectBoundingBox.style('border', '2px dashed green');
                objectBoundingBox.position((windowWidth / 4) - (video.width / 2) + (640 - (allowedResult.x + allowedResult.width)) * (640 / videoWidth), (windowHeight / 2) - (video.height / 2) + (allowedResult.y * (480 / videoHeight)));
                objectBoundingBox.size(allowedResult.width * (640 / videoWidth), allowedResult.height * (480 / videoHeight));

                // Display object center coordinates
                // fill(0);
                // textSize(16);
                // textAlign(CENTER, CENTER);
                // text(`(${Math.round(objectX)}, ${Math.round(objectY)})`, objectX, objectY - 15);

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
    let canvasWidth = 640;
    let canvasHeight = 480;
    resizeCanvas(canvasWidth, canvasHeight);
}