function initialiseCobweb() {

    elementMap = document.getElementById('cobwebCanvas');
    
    if (elementMap != null) {

      
      ctxWeb = elementMap.getContext('2d');
      cobwebsliderRInfo = new sliderInfo(1000, 0, 3, 1.8);
      cobwebDp = 3;
      
      cobwebMaxR = 3;
      cobwebminR = 1.8;
      cobwebinitialR = 2.01;
      cobwebinitial= true;
      cobwebheight = 480;
      cobwebmaxX = 4/3;
      cobwebminX = 0;
      cobwebIterations = 200;
      cobwebx0 = 0.1;

      elementMap.width = cobwebheight;
      elementMap.height = cobwebheight;
      
      reLoad();
    

    //Slider
  $(function() {
      $("#sliderRValue").width(480);
      $("#sliderRValue").slider({
        min: 0,
        max: cobwebsliderRInfo.max,
        range: 'min',
        value: 0,
        create: function(event, ui){
          $(this).slider('value', (cobwebinitialR - cobwebsliderRInfo.cobwebminX) / cobwebsliderRInfo.scale);
        },
        slide: function( event, ui ) {
          $( "#RValue" ).html(' ' + (cobwebsliderRInfo.cobwebminX + (cobwebsliderRInfo.scale * ui.value)).toFixed(cobwebDp) + ' ');
          reLoad();
        }
     });
   $( "#RValue" ).html(' ' + (cobwebsliderRInfo.cobwebminX + cobwebsliderRInfo.scale * (cobwebsliderRInfo.cobwebminX + $( "#sliderRValue" ).slider( "values", 0 ))).toFixed(cobwebDp) + ' ');
   });

  }
}

  //Returns 2D array of first iteration against r
function calculateMapSimple(r) {
  var increment = (cobwebmaxX - cobwebminX) / cobwebheight;
  var xk1 = new Array();
  for (var x = cobwebminX; x < cobwebmaxX; x+= increment) {
    xk1.push(f(x, r));
  }
  return xk1;
}
  
  //Draws the Map
function drawMapSimple(set, imgMap, ctx){
  var scalar = (1/ (cobwebmaxX - cobwebminX)) * cobwebheight;

  ctx.lineWidth=2.5;
  ctx.strokeStyle="#556270";
  ctx.beginPath();
  ctx.setLineDash([]);

  
  for (var i = 0; i < set.length; i++) {
      ctx.moveTo(i,Math.floor(cobwebheight - (set[i] * scalar)));
      ctx.lineTo(i+1,Math.floor(cobwebheight - (set[i+1] * scalar)));
  }
  ctx.stroke();
}
  
function drawCobwebSimple(r, ctx) {
  var xk1 = f(cobwebx0, r);
  var xk = cobwebx0;
  var sliderScale = (1/ (cobwebmaxX - cobwebminX)) * cobwebheight;


  ctx.clearRect(0, 0, cobwebheight, cobwebheight);
  drawAxisSimple(ctx, cobwebheight, cobwebheight, 0.05, 0);
  ctx.lineWidth=0.4;
  ctx.beginPath();
  ctx.strokeStyle="#a2ab58";

  //Line from x axis
  ctx.moveTo(cobwebx0 * sliderScale, cobwebheight);
  ctx.lineTo(cobwebx0 * sliderScale, cobwebheight - cobwebx0 * sliderScale);
  ctx.setLineDash([]);
  //Cobweb lines
  for (var i = 0; i < cobwebIterations; i++) {
    ctx.moveTo(xk * sliderScale, cobwebheight - xk * sliderScale);
    ctx.lineTo(xk * sliderScale, cobwebheight - xk1 * sliderScale);
    ctx.moveTo(xk * sliderScale, cobwebheight - xk1 * sliderScale);
    ctx.lineTo(xk1 * sliderScale, cobwebheight - xk1 * sliderScale);
    xk = xk1;
    xk1 = f(xk, r);
  }
  ctx.stroke();
  
  //Line y = x
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(0, sliderScale * cobwebmaxX);
  ctx.lineTo(cobwebmaxX * sliderScale, 0);
  ctx.lineWidth=2;
  ctx.strokeStyle="Black";
  ctx.stroke();
}
  
  //Axis for Map
function drawAxisSimple(ctx, w, h, inc, init) {
  var boldLineSpaces = 5;
  ctx.beginPath();
  ctx.setLineDash([]);
  ctx.strokeStyle = "#556270";
  for (var i = 0; i < h; i += h * (inc / (cobwebmaxX - cobwebminX))) {
    ctx.lineWidth=0.25;
    ctx.moveTo(i, 0);
    ctx.lineTo(i,h);
    ctx.moveTo(0,h - i);
    ctx.lineTo(h,h - i);
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 0.5;
  for (var i = 0; i < h; i += boldLineSpaces * h * (inc / (cobwebmaxX - cobwebminX))) {
    ctx.font="13px Lato";
    ctx.fillText("f (x)", 10, 13);
    ctx.fillText("x",  cobwebheight - 10, cobwebheight - 12);
    ctx.font="11px Lato";
    if (i != 0) {
      ctxWeb.fillText(Math.round(100 * i * (cobwebmaxX - cobwebminX) / cobwebheight)/100,i,cobwebheight - 2);
    }
    ctxWeb.fillText(Math.round(100 * (2*i - i) * (cobwebmaxX - cobwebminX) / cobwebheight)/100, 2, cobwebheight - i - 1);
    ctx.moveTo(i, 0);
    ctx.lineTo(i,h);
    ctx.moveTo(0,h - i);
    ctx.lineTo(h,h - i);
  }
  ctx.stroke();
}
  
  //Called everytime sliders move and on document load
  //Finds values from sliders, calculates sets of iterations and then plots them
  function reLoad() {
    var currentR;
    if (cobwebinitial) {

      currentR = cobwebinitialR;
      cobwebinitial= false;
    } else {
      currentR = cobwebsliderRInfo.cobwebminX + $("#sliderRValue").slider("option", "value") * cobwebsliderRInfo.scale;
    }
    drawCobwebSimple(currentR, ctxWeb);
    imgMap = ctxWeb.createImageData(cobwebheight,cobwebheight);
    var set = calculateMapSimple(currentR);
    drawMapSimple(set, imgMap, ctxWeb);
  }

  function sliderInfo(max, min, cobwebmaxX, cobwebminX) {
    this.max = max;
    this.min = min;
    this.cobwebmaxX = cobwebmaxX;
    this.cobwebminX = cobwebminX;
    this.scale = (cobwebmaxX - cobwebminX) / (max - min);
  }


