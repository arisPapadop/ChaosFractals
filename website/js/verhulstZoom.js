
{
  var elementBifurcation = document.getElementById('BifurcationCanvas');
  var elementMap = document.getElementById('MapCanvas');
  var ctxBif = elementBifurcation.getContext('2d');
  var ctxMap = elementMap.getContext('2d');

  var mouseDownCoord, mouseUpCoord, mousePressed = false;
  var portionOfScreen = 0.28;
  var width = Math.round(portionOfScreen * screen.height) * 3;
  var height = Math.round(portionOfScreen * screen.height) * 2;
  var heightWidthRatio = height / width;
  var set = new TwoDArray(width, height);
  var imgData = ctxBif.createImageData(width,height), imgMap = ctxMap.createImageData(height,height);
  //Numerical values
  var x0 = 0.1, minR = 1.95, maxR = 3, minX = 0, maxX = 4/3, minY = 0, maxY = 4/3, initialR = 2.5, cobwebIterations = 200;
}

//Starts script
window.load = initialise();
function initialise() {
  elementBifurcation.height = height;
  elementBifurcation.width = width;
  elementMap.height = height;
  elementMap.width = height;
  reDraw(1000);
}
  
//Handles all drawing
function reDraw(iterations) {
  ctxBif.clearRect(0, 0, width, height);
  drawBif(calculateBif(iterations), imgData, ctxBif, minY, maxY);
  drawMap(calculateMap(2), imgMap, ctxMap);
  updateMouseMove(new Coord(Math.round((initialR - minR) * width /(maxR - minR)), 0));
  drawMapBounds();
}

//Verhulst Process
function f(x, r) {
  return x + r*x*(1-x);
}

//Returns a 2D array corresponding to r values and corresponding iterations
function calculateBif(iterations) {
  imgData = ctxBif.createImageData(width,height);

  var increment = (maxR - minR) / width;
  var rs = new Array();
  for (var i = minR; i < maxR; i+= increment){
    rs.push(iterate(i, iterations));
  }
  return rs;
}
  
//Performs iterative process on initial value x0
function iterate(r, ITERATIONS) {
  iterations = new Array(ITERATIONS);
  iterations[0] = f(x0, r);
  for (var i = 1; i < ITERATIONS; i++) {
    iterations[i] = f(iterations[i - 1], r);
  }
  return iterations;
}

//Returns 2D array of first iteration against r
function calculateMap(r) {
  var increment = (maxX - minX) / height;
  var xk1 = new Array();
  for (var x = minX; x < maxX; x+= increment) {
    xk1.push(f(x, r));
  }
  return xk1;
}

//Draws the 
function drawMap(set, imgMap, ctx){
  var scalar = (1/ (maxX - minX)) * height;
  ctx.lineWidth=2.5;
  ctx.strokeStyle="#556270";
  ctx.beginPath();
  ctx.setLineDash([]);

  
  for (var i = 0; i < set.length; i++) {
      ctx.moveTo(i,Math.floor(height - (set[i] * scalar)));
      ctx.lineTo(i+1,Math.floor(height - (set[i+1] * scalar)));
  }
  ctx.stroke();
}
  
function drawCobweb(r, ctx) {
  var xk1 = f(x0, r), xk = x0;
  var sliderScale = (1/ (maxX - minX)) * height;

  ctx.clearRect(0, 0, MapCanvas.width, MapCanvas.height);
  drawAxis(ctx, height, height, 0.05, 0);
  ctx.lineWidth=0.4;
  ctx.beginPath();
  ctx.strokeStyle="Green";

  //Line from x axis
  ctx.moveTo(x0 * sliderScale, height);
  ctx.lineTo(x0 * sliderScale, height - x0 * sliderScale);

  //Cobweb lines
  for (var i = 0; i < cobwebIterations; i++) {
    ctx.moveTo(xk * sliderScale, height - xk * sliderScale);
    ctx.lineTo(xk * sliderScale, height - xk1 * sliderScale);
    ctx.moveTo(xk * sliderScale, height - xk1 * sliderScale);
    ctx.lineTo(xk1 * sliderScale, height - xk1 * sliderScale);
    xk = xk1;
    xk1 = f(xk, r);
  }
  ctx.stroke();
  
  //Line y = x
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(0, sliderScale * maxX);
  ctx.lineTo(maxX * sliderScale, 0);
  ctx.lineWidth=2;
  ctx.strokeStyle="Black";
  ctx.stroke();
}

//Axis for Map
function drawAxis(ctx, w, h, inc, init) {
  var boldLineSpaces = 5;
  ctx.beginPath();
  ctx.setLineDash([]);
  ctx.strokeStyle = "#556270";
  for (var i = 0; i < h; i += h * (inc / (maxX - minX))) {
    ctx.lineWidth=0.25;
    ctx.moveTo(i, 0);
    ctx.lineTo(i,h);
    ctx.moveTo(0,h - i);
    ctx.lineTo(h,h - i);
  }
  ctx.stroke();
  
  ctx.beginPath();
  ctx.lineWidth = 0.5;
  for (var i = 0; i < h; i += boldLineSpaces * h * (inc / (maxX - minX))) {
    ctx.font="13px Arial";
    ctx.fillText("f [x]", 10, 13);
    ctx.fillText("x",  height - 10, height - 12);
    ctx.font="11px Arial";
    if (i != 0) {
      ctxMap.fillText(Math.round(100 * i * (maxX - minX) / height)/100,i,height - 2);
    }
    ctxMap.fillText(Math.round(100 * (2*i - i) * (maxX - minX) / height)/100, 2, height - i - 1);
    ctx.moveTo(i, 0);
    ctx.lineTo(i,h);
    ctx.moveTo(0,h - i);
    ctx.lineTo(h,h - i);
  }
  ctx.stroke();
}
  
function drawMapBounds() { //Duplication
  var lowerBound = height - (minY - minX) * height / (maxX - minX);
  var upperBound = (maxX - maxY) * height / (maxX - minX);
  ctxMap.globalAlpha = 0.2
  ctxMap.fillStyle = "#000000";
  ctxMap.fillRect(0, 0, height, upperBound);
  ctxMap.fillRect(0, lowerBound, height, height);
  ctxMap.globalAlpha = 1;
  ctxMap.beginPath();
  ctxMap.lineWidth=0.8;
  ctxMap.strokeStyle = "Black";
  ctxMap.moveTo(height, upperBound);
  ctxMap.lineTo(0, upperBound);
  ctxMap.moveTo(height, lowerBound);
  ctxMap.lineTo(0, lowerBound);
  ctxMap.stroke();
}

function drawBif(set, imgData, ctx, yMin, yMax){ //Bifurcation
  var currentIterate;
  var maxToPlot = 1500;
  var numberToPlot = Math.round(1000 / Math.pow ((maxY - minY), 1));
  if (numberToPlot > set[0].length - 1) {
    numberToPlot = set[0].length - 1;
  }
  for (var i = 0; i < set.length - 1; i++) {
    currentIterate = set[i];
    for (var j = currentIterate.length - numberToPlot; j < currentIterate.length; j++) {
      //Y coordinate
        k = Math.floor(((currentIterate[j] - minY) * height / (maxY - minY)));
      k = (height - k) * width;
      //X coordinate
        k = k + i;

      imgData.data[4*k+0]=46;
      imgData.data[4*k+1]=56;
      imgData.data[4*k+2]=66;
      imgData.data[4*k+3]=50 + imgData.data[4*k+3];
    }
  }
  ctx.putImageData(imgData,0,0);
}
  
function updateMouseMove(coord) {
  ctxBif.putImageData(imgData,0,0);
  ctxBif.beginPath()
  ctxBif.strokeStyle="Green";
  ctxBif.moveTo(coord.x, height);
  ctxBif.lineTo(coord.x, 0);
  ctxBif.stroke();

  var currentR = (maxR - minR) * coord.x / (width) + minR;
  //Outputs current value of r
  ctxBif.fillStyle = "Black";
  ctxBif.globalAlpha = 1;
  ctxBif.font="20px Arial";
    ctxBif.fillText("r = " + currentR.toFixed(3),10,height - 10);
  imgMap = ctxMap.createImageData(height,height);
  var set = calculateMap(currentR);
  drawCobweb(currentR, ctxMap);
  drawMap(set, imgMap, ctxMap);
  drawMapBounds();
}

BifurcationCanvas.onmousemove = function(e){
  mouseUpCoord = new Coord(e.clientX - elementBifurcation.offsetLeft - 2, e.clientY - elementBifurcation.offsetTop);
  updateMouseMove(mouseUpCoord);
  if (mousePressed) {
  //Box fitting
		var xDiff = (mouseUpCoord.x - mouseDownCoord.x) + 1;
		var yDiff = (mouseUpCoord.y - mouseDownCoord.y);
    if ((yDiff / xDiff) < heightWidthRatio) {
			xDiff = yDiff / heightWidthRatio;
			mouseUpCoord.x = mouseDownCoord.x + xDiff;
    } else {
        yDiff = heightWidthRatio * xDiff;
        mouseUpCoord.y = mouseDownCoord.y + yDiff;
    }

    ctxBif.fillStyle="Green";
    ctxBif.globalAlpha=0.2;
    ctxBif.fillRect(mouseDownCoord.x, mouseDownCoord.y, xDiff, yDiff);
    mouseUpCoord.x = mouseDownCoord.x + xDiff;
    mouseUpCoord.y = mouseDownCoord.y + yDiff;

    ctxBif.stroke();
  }
}

BifurcationCanvas.onmousedown = function(e){
  mouseDownCoord = new Coord(e.clientX - elementBifurcation.offsetLeft, e.clientY - elementBifurcation.offsetTop);
  mousePressed = true;
}

BifurcationCanvas.onmouseup = function(e){
    mousePressed = false;
     
    var left = Math.min(mouseUpCoord.x, mouseDownCoord.x);
    var right = Math.max(mouseUpCoord.x, mouseDownCoord.x);
    //Duplication
    var newMinR = minR + left * (maxR - minR) / width;
    var newMaxR = minR + right * (maxR - minR) / width;
    var newMaxY = minY + ((maxY - minY) / height) * Math.max(height - mouseUpCoord.y, height - mouseDownCoord.y);
    var newMinY = minY + ((maxY - minY) / height) * Math.min(height - mouseUpCoord.y, height - mouseDownCoord.y);
    
    minR = newMinR;
    maxR = newMaxR;
    minY = newMinY;
    maxY = newMaxY;
    reDraw(2000);
}

function RGB(red, green, blue) {
  this.red = red;
  this.green = green;
  this.blue = blue;
}
  
function TwoDArray(x, y) {
  var a = new Array(x);
  //Defining array for all coordinates
  for(var i = 0; i < x; i++){
    a[i] = new Array(y);
  }
  return a;
}
  
function Coord(x, y) {
  this.x = x;
  this.y = y;
}