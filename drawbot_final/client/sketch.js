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
let scale = 1.5;
let noiseOffset = 0;
let textureImg; // To hold texture image
let particles = [];

// List of allowed objects to be used as a brush
// far distance
// const allowedObjects = ['person'];
// close distance
const allowedObjects = ['bottle', 'apple', 'orange', 'banana', 'carrot', 'bottle', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'mouse', 'remote', 'book', 'scissors', 'toothbrush'];


function setup() {
    // Set dark background color for the browser
    // document.body.style.backgroundColor = '#222';
  
    let canvasWidth = 640 * scale;
    let canvasHeight = 480 * scale;
    // Create the canvas and center it with transparent background
    createCanvas(canvasWidth, canvasHeight).position(windowWidth / 2, windowHeight / 2);
    clear(); // Make the canvas transparent by clearing its background

    // Create the video element, also centered and flipped
    video = createCapture(VIDEO);
    video.size(canvasWidth, canvasHeight);
    // video.hide(); 
    video.style('transform', 'scaleX(-1)'); // Mirror the video horizontally
    video.position((windowWidth - canvasWidth)/ 2, (windowHeight - canvasHeight)/ 2);
    video.style('z-index', '-1'); // Ensure the video is behind the canvas

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
            drawShape(data.x * width, data.y * height, data.color);
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

// function draw() {
//     // Clear the canvas (transparent) to avoid trails
//     // clear();
//     // Do not clear the canvas to retain previous drawings and keep it transparent X

//     // Check if we are ready to draw with object detection
//     if (drawReady && objectTracking) {
//         // Object tracking using YOLO results
//         objectDetector.detect(video, (err, results) => {
//             if (err) {
//                 console.error(err);
//                 return;
//             }

//             // Filter results to find an allowed object
//             let allowedResult = results.find(result => allowedObjects.includes(result.label.toLowerCase()));

//             if (allowedResult) {
//                 // Correct the object coordinates to match the canvas scale
//                 let videoWidth = 640;
//                 let videoHeight = 480;
//                 objectX = width - ((allowedResult.x + allowedResult.width / 2) * (width / videoWidth)) * scale;
//                 objectY = (allowedResult.y + allowedResult.height / 2) * (height / videoHeight) * scale;
                
//                 // Give the connection line between two continous positions a random color --> UPDATE?
//                 if (!brushColor) brushColor = [random(100, 255), random(100, 255), random(100, 255)];
//                 // Draw the continuous line between previous and current positions
//                 if (previousX !== null && previousY !== null) {
//                     stroke(brushColor);
//                     strokeWeight(4); // --> UPDATE?
//                     line(previousX, previousY, objectX, objectY);
//                 }
//                 previousX = objectX;
//                 previousY = objectY;

//                 // Send the current drawing coordinates and color to the server
//                 if (serverConnection.readyState === WebSocket.OPEN) {
//                     serverConnection.send(JSON.stringify({
//                         type: 'draw',
//                         x: objectX / width,
//                         y: objectY / height,
//                         color: brushColor
//                     }));
//                 }
//             }
//         });
//     }

//     console.log('windowWidth:', windowWidth, 'canvas width:', width);

// }

function generateRandomColors() {
    let color1 = [random(255), random(255), random(255)]; // Random RGB color
    let color2 = [random(255), random(255), random(255)]; // Another random RGB color
    return [color1, color2];
}

function draw() {
    if (drawReady && objectTracking) {
        objectDetector.detect(video, (err, results) => {
            if (err) {
                console.error(err);
                return;
            }

            // Filter results to find an allowed object
            let allowedResult = results.find(result => allowedObjects.includes(result.label.toLowerCase()));

            if (allowedResult) {
                // Correct the object coordinates to match the canvas scale
                let videoWidth = 640;
                let videoHeight = 480;
                let currentX = width - ((allowedResult.x + allowedResult.width / 2) * (width / videoWidth)) * scale;
                let currentY = (allowedResult.y + allowedResult.height / 5) * (height / videoHeight) * scale;
                
                // Generate new brush color if not defined
                if (!brushColor) {
                    brushColor = [random(100, 255), random(100, 255), random(100, 255)];
                }

                // Ensure previous position exists before interpolation
                if (previousX !== null && previousY !== null) {
                    let steps = 10; // Number of transition steps
                    for (let i = 0; i <= steps; i++) {
                        // Interpolating the position between previous and current
                        let interX = lerp(previousX, currentX, i / steps);
                        let interY = lerp(previousY, currentY, i / steps);

                        // Interpolating the color
                        let interColor = [
                            lerp(brushColor[0], random(100, 255), i / steps),
                            lerp(brushColor[1], random(100, 255), i / steps),
                            lerp(brushColor[2], random(100, 255), i / steps)
                        ];

                        // Draw transition shape at the interpolated position with the interpolated color
                        // drawTransitionShape(interX, interY, interColor, i, steps);

                        // drawFluidBrush(interX, interY);

                        // let [color1, color2] = generateRandomColors();
                        // drawGradientStroke(previousX, previousY, currentX, currentY, color1, color2);

                        // drawTexturedBrush(interX, interY);

                        // drawParticleBrush(interX, interY);
                    }
                }

                // Update previous position and color
                previousX = currentX;
                previousY = currentY;
            }
        });
    }
}


// function drawShape(x, y) {
//     colorMode(HSB, 360, 100, 100);
//     hueValue = (hueValue + 1) % 360; // Increment hue value and keep it within the HSB range
//     fill(hueValue, 100, 100);
//     noStroke();
//     beginShape();
//     for (let i = 0; i < 10; i++) {
//         let angle = TWO_PI / 10 * i;
//         let radius = 10 + sin(frameCount * 0.1 + i) * 5;
//         let sx = x + cos(angle) * radius;
//         let sy = y + sin(angle) * radius;
//         vertex(sx, sy);
//     }
//     endShape(CLOSE);
// }

// Watercolor-like Smudge Effect
function drawTransitionShape(x, y, color, step, totalSteps) {
    // Adjust shape size based on interpolation step (e.g., smaller shapes for intermediate steps)
    let size = map(step, 0, totalSteps, 10, 20); // Gradually increase size
    
    // Set fill color with transparency for a watercolor effect
    fill(color[0], color[1], color[2], 150); // Adjust the alpha value for transparency
    
    noStroke();

    // Example: Drawing an ellipse shape
    // ellipse(x, y, size, size);

    // Draw multiple ellipses to create a smudge effect
    for (let i = -2; i <= 2; i++) { // Draw 5 ellipses in a row
        let offsetX = random(-5, 5); // Random horizontal offset
        let offsetY = random(-5, 5); // Random vertical offset
        ellipse(x + offsetX, y + offsetY, size + random(-5, 5), size + random(-5, 5)); // Vary size slightly
    }
}

// Fluid Brush Strokes
function drawFluidBrush(x, y) {
    noiseOffset += 0.05; // Increment noise offset
    let fluidX = x + map(noise(noiseOffset), 0, 1, -5, 5);
    let fluidY = y + map(noise(noiseOffset + 100), 0, 1, -5, 5);
    
    strokeWeight(4);
    stroke(0, 100); // Semi-transparent stroke
    point(fluidX, fluidY); // Draw point with fluid effect
}

// Gradient Brush Strokes
function drawGradientStroke(x1, y1, x2, y2, color1, color2) {
    let steps = 20; // Number of steps in the gradient
    for (let i = 0; i <= steps; i++) {
        let interX = lerp(x1, x2, i / steps);
        let interY = lerp(y1, y2, i / steps);
        
        // Interpolate colors for the gradient
        let interColor = [
            lerp(color1[0], color2[0], i / steps),
            lerp(color1[1], color2[1], i / steps),
            lerp(color1[2], color2[2], i / steps)
        ];
        
        fill(interColor);
        noStroke();
        ellipse(interX, interY, 10); // Adjust size for the stroke
    }
}

// // Texture Brush
// function preload() {
//     textureImg = loadImage('images/texture1.png'); // Load a texture image
// }

// function drawTexturedBrush(x, y) {
//     // Draw textured brush
//     image(textureImg, x - textureImg.width / 2, y - textureImg.height / 2, textureImg.width, textureImg.height);
// }

// Particle System Brush Strokes
function Particle(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(5, 15);
    this.alpha = 255;

    this.update = function() {
        this.y += random(-1, 1); // Small random movement
        this.x += random(-1, 1);
        this.alpha -= 5; // Fade out
    }

    this.display = function() {
        fill(0, this.alpha);
        noStroke();
        ellipse(this.x, this.y, this.size);
    }
}

function drawParticleBrush(x, y) {
    for (let i = 0; i < 10; i++) { // Emit multiple particles
        particles.push(new Particle(x, y));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].display();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1); // Remove if faded out
        }
    }
}

function windowResized() {
    let canvasWidth = 640 * scale;
    let canvasHeight = 480 * scale;
    resizeCanvas(canvasWidth, canvasHeight);
}
