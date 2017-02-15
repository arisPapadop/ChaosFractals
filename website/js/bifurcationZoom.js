
function initialiseBifurcationZoom() {

  elementBifurcationZoom = document.getElementById('BifurcationZoomCanvas');
  elementMapZoom = document.getElementById('MapZoomCanvas');

  bifurcation(elementMapZoom, elementBifurcationZoom, zoom=true);
  
}