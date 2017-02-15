function imageLoader() {
  var imageLoader = document.getElementById('imageLoader');
      imageLoader.addEventListener('change', handleImage, false);
  var ImageCanvas = document.getElementById('imageCanvas');
  var ctxImage = ImageCanvas.getContext('2d');
  var receivedCanvas = document.getElementById('receivedCanvas');
  var ctxReceived = receivedCanvas.getContext('2d');
  var imgData;
  var initialPoint = new Point(1, 1, 1);
  var t = 0.000008;
  var maxIterationsToSynchronise = 850000;
  var sliderRInfo = new sliderInfo(maxIterationsToSynchronise, 0, maxIterationsToSynchronise, 0);
  var initialR = 30000;
    
  var Key = new Key(10, 28, 8/3);

  width  = 540;
  height = 640;

  $(function() {
    $("#sliderRValue").width(600);
    $( "#sliderRValue" ).slider({
      min: 0,
      max: sliderRInfo.max,
      value: 0,
      create: function(event, ui){
        $(this).slider('value', (initialR - sliderRInfo.minX) / sliderRInfo.scale);
      },
      slide: function( event, ui ) {
        $( "#RValue" ).html((sliderRInfo.minX + (sliderRInfo.scale * ui.value)));
        $( "#RValuext" ).html((t * (sliderRInfo.minX + (sliderRInfo.scale * ui.value))).toFixed(3));
        reLoad();
      }
   });
  $( "#RValue" ).html(initialR);
  $( "#RValuext" ).html((t * initialR).toFixed(3));
  });

  function LorenzOrbit(initialCoord, iterations, t, data) {
    var Sender = new Point(initialCoord.x, initialCoord.y, initialCoord.z);
    var Receiver = new Point(0.2, -9, 1);
    
    //Synchronise
    for ( i = 0; i < iterations; i++ ){
      Sender = iterateSender(Sender, Key, t);
      Receiver = iterateReceiver(Sender.x, Receiver, Key, t);
    }
    
    //Send data
    for ( i = 0; i < data.length; i++ ){
      mT = data[i];
      
      Sender = iterateSender(Sender, Key, t);
      var sT = Sender.x + mT;
      
      Receiver = iterateReceiver(sT, Receiver, Key, t);//new Point(Sender.x, Sender.y, Sender.z)
      data[i] = (sT - Receiver.x);
    }
    
    return data;
  }

  function iterateSender(coord, Key, t) {
    return new Point(coord.x + t * Key.a * (coord.y - coord.x)
                    ,coord.y + t * (coord.x * (Key.b - coord.z) - coord.y)
                    ,coord.z + t * (coord.x * coord.y - Key.c * coord.z));
  }
    
  function iterateReceiver(Xt, Receiver, Key, t) {
    return new Point(Receiver.x + t * Key.a * (Receiver.y - Receiver.x)
                    ,Receiver.y + t * (Xt * (Key.b - Receiver.z) - Receiver.y)
                    ,Receiver.z + t * (Xt * Receiver.y - Key.c * Receiver.z));
  }

  function handleImage(e){

    var reader = new FileReader();
    reader.onload = function(event) {

      var image = new Image();
      image.onload = function() {buildImage(image)};
      image.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
  }

  function buildImage(image) {

        $('#animation').fadeIn(200);

        width = image.width;
        height = image.height;
        hwr = (1.0 * height) / width;

        if (width > 540) {
          width = 540;
          height = height * hwr;
        }

        if (height > 640) {
          height = 640;
          width = height / hwr;
        }

        ImageCanvas.width = width;
        ImageCanvas.height = height;

        ctxImage.drawImage(image, 0,0, width, height);

        imgData = ctxImage.getImageData(0,0, width, height);
        ctxImage.putImageData(imgData,0,0);
        
        //Sending
        //Preperation of data, so small in comparison to chaos
        var data = [], scale = 100000;
        for (var i = 0; i < width * height; i++) {
          data.push((imgData.data[4*i+0])/scale);
          data.push((imgData.data[4*i+1])/scale);
          data.push((imgData.data[4*i+2])/scale);
          data.push((imgData.data[4*i+3])/scale);
        }
        
        //Receiving data
        receivedCanvas.width = width;
        receivedCanvas.height = height;
        var receivedData = LorenzOrbit(initialPoint, 650000, t, data);
        
        //Processing received data
        var receivedImage = ctxReceived.createImageData(width, height);
        for (var i = 0; i < width * height; i++) {
          receivedImage.data[4*i+0]=Math.round(scale*receivedData[4*i+0])//1.0/receivedData[4*i+0];
          receivedImage.data[4*i+1]=Math.round(scale*receivedData[4*i+1])//1.0/receivedData[4*i+1];
          receivedImage.data[4*i+2]=Math.round(scale*receivedData[4*i+2])//1.0/receivedData[4*i+2];
          receivedImage.data[4*i+3]=Math.round(scale*receivedData[4*i+3]);
        }
        
        ctxReceived.putImageData(receivedImage, 0, 0);
  }
    
  function getDifference(A, B) {
    return Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2) + Math.pow(A.z - B.z, 2));
  }
    
  function reLoad() {
    var currentIteration;
      currentIteration = sliderRInfo.minX + $("#sliderRValue").slider("option", "value") * sliderRInfo.scale;
      imgData = ctxImage.getImageData(0,0, width, height);
      ctxImage.putImageData(imgData,0,0);

      //Sending
      //Preperation of data
      var data = [], scale = 100000;
      for (var i = 0; i < width * height; i++) {
        data.push((imgData.data[4*i+0])/scale);
        data.push((imgData.data[4*i+1])/scale);
        data.push((imgData.data[4*i+2])/scale);
        data.push((imgData.data[4*i+3])/scale);
      }

      //Receiving
      receivedCanvas.width = width;
      receivedCanvas.height = height;
      var receivedData = LorenzOrbit(initialPoint, currentIteration, t, data); //650000

      var receivedImage = ctxReceived.createImageData(width, height);
      for (var i = 0; i < width * height; i++) {
        receivedImage.data[4*i+0]=Math.round(scale*receivedData[4*i+0])
        receivedImage.data[4*i+1]=Math.round(scale*receivedData[4*i+1])
        receivedImage.data[4*i+2]=Math.round(scale*receivedData[4*i+2])
        receivedImage.data[4*i+3]=Math.round(scale*receivedData[4*i+3]);
      }

      ctxReceived.putImageData(receivedImage, 0, 0);
  }

  
  //Called everytime sliders move and on document load
  //Finds values from sliders, sends image with new values

  function Key(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
    
  function Point(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
    
  function sliderInfo(max, min, maxX, minX) {
    this.max = max;
    this.min = min;
    this.maxX = maxX;
    this.minX = minX;
    this.scale = (maxX - minX) / (max - min);
  }
}