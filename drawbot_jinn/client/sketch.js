let video;
let serverConnection;
let drawReady = false;
let brushColor;
let detectedObject = '';
let objectDetector;
let objectTracking = false;
let objectX = 0;
let objectY = 0;

function setup() {
    createCanvas(windowWidth / 2, windowHeight).position(windowWidth / 2, 0);
    video = createCapture(VIDEO);
    video.size(windowWidth / 2, windowHeight);
    video.position(0, 0);

    // Load the YOLO object detection model from ml5.js
    objectDetector = ml5.objectDetector('yolo', modelLoaded);

    // Start the WebSocket connection to the server
    serverConnection = new WebSocket('ws://localhost:3000');

    // WebSocket event listeners
    serverConnection.onopen = () => {
        console.log('Connected to the server');
    };

    serverConnection.onmessage = (event) => {
        let data = JSON.parse(event.data);
        if (data.type === 'draw') {
            drawBall(data.x, data.y, data.color);
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

        if (results.length > 0) {
            detectedObject = results[0].label;
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
    if (drawReady && objectTracking) {
        // Object tracking using YOLO results
        objectDetector.detect(video, (err, results) => {
            if (err) {
                console.error(err);
                return;
            }

            if (results.length > 0) {
                objectX = results[0].x + results[0].width / 2;
                objectY = results[0].y + results[0].height / 2;
                brushColor = [random(255), random(255), random(255)];
                drawBall(objectX, objectY, brushColor);

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
    resizeCanvas(windowWidth / 2, windowHeight);
}

