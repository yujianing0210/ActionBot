let video;
let serverConnection;
let drawReady = false;
let brushColor;
let detectedObject = '';
let objectDetector;
let objectTracking = false;
let previousX = null;
let previousY = null;
let objectX = 0;
let objectY = 0;
let hueValue = 0;

// List of allowed objects to be used as a brush
const allowedObjects = ['apple', 'orange', 'banana', 'carrot', 'bottle', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'mouse', 'remote', 'book', 'scissors', 'toothbrush'];

function setup() {
    // // Set dark background color for the browser
    // document.body.style.backgroundColor = '#222';
    // Set both canvas and video to be square
    let canvasWidth = 640;
    let canvasHeight = 480;
    createCanvas(canvasWidth, canvasHeight).position((windowWidth * 3 / 4) - (canvasWidth / 2), (windowHeight / 2) - (canvasHeight / 2));
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.style('transform', 'scaleX(-1)');

    video.position((windowWidth / 4) - (video.width / 2), (windowHeight / 2) - (video.height / 2));

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
    serverConnection = new WebSocket('wss://puzzle-actually-kettle.glitch.me/');

    // WebSocket event listeners
    serverConnection.onopen = () => {
        console.log('Connected to the server');
        // Send a message to the server when a client is connected
        serverConnection.send(JSON.stringify({ type: 'connection', message: 'Client connected' }));
    };

    serverConnection.onmessage = (event) => {
        let data = JSON.parse(event.data);
        if (data.type === 'draw') {
            drawShape((data.x) * width, data.y * height, data.color);
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
            setTimeout(detectObjects, 10);
        }
    });
}

function draw() {
    // Keep canvas background white, retain previous drawings
    if (!drawReady) background(249, 244, 249); // RGB equivalent of #d1ced9
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
                // Draw continuous line between previous and current positions
                if (previousX !== null && previousY !== null) {
                    stroke(brushColor);
                    strokeWeight(4);
                    line(previousX, previousY, objectX, objectY);
                }
                previousX = objectX;
                previousY = objectY;

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

function drawShape(x, y) {
    colorMode(HSB, 360, 100, 100);
    hueValue = (hueValue + 1) % 360; // Increment hue value and keep it within the HSB range
    fill(hueValue, 100, 100);
    noStroke();
    beginShape();
    for (let i = 0; i < 10; i++) {
        let angle = TWO_PI / 10 * i;
        let radius = 10 + sin(frameCount * 0.1 + i) * 5;
        let sx = x + cos(angle) * radius;
        let sy = y + sin(angle) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

function windowResized() {
    let canvasWidth = 640;
    let canvasHeight = 480;
    resizeCanvas(canvasWidth, canvasHeight);
}
