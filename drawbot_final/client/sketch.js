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
let depthModel;
let thickness = 5; // Default thickness value

// List of allowed objects to be used as a brush
const allowedObjects = ['apple', 'orange', 'banana', 'carrot', 'bottle', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'mouse', 'remote', 'book', 'scissors', 'toothbrush'];

function setup() {
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
            drawShape((data.x) * width, data.y * height, data.z); // Pass `z` to adjust thickness
        }
    };

    loadDepthModel();
}

async function loadDepthModel() {
    // Load the pre-trained MiDaS model for depth estimation
    depthModel = await midas.load();
    console.log('Depth model loaded');
}

async function getDepth(videoElement) {
    // Use the depth model to estimate depth from the video element
    const predictions = await depthModel.estimateDepth(videoElement);
    return predictions; // Depth information for each pixel
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

    if (drawReady && objectTracking) {
        objectDetector.detect(video, async (err, results) => {
            if (err) {
                console.error(err);
                return;
            }

            // Filter results to find an allowed object
            let allowedResult = results.find(result => allowedObjects.includes(result.label.toLowerCase()));

            if (allowedResult) {
                // Detect depth
                let depthMap = await getDepth(video.elt); // Get depth map for video frame
                let objectDepth = depthMap[allowedResult.y][allowedResult.x]; // Get the depth for the detected object

                let videoWidth = video.width;
                let videoHeight = video.height;
                objectX = width - ((allowedResult.x + allowedResult.width / 2) * (width / videoWidth));
                objectY = (allowedResult.y + allowedResult.height / 2) * (height / videoHeight);

                // Use objectDepth (z) to control the brushstroke thickness
                thickness = map(objectDepth, 0, 1, 1, 10); // Adjust the range as needed

                if (!brushColor) brushColor = [random(100, 255), random(100, 255), random(100, 255)];
                if (previousX !== null && previousY !== null) {
                    stroke(brushColor);
                    strokeWeight(thickness);
                    line(previousX, previousY, objectX, objectY);
                }
                previousX = objectX;
                previousY = objectY;

                // Send the current drawing coordinates, color, and depth to the server
                if (serverConnection.readyState === WebSocket.OPEN) {
                    serverConnection.send(JSON.stringify({
                        type: 'draw',
                        x: objectX / width,
                        y: objectY / height,
                        z: objectDepth, // Send depth information
                        color: brushColor
                    }));
                }
            }
        });
    }
}

function drawShape(x, y, z) {
    colorMode(HSB, 360, 100, 100);
    hueValue = (hueValue + 1) % 360; // Increment hue value and keep it within the HSB range
    fill(hueValue, 100, 100);

    // Set the thickness based on the depth (z) value
    thickness = map(z, 0, 1, 5, 20); // Adjust the range as needed (closer = larger, farther = smaller)

    stroke(0); // Ensure stroke is enabled for visibility
    strokeWeight(thickness); // Use the calculated thickness
    beginShape();
    for (let i = 0; i < 10; i++) {
        let angle = TWO_PI / 10 * i;
        let radius = thickness + sin(frameCount * 0.1 + i) * 5; // Use `thickness` as the base size
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