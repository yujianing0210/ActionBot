let video;

function setup() {
  // Create a transparent canvas that covers the entire window
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('z-index', '2');  // Ensure the canvas is on top
  canvas.position(0, 0);

  // Make the canvas background transparent
  clear();  // This ensures no background is drawn

  // Access the webcam video feed
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  // video.hide();  // Hide the default video element, as we're showing it through the HTML video tag
}

function draw() {
  // Example: Draw an ellipse where the mouse is
  noStroke();
  fill(255, 0, 0, 100);  // Semi-transparent red brush
  ellipse(mouseX, mouseY, 50, 50);  // Drawing on the transparent canvas

  // Other drawing logic can go here
}

// Adjust canvas size when the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
