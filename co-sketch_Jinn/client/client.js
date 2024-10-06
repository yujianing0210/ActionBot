// let ws;
// let objectDetector;
// let detectedObject = '';
// let color = [255, 255, 255];
// let dia = 5;
// let video;

// function setup() {
//     createCanvas(window.windowWidth, window.windowHeight);

//     // Set up webcam feed
//     video = createCapture(VIDEO);
//     video.size(640, 480);
//     video.hide();

//     // Wait for the video to load before starting detection
//     video.elt.addEventListener('loadeddata', () => {
//         console.log('Video data loaded, starting object detection...');
//         objectDetector = ml5.objectDetector('yolo', modelLoaded); // Now safe to initialize
//     });

//     ws = new WebSocket('ws://localhost:8081'); // Ensure this is the correct port for WebSocket

//     ws.onopen = () => {
//         console.log('Connected to the server');
//     };

//     // Handle incoming WebSocket messages
//     ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         switch (data.type) {
//             case 'instruction':
//                 console.log(data.message);
//                 break;
//             case 'confirmation':
//                 let confirmation = confirm(`Do you want to use ${data.object} as your paintbrush?`);
//                 ws.send(JSON.stringify({ type: 'confirm_object', confirmed: confirmation, object: data.object, color: color }));
//                 break;
//             case 'set_color':
//                 color = data.color;
//                 break;
//             case 'draw':
//                 drawBall(data.x * width, data.y * height);
//                 break;
//         }
//     };

//     ballColor = [random(255), random(255), random(255)];
//     bgColor = [random(255), random(255), random(255)];
//     background(bgColor);
//     fill(0);
//     text("d  r  a  w  B  O  T        v.1          click to refresh ♺", 50, 40);
// }

// // Callback when YOLO model is loaded
// function modelLoaded() {
//     console.log('Model Loaded!');
//     detectObject(); // Start detection after model loads
// }

// // Continuously detect objects in the video stream
// function detectObject() {
//     objectDetector.detect(video, function (err, results) {
//         if (err) {
//             console.error("Object detection error:", err); // Log the error for debugging
//             setTimeout(detectObject, 1000); // Retry after 1 second even if there's an error
//             return;
//         }

//         if (results && results.length > 0) {
//             detectedObject = results[0].label;
//             color = getColorFromObject(results[0]); // Assuming function to get color of object
//             ws.send(JSON.stringify({ type: 'object_detected', object: detectedObject }));
//         } else {
//             console.log('No objects detected.');
//         }

//         setTimeout(detectObject, 1000); // Repeat detection every second
//     });
// }

// // Generate random color from detected object (placeholder logic)
// function getColorFromObject(object) {
//     return [random(255), random(255), random(255)];
// }

// // Function to draw a ball at specified coordinates
// function drawBall(x, y) {
//     fill(color);
//     noStroke();
//     ellipse(x, y, dia, dia);
// }

// // Continuously track and send the object's (x, y) position
// function draw() {
//     if (detectedObject !== '') {
//         let x = random(0, 1); // Placeholder for actual object tracking x-coordinate
//         let y = random(0, 1); // Placeholder for actual object tracking y-coordinate
//         ws.send(JSON.stringify({ type: 'draw', x: x, y: y }));
//     }

//     if (mouseIsPressed) {
//         drawBall(mouseX, mouseY);
//         sendTargetToServer(); // Send the coordinates to the server when drawing
//     }
// }

// // Handle mouse click to refresh canvas
// function mouseClicked() {
//     if (mouseX > 45 && mouseX < 310 && mouseY > 0 && mouseY < 55) {
//         bgColor = [random(255), random(255), random(255)];
//         background(bgColor);
//         fill(0);
//         text("d  r  a  w  B  O  T        v.1          click to refresh ♺", 50, 40);
//         if (ws && ws.readyState === WebSocket.OPEN) {
//             let refreshMessage = JSON.stringify({ type: 'refresh', color: bgColor });
//             ws.send(refreshMessage);
//         }
//     }
// }

// // Send the normalized (x, y) position to the WebSocket server
// function sendTargetToServer() {
//     if (ws && ws.readyState === WebSocket.OPEN) {
//         let norm = {
//             type: 'draw',
//             x: mouseX / width,  // Normalize the x position
//             y: mouseY / height  // Normalize the y position
//         };
//         ws.send(JSON.stringify(norm));
//         console.log("Sent position:", norm); // Log the sent position for debugging
//     }
// }

// // Resize canvas when window is resized
// function windowResized() {
//     resizeCanvas(window.windowWidth, window.windowHeight);
// }

// Client-Side Code for Object Detection, p5.js, and WebSocket Communication
// Dependencies: p5.js, YOLO model for object detection
// let ws;
// let objectDetector;
// let detectedObject = '';
// let color = [255, 255, 255];
// let dia = 5;

// function setup() {
//     createCanvas(window.windowWidth, window.windowHeight);
//     objectDetector = ml5.objectDetector('yolo', modelLoaded);
//     ws = new WebSocket('ws://localhost:8080');

//     ws.onopen = () => {
//         console.log('Connected to the server');
//         // Send instructions to allow webcam access
//         alert('You can use any object as your paintbrush. Please show an object in front of the camera');
//     };

//     ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         switch (data.type) {
//             case 'draw':
//                 drawBall(data.x * width, data.y * height);
//                 break;
//         }
//     };

//     ballColor = [random(255), random(255), random(255)];
//     background(255, 255, 255, 0); // Set transparent background
//     fill(0);
//     text("d  r  a  w  B  O  T        v.1          click to refresh ♺", 50, 40);
// }

// function modelLoaded() {
//     console.log('Model Loaded!');
//     detectObject();
// }

// function detectObject() {
//     objectDetector.detect(video, function (err, results) {
//         if (results.length > 0) {
//             detectedObject = results[0].label;
//             color = getColorFromObject(results[0]); // Assuming function to get color of object
//             let confirmation = confirm(`Do you want to use ${detectedObject} as your paintbrush?`);
//             if (confirmation) {
//                 alert('Now draw with your ' + detectedObject + ' with your friends');
//             } else {
//                 alert('Resetting... You can reselect an object as your paintbrush. Please show an object to the camera');
//                 detectObject();
//             }
//         }
//         setTimeout(detectObject, 1000); // Repeat detection every second
//     });
// }

// function getColorFromObject(object) {
//     // Assume we have a way to get RGB values from the detected object
//     return [random(255), random(255), random(255)];
// }

// function drawBall(x, y) {
//     fill(color);
//     noStroke();
//     ellipse(x, y, dia, dia);
// }

// function draw() {
//     // Continuously track and send the object's (x, y) position
//     if (detectedObject !== '') {
//         let x = random(0, 1); // Placeholder for actual object tracking x-coordinate
//         let y = random(0, 1); // Placeholder for actual object tracking y-coordinate
//         ws.send(JSON.stringify({ type: 'draw', x: x, y: y }));
//     }

//     if (mouseIsPressed) {
//         drawBall(mouseX, mouseY);
//         sendTargetToServer(); // Send the coordinates to the server when drawing
//     }
// }

// function mouseClicked() {
//     if (mouseX > 45 && mouseX < 310 && mouseY > 0 && mouseY < 55) {
//         bgColor = [random(255), random(255), random(255)];
//         background(255, 255, 255, 0); // Set transparent background
//         fill(0);
//         text("d  r  a w  B  O  T        v.1          click to refresh ♺", 50, 40);
//         if (ws && ws.readyState === WebSocket.OPEN) {
//             let refreshMessage = JSON.stringify({ type: 'refresh', color: bgColor });
//             ws.send(refreshMessage);
//         }
//     }
// }

// function sendTargetToServer() {
//     if (ws && ws.readyState === WebSocket.OPEN) {
//         let norm = {
//             type: 'draw',
//             x: mouseX / width,  // Normalize the x position
//             y: mouseY / height  // Normalize the y position
//         };
//         let str = JSON.stringify(norm);
//         ws.send(str);
//         console.log("Sent position:", norm); // Log the sent position for debugging
//     }
// }

// function windowResized() {
//     resizeCanvas(window.windowWidth, window.windowHeight);
// }


// Client-Side Code for Object Detection, p5.js, and WebSocket Communication
// Dependencies: p5.js, YOLO model for object detection
let ws;
let objectDetector;
let detectedObject = '';
let color = [255, 255, 255];
let dia = 5;
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
            if (results.length > 0) {
                detectedObject = results[0].label;
                color = getColorFromObject(results[0]); // Assuming function to get color of object
                let confirmation = confirm(`Do you want to use ${detectedObject} as your paintbrush?`);
                if (confirmation) {
                    alert('Now draw with your ' + detectedObject + ' with your friends');
                    isDrawingStage = true;
                    setTimeout(() => {
                        // Show the drawing stage message for 5 seconds
                        alert('Now draw with your ' + detectedObject + ' with your friends');
                    }, 5000);
                    trackObject();
                } else {
                    alert('Resetting... You can reselect an object as your paintbrush. Please show an object to the camera');
                    detectObject();
                }
            }
            if (!isDrawingStage) {
                setTimeout(detectObject, 1000); // Repeat detection every second if not in drawing stage
            }
        });
    }
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
                    objectX = results[0].x + results[0].width / 2;
                    objectY = results[0].y + results[0].height / 2;
                    // Normalize the coordinates to be between 0 and 1
                    objectX = objectX / video.width;
                    objectY = objectY / video.height;
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