let ws;
let objectDetector;
let detectedObject = '';
let color = [255, 255, 255];
let dia = 5;
let video;

function setup() {
    createCanvas(window.windowWidth, window.windowHeight);

    // Set up webcam feed
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    // Wait for the video to load before starting detection
    video.elt.addEventListener('loadeddata', () => {
        console.log('Video data loaded, starting object detection...');
        objectDetector = ml5.objectDetector('yolo', modelLoaded); // Now safe to initialize
    });

    ws = new WebSocket('ws://localhost:8081'); // Ensure this is the correct port for WebSocket

    ws.onopen = () => {
        console.log('Connected to the server');
    };

    // Handle incoming WebSocket messages
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'instruction':
                console.log(data.message);
                break;
            case 'confirmation':
                let confirmation = confirm(`Do you want to use ${data.object} as your paintbrush?`);
                ws.send(JSON.stringify({ type: 'confirm_object', confirmed: confirmation, object: data.object, color: color }));
                break;
            case 'set_color':
                color = data.color;
                break;
            case 'draw':
                drawBall(data.x * width, data.y * height);
                break;
        }
    };

    ballColor = [random(255), random(255), random(255)];
    bgColor = [random(255), random(255), random(255)];
    background(bgColor);
    fill(0);
    text("d  r  a  w  B  O  T        v.1          click to refresh ♺", 50, 40);
}

// Callback when YOLO model is loaded
function modelLoaded() {
    console.log('Model Loaded!');
    detectObject(); // Start detection after model loads
}

// Continuously detect objects in the video stream
function detectObject() {
    objectDetector.detect(video, function (err, results) {
        if (err) {
            console.error("Object detection error:", err); // Log the error for debugging
            setTimeout(detectObject, 1000); // Retry after 1 second even if there's an error
            return;
        }

        if (results && results.length > 0) {
            detectedObject = results[0].label;
            color = getColorFromObject(results[0]); // Assuming function to get color of object
            ws.send(JSON.stringify({ type: 'object_detected', object: detectedObject }));
        } else {
            console.log('No objects detected.');
        }

        setTimeout(detectObject, 1000); // Repeat detection every second
    });
}

// Generate random color from detected object (placeholder logic)
function getColorFromObject(object) {
    return [random(255), random(255), random(255)];
}

// Function to draw a ball at specified coordinates
function drawBall(x, y) {
    fill(color);
    noStroke();
    ellipse(x, y, dia, dia);
}

// Continuously track and send the object's (x, y) position
function draw() {
    if (detectedObject !== '') {
        let x = random(0, 1); // Placeholder for actual object tracking x-coordinate
        let y = random(0, 1); // Placeholder for actual object tracking y-coordinate
        ws.send(JSON.stringify({ type: 'draw', x: x, y: y }));
    }

    if (mouseIsPressed) {
        drawBall(mouseX, mouseY);
        sendTargetToServer(); // Send the coordinates to the server when drawing
    }
}

// Handle mouse click to refresh canvas
function mouseClicked() {
    if (mouseX > 45 && mouseX < 310 && mouseY > 0 && mouseY < 55) {
        bgColor = [random(255), random(255), random(255)];
        background(bgColor);
        fill(0);
        text("d  r  a  w  B  O  T        v.1          click to refresh ♺", 50, 40);
        if (ws && ws.readyState === WebSocket.OPEN) {
            let refreshMessage = JSON.stringify({ type: 'refresh', color: bgColor });
            ws.send(refreshMessage);
        }
    }
}

// Send the normalized (x, y) position to the WebSocket server
function sendTargetToServer() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        let norm = {
            type: 'draw',
            x: mouseX / width,  // Normalize the x position
            y: mouseY / height  // Normalize the y position
        };
        ws.send(JSON.stringify(norm));
        console.log("Sent position:", norm); // Log the sent position for debugging
    }
}

// Resize canvas when window is resized
function windowResized() {
    resizeCanvas(window.windowWidth, window.windowHeight);
}
