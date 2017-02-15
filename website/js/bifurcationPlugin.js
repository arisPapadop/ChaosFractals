function bifurcation(elmMap, elmBif, zoom, width, height) {

    var zoom   = zoom   || false;
    var width  = width  || 648;
    var height = height || 432;
    var cobwebIterations = 200;
    var x0= 0.1, minR = 1.95, maxR = 3, minX = 0, maxX = 4/3, minY = 0, maxY= 4/3, initialR = 2.5;
    var EPSILON = 0.00001;

    if (elmBif != null) {

        var ctxB = elmBif.getContext('2d');
        var imgData = ctxB.createImageData(width, height);

        elmBif.height = height;
        elmBif.width  = width;

        var mouseDownCoord = false;
        var mouseUpCoord = false;
        var mousePressed = false;

        if (zoom) {

            var imgDataZoom = ctxB.createImageData(width, height);

            elmBif.addEventListener('mousemove', function(e){
              rect = elmBif.getBoundingClientRect();
              mouseUpCoord = new Coord(e.clientX - rect.left - 2, e.clientY - rect.top);
              updateMouseMove( mouseUpCoord );
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

                ctxB.fillStyle="#a2ab58";
                ctxB.globalAlpha=0.2;
                ctxB.fillRect(mouseDownCoord.x, mouseDownCoord.y, xDiff, yDiff);
                mouseUpCoord.x = mouseDownCoord.x + xDiff;
                mouseUpCoord.y = mouseDownCoord.y + yDiff;

                ctxB.stroke();
              }
            }, false);

            elmBif.addEventListener('mousedown', function(e){
              rect = elmBif.getBoundingClientRect();
              mouseDownCoord = new Coord(e.clientX - rect.left, e.clientY - rect.top);
              
              mousePressed = true;
            }, false);

            elmBif.addEventListener('mouseup', function(e){
                mousePressed = false;

                
                var left = Math.min(mouseUpCoord.x, mouseDownCoord.x);
                var right = Math.max(mouseUpCoord.x, mouseDownCoord.x);
                //Duplication
                var newMinR = minR + left * (maxR - minR) / width;
                var newMaxR = minR + right * (maxR - minR) / width;

                if (Math.abs(newMaxR - newMinR) > EPSILON) {

                  var newMaxY = minY + ((maxY - minY) / height) * Math.max(height - mouseUpCoord.y, height - mouseDownCoord.y);
                  var newMinY = minY + ((maxY - minY) / height) * Math.min(height - mouseUpCoord.y, height - mouseDownCoord.y);
                  
                  minR = newMinR;
                  maxR = newMaxR;
                  minY = newMinY;
                  maxY = newMaxY;
                  reDraw(2000);
                
                } else {
                  alert("This range is too small to calculate.");
                  reset();
                }
            }, false);


            $('#resetButton').click(function() {
                reset();
            });
        
        } else {
            elmBif.addEventListener('mousemove', function(e) {
              rect = elmBif.getBoundingClientRect();
              mouseUpCoord = new Coord(e.clientX - rect.left - 2, e.clientY - rect.top);
              updateMouseMove(mouseUpCoord);}, false);
        }
    }

    var ctxM = elmMap.getContext('2d');
    var imgMap = ctxM.createImageData(height, height);
    var heightWidthRatio = height / width;

    elmMap.height = height;
    elmMap.width  = height;

    reDraw(1000);

    function reset() {
      minR = 1.95;
      maxR = 3;
      minX = 0;
      maxX = 4/3;
      minY = 0;
      maxY = 4/3;
      initialR = 2.5;
      reDraw(1000);
    }

    function reDraw(iterations) {
      ctxB.clearRect(0, 0, width, height);
      drawBif(calculateBif(iterations), imgData, ctxB, minY, maxY);
      drawMap(calculateMap(2), imgMap, ctxM);
      updateMouseMove(new Coord(Math.round((initialR - minR) * width /(maxR - minR)), 0));
      drawMapBounds();
    }

    //Returns a 2D array corresponding to r values and corresponding iterations
    function calculateBif(iterations) {
      imgData = ctxB.createImageData(width,height);

      var increment = (maxR - minR) / width;
      var rs = new Array();
      for (var i = minR; i < maxR; i+= increment) {
        rs.push(iterate(i, iterations));
      }
      return rs;
    }

    //Verhulst Process
    function f(x, r) {
      return x + r*x*(1-x);
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

      ctx.clearRect(0, 0, height, height);
      drawAxis(ctx, height, height, 0.05, 0);
      ctx.lineWidth=0.4;
      ctx.beginPath();
      ctx.strokeStyle="#a2ab58";

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
          ctxM.fillText(Math.round(100 * i * (maxX - minX) / height)/100,i,height - 2);
        }
        ctxM.fillText(Math.round(100 * (2*i - i) * (maxX - minX) / height)/100, 2, height - i - 1);
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
      ctxM.globalAlpha = 0.2
      ctxM.fillStyle = "#000000";
      ctxM.fillRect(0, 0, height, upperBound);
      ctxM.fillRect(0, lowerBound, height, height);
      ctxM.globalAlpha = 1;
      ctxM.beginPath();
      ctxM.lineWidth=0.8;
      ctxM.strokeStyle = "Black";
      ctxM.moveTo(height, upperBound);
      ctxM.lineTo(0, upperBound);
      ctxM.moveTo(height, lowerBound);
      ctxM.lineTo(0, lowerBound);
      ctxM.stroke();
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
      ctxB.putImageData(imgData,0,0);
      ctxB.beginPath()
      ctxB.strokeStyle="#a2ab58";
      ctxB.moveTo(coord.x, height);
      ctxB.lineTo(coord.x, 0);
      ctxB.stroke();

      var currentR = (maxR - minR) * coord.x / (width) + minR;
      //Outputs current value of r
      ctxB.fillStyle = "Black";
      ctxB.globalAlpha = 1;
      ctxB.font="20px Lato";
        ctxB.fillText("r = " + currentR.toFixed(3),10,height - 10);
      imgMap = ctxM.createImageData(height,height);
      var set = calculateMap(currentR);
      drawCobweb(currentR, ctxM);
      drawMap(set, imgMap, ctxM);
      drawMapBounds();
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
}