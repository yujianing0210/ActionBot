// Client-Side Code for Object Detection and WebSocket Communication
// Dependencies: p5.js, YOLO model for object detection
let ws;
let objectDetector;
let detectedObject = '';
let color = [255, 255, 255];

function setup() {
    createCanvas(640, 480);
    objectDetector = ml5.objectDetector('yolo', modelLoaded);
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('Connected to the server');
    };

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
                drawOnCanvas(data.x, data.y);
                break;
        }
    };
}

function modelLoaded() {
    console.log('Model Loaded!');
    detectObject();
}

function detectObject() {
    objectDetector.detect(video, function (err, results) {
        if (results.length > 0) {
            detectedObject = results[0].label;
            color = getColorFromObject(results[0]); // Assuming function to get color of object
            ws.send(JSON.stringify({ type: 'object_detected', object: detectedObject }));
        }
        setTimeout(detectObject, 1000); // Repeat detection every second
    });
}

function getColorFromObject(object) {
    // Assume we have a way to get RGB values from the detected object
    return [random(255), random(255), random(255)];
}

function drawOnCanvas(x, y) {
    fill(color);
    ellipse(x * width, y * height, 20, 20);
}

function draw() {
    // Continuously track and send the object's (x, y) position
    if (detectedObject !== '') {
        let x = random(0, 1); // Placeholder for actual object tracking x-coordinate
        let y = random(0, 1); // Placeholder for actual object tracking y-coordinate
        ws.send(JSON.stringify({ type: 'draw', x: x, y: y }));
    }
}