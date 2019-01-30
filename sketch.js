var numParticles = 400;
var particles = [];
var numTypes = 6;
var interactions = [];

var friction = 0.95;
var bounciness = 1.1;

var colors;
var radius = 4;

var maxDist;
var minDist = 1e-2;
var maxVel = 5;

var controlBar = true;
var controlBarWidth = 150;

let frictionSlider, particleSlider;

function setup() {
  // create a canvas the same size the window
  createCanvas(window.innerWidth, window.innerHeight);

  // the maximum distance at which particles will affect eachother
  maxDist = Math.min(window.innerWidth, window.innerHeight)/15;

  colors = [color(172, 128, 255),
            color(166, 226, 44),
            color(104, 216, 239),
            color(253, 150, 33),
            color(249, 36,  114),
            color(231, 219, 116)];

  // create a bunch of particles at random positions and velocities
  for (var i=0; i<numParticles; i++) {
    var r = Math.random() * Math.min(window.innerWidth, window.innerHeight) * 0.4;
    var theta = Math.random() * 2 * Math.PI;
    particles.push(createParticle());
  }

  // specify the interactions between particles
  for (var i=0; i<numTypes; i++){
    var row = [];
    for (var j=0; j<numTypes; j++){
      row.push(Math.random() * 0.001 - 0.0005);
    }
    interactions.push(row);
  }

  if (controlBar) {
    frictionSlider = createSlider(0, 1000, friction * 1000);
    frictionSlider.position(controlBarWidth*0.1,20);
    particleSlider = createSlider(0, 1000, numParticles);
    particleSlider.position(controlBarWidth*0.1,40);
  }
}

function draw() {
  background(40, 41, 35);
  if (controlBar) {
    // draw the controlbar
    fill(24,25,21);
    rect(0,0, controlBarWidth, window.innerHeight);

    friction = frictionSlider.value()/1000;
    numParticles = particleSlider.value();
    if (particles.length > numParticles) {
      particles.pop();
    }
    else if (particles.length < numParticles) {
      particles.push(createParticle());
    }
  }

  noStroke();

  for (var i in particles) {
    var p = particles[i];

    var force = calculateForce(i);

    // accelerate the particle
    p.vel.x += force.x;
    p.vel.y += force.y;

    // apply friction
    p.vel.x *= friction;
    p.vel.y *= friction;

    // limit the particle speed
    p.vel.x = Math.sign(p.vel.x) * Math.min(Math.abs(p.vel.x), maxVel);
    p.vel.y = Math.sign(p.vel.y) * Math.min(Math.abs(p.vel.y), maxVel);

    // move the particle
    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;

    // bounce off the walls
    if (p.pos.x < radius + controlBar*controlBarWidth) {
      p.vel.x *= -bounciness;
      p.pos.x = radius + controlBar*controlBarWidth;
    }
    if (p.pos.x > window.innerWidth - radius) {
      p.vel.x *= -bounciness;
      p.pos.x = window.innerWidth - radius;
    }
    if (p.pos.y < radius) {
      p.vel.y *= -bounciness;
      p.pos.y = radius;
    }
    if (p.pos.y > window.innerHeight - radius) {
      p.vel.y *= -bounciness;
      p.pos.y = window.innerHeight - radius;
    }

    // draw the particle
    fill(colors[p.type]);
    ellipse(p.pos.x, p.pos.y, radius * 2, radius * 2);
  }
}

function getRandInt(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

// calculate the forces from other particles
function calculateForce(i) {
  var p = particles[i];
  var force = {x: 0, y: 0};

  for (var j in particles) {
    if (i != j) {
      var q = particles[j];
      var dx = p.pos.x - q.pos.x;
      var dy = p.pos.y - q.pos.y;
      var dx2 = Math.pow(dx,2);
      var dy2 = Math.pow(dy,2);
      var d2 = Math.max(minDist, dx2 + dy2);
      var d = Math.sqrt(d2);

      if (d < maxDist) {
        var c = interactions[p.type][q.type]; // coefficient from particle types
        var e = Math.pow(2,-d/maxDist*25); // force to prevent intersections
        force.x += (c*d + e) * Math.sqrt(1 - dy2/d2)*Math.sign(dx);
        force.y += (c*d + e) * Math.sqrt(1 - dx2/d2)*Math.sign(dy);
      }
    }
  }

  return force;
}

function createParticle() {
  var r = Math.random() * Math.min(window.innerWidth, window.innerHeight) * 0.4;
  var theta = Math.random() * 2 * Math.PI;
  var particle = {pos: {x: (controlBar*controlBarWidth + window.innerWidth)/2 + Math.cos(theta) * r,
                        y: window.innerHeight/2 + Math.sin(theta) * r},
                  vel: {x:Math.random()*4-1,
                        y:Math.random()*4-1},
                  type: getRandInt(0,numTypes)};
  return particle;
}
