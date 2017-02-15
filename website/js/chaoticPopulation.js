
  function initialisePopulation() {

    var elementPopulation = document.getElementById('PopulationCanvas');

    if (elementPopulation != null) {
      ctxPop = elementPopulation.getContext('2d');
      popDp = 3;
      popSliderXInfo = new sliderInfoPop(1000, 0, 1, 0);
      popSliderRInfo = new sliderInfoPop(1000, 0, 3, 1.8);

      popInitialx1 = 0.5;
      popInitialx2 = 0.75;
      popInitialR = 1.95;
      popInitial= true;
      graphPopulationInfo = new graphInfo(1000, 300, 4/3, 0, Math.round(1000/15 + 15), 0);
      elementPopulation.height = graphPopulationInfo.height;
      elementPopulation.width = graphPopulationInfo.width;
      
      reLoadPop();

      var v1 = "Orange: ", v2 = " Green: ";
     $(function() {
        $("#sliderInitialValue").width(1000);
        $( "#sliderInitialValue" ).slider({
          range: true,
          min: 0,
          max: popSliderXInfo.max,
          values: [ 300, 0],
          create: function(event, ui){
            $(this).slider('values', [(popInitialx1 - popSliderXInfo.minX) / popSliderXInfo.scale, (popInitialx2 - popSliderXInfo.minX) / popSliderXInfo.scale]);
          },
          slide: function( event, ui ) {
            $("#InitialValues").html( ' <span style="color: #a2ab58">' + (popSliderXInfo.scale * ui.values[ 0 ]).toFixed(popDp) + '</span>, ' + '<span style="color: #f2784b"> ' + (popSliderXInfo.scale * ui.values[ 1 ]).toFixed(popDp) + '</span>');
            reLoadPop();
          }
       });
       $( "#InitialValues" ).html(' <span style="color: #a2ab58">' + (popSliderXInfo.scale * $( "#sliderInitialValue" ).slider( "values", 0 )).toFixed(popDp) + '</span>, ' + ' <span style="color: #f2784b">' + (popSliderXInfo.scale * $( "#sliderInitialValue" ).slider( "values", 1 )).toFixed(popDp)  + '</span>');
       });

    $(function() {
      $("#popSliderRValue").width(1000);
      $( "#popSliderRValue" ).slider({
          min: popSliderRInfo.min,
          max: popSliderRInfo.max,
          value: 2.67, 
          create: function(event, ui){
            $(this).slider('value', (popInitialR - popSliderRInfo.minX) / popSliderRInfo.scale);
          },
          slide: function( event, ui ) {
            $( "#popRValue" ).html((popSliderRInfo.minX + (popSliderRInfo.scale * ui.value)).toFixed(popDp));
            reLoadPop();
          }
       });
     $( "#popRValue" ).html( (popSliderRInfo.minX + popSliderRInfo.scale *3* (popSliderRInfo.minX + $( "#popSliderRValue" ).slider( "values", 0 ))).toFixed(popDp));
     });

    }
  }

  //Verhulst Process
  function f(x, r) {
    return x + r*x*(1-x);
  }
  
  //Creates a list of iterations given popInitialvalue and r value
  function createSet(x0, r) {
    var currentY = x0;
    var set = [];
    for (var i = 0; i < graphPopulationInfo.minN; i++) {
      currentY = f(currentY, r);
    }
    for (var i = graphPopulationInfo.minN; i < graphPopulationInfo.maxN; i++) {
      set.push(currentY);
      currentY = f(currentY, r);
    }
    return set;
  }
  
  //Called everytime sliders move and on document load
  //Finds values from sliders, calculates sets of iterations and then plots them
  function reLoadPop() {
    var x1, x2, currentR;
    if (popInitial) {
      currentR = popInitialR;
      x1 = popInitialx1;
      x2 = popInitialx2;
      popInitial= false;
    } else {
      currentR = popSliderRInfo.minX + $("#popSliderRValue").slider("option", "value") * popSliderRInfo.scale;
      var initialValues = $("#sliderInitialValue").slider("option", "values");
      x1 = popSliderXInfo.minX + initialValues[0] * popSliderXInfo.scale;
      x2 = popSliderXInfo.minX + initialValues[1] * popSliderXInfo.scale;
    }
    
    var set1 = createSet(x1, currentR);
    var set2 = createSet(x2, currentR);
    ctxPop.clearRect(0, 0, graphPopulationInfo.width, graphPopulationInfo.height);
    ctxPop.strokeStyle = "#a2ab58";
    plot(set1);
    ctxPop.strokeStyle = "#f2784b";
    plot(set2);
  }
  
  //Plots a set of iterations on the canvas
  function plot(set1) {
    var currentY, prevY = set1[0];
    ctxPop.beginPath();
    for (var i = 1; i < set1.length; i++) {
      currentY = set1[i] / graphPopulationInfo.scaleY;
      ctxPop.moveTo((i - 1) / graphPopulationInfo.scaleN , graphPopulationInfo.height - prevY);
      ctxPop.lineTo(i / graphPopulationInfo.scaleN , graphPopulationInfo.height - currentY);
      prevY = currentY;
    }
    ctxPop.stroke();
  }

  function getValues() {
    var total = 0;
    $("div[id^='slider']").each(function () {
        var values = $(this).slider("option", "values");
        total += values[1] + values[0];
    });
    console.log(total);
  }

  function sliderInfoPop(max, min, maxX, minX) {
    this.max = max;
    this.min = min;
    this.maxX = maxX;
    this.minX = minX;
    this.scale = (maxX - minX) / (max - min);
  }

  function graphInfo(width, height, maxY, minY, maxN, minN) {
    this.width = width;
    this.height = height;
    this.maxY = maxY;
    this.minY = minY;
    this.maxN = maxN;
    this.minN = minN;
    this.scaleY = (maxY - minY) / height;
    this.scaleN = (maxN - minN) / width;
  }