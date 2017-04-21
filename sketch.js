var particles = [], 
//lines = [],
bGCircle = [],
triangles = [],
burstLines = [],
stripes = [],
textdrops = [];

var numOfParts = 5,
numOfBGC = 1,
numOfLines = 15;
var input;
var analyzer, mic, fft;
var vol = 0.5;
var bgD = 0;
var c = ['#FB5E97', '#9ACBA7', '#FADBC3', '#FB960A']; //'#4D2833',
var blows = 0;
var sz = 1, stk = 1, spe = 1;
var doesExplode = false;
var bg = 0;
var pw, ph;
var interval, hue;
var minvol = 0.2, suppressor, supInterval;
var isLostCtrl;
var img, imgTrans = 255;
var vid, vidMove, vidStill;
var samePerson;
var timePressed;
var doesShowText = false ,textInterval;
var tfade = .03;
var opa;
var changeBCTimer = 40;

function preload() {
  font = loadFont("lib/Sue Ellen Francisco.ttf");
}

function reset(){
  if (suppressor !== 1) {
    blendImg();
    $(".text.active").removeClass("active");
    isLostCtrl = false;
    doesShowText = false;
    // clearInterval(interval);
    clearInterval(supInterval);
    vol = mic.getLevel();
    minvol = 0.12;
    console.log("reset!");
    suppressor = 1;
    imgTrans = 255;
    sat = 255;
    tfade = random(.01, .05);
    opa = 0;
  }
}

function initializeStripe() {
  for (var j = 0; j < 1; j++) {
    stripes.push(new stripe(10));
  }
}

function initializeBGCircle() {
  for (var j = 0; j < numOfBGC; j++) {
    bGCircle.push(new BgCircle(vol * 300));
  }
}

function initializeTris(){
  triangles.push(new tri(random(width),random(height),random(vol *300, vol *400)));
}

function initicalizeParticles(){
  for (var i = 0; i < numOfParts; i++) {
    particles.push(new Circle(pw, ph, random(vol * 800, vol * 300)));
  }
}

function initicalizeLines(){
  for (var i = 0; i < numOfLines; i++) {
    burstLines.push(new strokeline(random(width),random(height), vol*20));
  }
}

function initicalizeTextdrops(){
    textdrops.push(new texts(tfade));
}


function setup() {
  samePerson = new Date();
  hue = 100;
  sat = 255;
  opa = 0;

  // frameRate(25);
  suppressor = 1;
  isLostCtrl = false;
  const bubble = select('#bubble');
  timePressed = 0;
  createCanvas(windowWidth, windowHeight).parent('bubble');


 vidStill = loadImage('img/3.jpg');
  vidMove = createVideo('img/3.webm');
  vid = vidStill;
  // vidMove.loop();
  vidMove.hide();

  imageMode(CENTER);

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
  interval = setInterval(changeBgC, changeBCTimer);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // background(0);
  // background(c[bg]);

  var spectrum = fft.analyze();
  vol = mic.getLevel();
  var env1 = fft.getEnergy(120);
  var env2 = fft.getEnergy(170);
  var env3 = fft.getEnergy(230);
  var env4 = fft.getEnergy(690);
  var env5 = fft.getEnergy(900);


  if (keyIsDown(32)) {

    ///////////// hands ON starts /////////////

    var stage1 = 7;
    var stage2 = stage1 + 9;
    var stage3 = stage2 + 21;
    var stage4 = stage3 + 3;
    var stage5 = stage4 + 30;

        if (suppressor == 1) {
          $("div.sign").addClass("active");
        }

// start to getget small
    if((new Date() - timePressed)/1000 > 8) {
      losingCtrl();
    }

    if (isLostCtrl == true){
      console.log(suppressor);

      if (suppressor >= stage5) {
        clearInterval(supInterval);
      }
      vol = vol / suppressor;
      minvol = minvol / suppressor;
    }

    background(c[bg]);

    if (suppressor > stage3 - 2) {
        background(255, opa);
        opa = lerp(opa, 255, .03);
    }
    if (suppressor >=70) {
      vid = vidStill;
   } else if (suppressor >= stage4 && suppressor < stage5) {
      if(env3 > 110){
        showText();
      }
    } else if (suppressor >= stage3 && suppressor < stage4) {
        tfade = .7;
    } else if (suppressor >= stage2 && suppressor < stage3) {
      if(env3 > 110){
        initicalizeTextdrops();
      }
    } else if (suppressor > stage1 + 2 && suppressor < stage2) {
      if(env3 > 110){
        initializeBGCircle();
        if(env4 > 230) {
        bg = round(random(c.length-1));
        }
      }
    } else if (suppressor < stage1) {

    ///////////// begining stage 
      if (vol > minvol && vol < 0.5 && env5 > 140) {
        if (env1 > 120) {
          bg = round(random(c.length-1));
        }
        if(env2 > 130) {
          initializeTris();
        }
        if(env3 > 100 || env3 < 190) {
          initicalizeParticles();
          pw = random(width);
          ph = random(height);
        }
        if(env4 > 230) {
          initicalizeLines();
        }
        if(env5 > 400) {
          initializeStripe();
          bg = round(random(c.length-1));
        }
        $('div.sign.active').addClass('gone');
      }
    }
        ///////////// hands ON finsih /////////////

  } else {

    ///////////// hands off starts /////////////

    $('div.sign.active.gone').removeClass('gone');
    $('div.sign.active').removeClass('active');



    isHandOn = false;
    if ((new Date() - samePerson)/1000 < 3 && suppressor >= 1) {
    } else {
       reset();
    }
    if (suppressor >=70) {
        reset();
    }
    ///////////// hands off finsih /////////////
  }

  goCircle();
 
  if (suppressor >= 40) {
  }else{
     blendImg();
  }
}

function showText() {
  if (!doesShowText) {
    doesShowText = true;
    poem();
  }  
}

function poem(){
  $("div.text:first").addClass("active");
          textInterval = setInterval(function(){
              var next = $('div.text.active').removeClass('active').next('div.text');
              if (!next.length) clearInterval(textInterval);
              next.addClass('active');
          }, 5000);
}

function losingCtrl(){
  if (!isLostCtrl) {
    isLostCtrl = true;
    console.log("lost control now");
    supInterval = setInterval(suppress, 1000);
  }
}

function suppress(){
  suppressor++;
}

function keyReleased(){
      vid = vidStill;
  vidMove.stop();
    samePerson = new Date();
    interval = setInterval(changeBgC, changeBCTimer);
}

function keyPressed(){
    vidMove.loop();
   vid = vidMove;
    clearInterval(interval);
    timePressed = new Date();
}

function changeBgC(){
  colorMode(HSB, 255);
  background(hue, 255, 255);
  hue = hue + .2;
  if (hue > 255) {
    hue = 1;
  }
}

function goCircle() {
  // for (var i = lines.length - 1; i >= 0; i--) {
  //   lines[i].display();
  //   lines[i].move();

  //   if (lines[i].isFinished()) {
  //     lines.splice(i, 1);
  //   }
  // }

  for (var i = triangles.length - 1; i >= 0; i--) {
    triangles[i].display();
    triangles[i].move();

    if (triangles[i].isFinished()) {
      triangles.splice(i, 1);
    }
  }

  for (var i = bGCircle.length - 1; i >= 0; i--) {
    bGCircle[i].display();
    bGCircle[i].move()

    if (bGCircle[i].isFinished()) {
      bGCircle.splice(i, 1);
    }
  }

  for (var i = particles.length - 1; i >= 0; i--) {
    particles[i].display();
    particles[i].move();

    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }

  for (var i = burstLines.length - 1; i >= 0; i--) {
   burstLines[i].update();
   burstLines[i].show();
   
     if (burstLines[i].isFinished()) {
       burstLines.splice(i, 1);
     }
  }

 for (var i = stripes.length - 1; i >= 0; i--) {
  stripes[i].display();
  stripes[i].move()

    if (stripes[i].isFinished()) {
      stripes.splice(i, 1);
    }
  }

  for (var i = textdrops.length - 1; i >= 0; i--) {
    textdrops[i].move();
        textdrops[i].fade();
    textdrops[i].display();

    if (textdrops[i].isFinished()) {
      textdrops.splice(i, 1);
    }
  }
}

function blendImg(){
  var imgD = (windowWidth + windowHeight) / 2;
  blend(vid, 0, 0, 1080, 1080, (windowWidth - imgD) / 2, (windowHeight - imgD) / 2, imgD, imgD, LIGHTEST);
}