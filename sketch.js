

var font;
var textparticles = [];
var fireworks = [];
var gravity;

function preload() 
{
  font = loadFont('Kaya_Medium.otf');
}

function setup() 
{
  createCanvas(1250, 430);
  
////////////////////////THE FONT HAPPENS HERE
  var points = font.textToPoints("HAPPY.NEW.YEAR", 50, 260, 191, 
  {
    sampleFactor: 0.25
  });

  for (var i = 0; i < points.length; i++) {
    var pt = points[i];
    var vehicle = new Vehicle(pt.x, pt.y);
    textparticles.push(vehicle);
   
  }
/////////////////////////FOR THE FIREWORKS 
  colorMode(HSB);
  gravity = createVector(0, 0.2);
  stroke(255);
  strokeWeight(4);
  background(0);

    
}

function draw() 
{
////////////////////CALLING THE textparticles FUNCTIONS HERE
  for (var i = 0; i < textparticles.length; i++) 
  {
    var v = textparticles[i];
    v.behaviors();
    v.update();
    v.show();
  }
    
 ////////////////SETTING THE COLOR MODE ALSO CALLLING THE FIREWORKS FUNCTIONS
  colorMode(RGB);
  background(0, 0, 0, 25);
  
  if (random(1) < 0.03) 
  {
    fireworks.push(new Firework());
  }
  
  for (var i = fireworks.length - 1; i >= 0; i--) 
  {
    fireworks[i].update();
    fireworks[i].show();
    
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}
/////////////////// FUNCTION FOR THE TEXT PARTICLES (VEHICLE)
function Vehicle(x, y) 
{
  this.pos = createVector(random(width), random(height));
  this.target = createVector(x, y);
  this.vel = p5.Vector.random2D();
  this.acc = createVector();
  this.r = 3;
  this.maxspeed = 10;
  this.maxforce = 1;
}
///////////////////////// WHEN THE MOUSE TOUCHES THE TEXT CAUSES THE PARTICLES TO FLY AWAY FROM THE MOUSE, WHICH THEY JOIN BACK TO ORIGINAL POSITION ONCE THE MOUSE IS GONE
Vehicle.prototype.behaviors = function() 
{
  var arrive = this.arrive(this.target);
  var mouse = createVector(mouseX, mouseY);
  var flee = this.flee(mouse);

  arrive.mult(1);
  flee.mult(6);

  this.applyForce(arrive);
  this.applyForce(flee);
}

Vehicle.prototype.applyForce = function(f) 
{
  this.acc.add(f);
}

Vehicle.prototype.update = function() 
{
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
}
/////////////// SETTING THE PARTICLES LOCATION
Vehicle.prototype.show = function() 
{
  stroke(random(255),random(255),random(255));
  strokeWeight(this.r);
  point(this.pos.x, this.pos.y);
}

////////////// WHEN THE MOUSE TOUCHES THE TEXT PARTICLES PUSH AWAY, THIS FUNCTION HELPS THEM TO FIND THEIR WAY BACK TO THEIR ORIGINAL PISITION
Vehicle.prototype.arrive = function(target) 
{
  var aim = p5.Vector.sub(target, this.pos);
  var d = aim.mag();
  var speed = this.maxspeed;
  if (d < 100)
  {
    speed = map(d, 0, 400, 0, this.maxspeed);
  }
  aim.setMag(speed);
  var steer = p5.Vector.sub(aim, this.vel);
  steer.limit(this.maxforce);
  return steer;
}
////////////////// THE PUSH AWAY FORCE WHEN THE MOUSE TOUCHES THE TEXT
Vehicle.prototype.flee = function(target) 
{
  var aim = p5.Vector.sub(target, this.pos);
  var d = aim.mag();
  if (d < 100)
  {
    aim.setMag(this.maxspeed);
    aim.mult(-1);
    var steer = p5.Vector.sub(aim, this.vel);
    steer.limit(this.maxforce);
    return steer;
  } else 
  {
    return createVector(0, 0);
  }
}


//////////////////// FIREWORKS , THE PARTICLES FOR THE FIREWORKS IN THE BACKFROUND, WHICH DECAY AFTER THEY EXPLODE
function Particle(x, y, hu, firework) 
{
  this.pos = createVector(x, y);
  this.firework = firework;
  this.lifespan = 255;
  this.hu = hu;
  this.acc = createVector(0, 0);
  
  if (this.firework) 
  {
    this.vel = createVector(0, random(-12, -8));
  } else 
  {
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(2, 40));
  }
 
  this.applyForce = function(force) 
  {
    this.acc.add(force);
  }
 ////////////////// THE DECAY OF THE FIREWORKS : LIFESPAN
  this.update = function() 
  {
    if (!this.firework) 
    {
      this.vel.mult(0.9);
      this.lifespan -= 4;
    }
    
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  this.done = function() 
  {
    if (this.lifespan < 0) 
    {
      return true;
    } else {
      return false;
    }
  }

  this.show = function() 
  {
    colorMode(HSB);
    
    if (!this.firework) 
    {
      strokeWeight(2);
      stroke(hu, 255, 255, this.lifespan);
    } else 
    {
      strokeWeight(4);
      stroke(hu, 255, 255);
    }
    
    point(this.pos.x, this.pos.y);
  }
}

///////// THE FUNCTION FIREWORKS WHICH USES THE FUNCTION PARTICLES
function Firework() 
{
  this.hu = random(255);
  this.firework = new Particle(random(width), height, this.hu, true);
  this.exploded = false;
  this.particles = [];

  this.done = function()
  {
    if (this.exploded && this.particles.length === 0) 
    {
      return true;
    } else {
      return false;
    }
  }

  this.update = function() 
  {
    if (!this.exploded) {
      this.firework.applyForce(gravity);
      this.firework.update();
      
      if (this.firework.vel.y >= 0)
      {
        this.exploded = true;
        this.explode();
      }
    }
    
    for (var i = this.particles.length - 1; i >= 0; i--) 
    {
      this.particles[i].applyForce(gravity);
      this.particles[i].update();
      
      if (this.particles[i].done())
      {
        this.particles.splice(i, 1);
      }
    }
  }

  this.explode = function() 
  {
    for (var i = 0; i < 100; i++) 
    {
      var p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
      this.particles.push(p);
    }
  }

  this.show = function() 
  {
    if (!this.exploded) 
    {
      this.firework.show();
    }
    
    for (var i = 0; i < this.particles.length; i++) 
    {
      this.particles[i].show();
    }
  }
}