"use strict";
var pfx = '';
var rotY = 0;
var rotX = 0;
var camZ = 200;

var active = 0;
var lastX;
var lastY;
var lastZ;

function init()
{
  build_cube();

  var e = $(document);
  e.mousewheel(moveWheel);
  e.mousedown(startDrag);
  e.mousemove(moveDrag);
  e.mouseup(endDrag);
  e.mouseout(endDrag);

  var l = $("#loading");
  if((pfx = checksupport())) {
    l.remove();
    doRotate(0, 0, 0, 0, 0);
  } else {
    l.text("CSS/3D is not supported.");
  }
}

function build_cube()
{
  $("#container").append('<div id="cube" class="cube"></div>');
  var src = $("#texture");
  if(src[0].tagName.toLowerCase()=="img") {
    // packed
    copyImage("side1", 0, 0);
    copyImage("side2", 1, 0);
    copyImage("side3", 2, 0);
    copyImage("side4", 0, 1);
    copyImage("side5", 1, 1);
    copyImage("side6", 2, 1);
  } else {
    // separated
    for(var i=1; i<=6; i++) {
      var t = src.children()[0];
      t.id = "side" + i;
      t.className = "side";
      t.style.width = "511px";
      t.style.height = "511px";
      $("#cube").append(t);
    }
  }
}

function copyImage(dst, x, y)
{
  $("#cube").append('<canvas id="' + dst + '" class="side" width="511px" height="511px"></canvas>');
  dst = $("#"+dst);
  var ctx = dst[0].getContext("2d");
  var src = $("#texture");
  var w = src.width()/3.0;
  var h = src.height()/2.0;
  ctx.drawImage(src[0], x*w, y*h, w, h, 0, 0, dst.width(), dst.height());
}

function startDrag(e)
{
  e.preventDefault();
  active = "mouse";
  lastX = e.clientX;
  lastY = e.clientY;
}

function moveDrag(e)
{
  e.preventDefault();
  if(active) {
    doRotate(lastX, lastY, e.clientX, e.clientY, 0);
    lastX = e.clientX;
    lastY = e.clientY;
  }
}

function endDrag(e)
{
  e.preventDefault();
  active = 0;
}

function moveWheel(e, d)
{
  e.preventDefault();
  doRotate(0, 0, 0, 0, d);
}

function doRotate(lastX, lastY, curX, curY, wheelDelta)
{
  rotY -= (curX - lastX) * 0.25;
  rotX += (curY - lastY) * 0.25;
  rotX = Math.max(-88, Math.min(88, rotX));
  camZ += wheelDelta;

  var r = "translateZ(" + Math.floor(camZ) + "px) rotateX(" + Math.floor(rotX) + "deg) rotateY(" + Math.floor(rotY) + "deg)";
  var s = "#container{-" + pfx + "-perspective:" + Math.floor(camZ) +"px;}"
        + "     #cube{-" + pfx + "-transform:" + r + ";}";
  $("#camera").text(s);
}

function checksupport()
{
  var props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
  var f = $("#cube")[0];
  for(var i=0; i<props.length; i++) {
    if(props[i] in f.style) {
      var p = props[i].replace('Perspective','');
      return p.toLowerCase();
    }
  }
  return false;
} 
