// Revised Client-Side Code for Object Detection, p5.js, and WebSocket Communication
// Dependencies: p5.js, YOLO model for object detection
let ws;
let objectDetector;
let detectedObject = '';
let color = [255, 255, 255];
let dia = 20;
let video;
let isDrawingStage = false;
let objectX = 0.5;
let objectY = 0.5;

function setup() {
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

    // Load YOLO model for object detection
    objectDetector = ml5.objectDetector('yolo', modelLoaded);
}

function modelLoaded() {
    console.log('Model Loaded!');
    detectObject();
}

function detectObject() {
    if (!isDrawingStage) {
        objectDetector.detect(video, function (err, results) {
            if (err) {
                console.error('Error during object detection:', err);
                return; // Exit the function if there's an error
            }

            // Log the results to the console to inspect what is being detected
            console.log(results);

            // Ensure results is defined and has length before proceeding
            if (results && results.length > 0) {
                // Access the detected object properties
                let detectedObject = results[0].label;
                let x = results[0].x;
                let y = results[0].y;
                let width = results[0].width;
                let height = results[0].height;

                // Display bounding box and coordinates
                drawBoundingBox(x, y, width, height);  // Draw the bounding box
                showCoordinates(x, y);  // Show the object's coordinates

                // Get color of the detected object (assuming a separate function exists)
                color = getColorFromObject(results[0]);

                let confirmation = confirm(`Do you want to use ${detectedObject} as your paintbrush?`);
                if (confirmation) {
                    alert('Now draw with your ' + detectedObject + ' with your friends');
                    isDrawingStage = true;
                    setTimeout(() => {
                        alert('Now draw with your ' + detectedObject + ' with your friends');
                    }, 5000);
                    trackObject();  // Continue to track the object
                } else {
                    alert('Resetting... You can reselect an object as your paintbrush. Please show an object to the camera');
                    detectObject();  // Restart the object detection process
                }
            } else {
                // No objects detected, retry detection after a short delay
                console.log('No objects detected, retrying...');
                setTimeout(detectObject, 1000);
            }
        });
    }
}


// Function to draw a bounding box around the detected object
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
    text(`(${x}, ${y})`, x + 10, y + 10);  // Display the coordinates next to the top-left corner
}


function getColorFromObject(object) {
    // Assume we have a way to get RGB values from the detected object
    return [random(255), random(255), random(255)];
}

function trackObject() {
    setInterval(() => {
        if (isDrawingStage) {
            objectDetector.detect(video, function (err, results) {
                if (results.length > 0) {
                    // Update the coordinates of the detected object
                    let objectCenterX = results[0].x + results[0].width / 2;
                    let objectCenterY = results[0].y + results[0].height / 2;
                    // Scale the coordinates to match canvas size
                    objectX = objectCenterX / video.width;
                    objectY = objectCenterY / video.height;
                }
            });
        }
    }, 100); // Update object tracking every 0.1 seconds
}

function drawBall(x, y, color) {
    fill(color);
    noStroke();
    ellipse(x, y, dia, dia);
}

function draw() {
    if (isDrawingStage) {
        // Drawing logic during the drawing stage using tracked object coordinates
        clear();
        ws.send(JSON.stringify({ type: 'draw', x: objectX, y: objectY, color: color }));
        drawBall(objectX * width, objectY * height, color);
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

function sendTargetToServer() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        let norm = {
            type: 'draw',
            x: mouseX / width,  // Normalize the x position
            y: mouseY / height, // Normalize the y position
            color: color
        };
        let str = JSON.stringify(norm);
        ws.send(str);
        console.log("Sent position:", norm); // Log the sent position for debugging
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    video.size(windowWidth, windowHeight);
}