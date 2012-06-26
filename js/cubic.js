"use strict";
var pfx = '';
var rotY = 0;
var rotX = 0;
var camZ = 200;

var active = 0;
var lastX;
var lastY;
var lastZ;
var mediaController;

function init()
{
  build_cube();

  var e = $(document);
  e.mousewheel(moveWheel);
  e.mousedown(startDrag);
  e.mousemove(moveDrag);
  e.mouseup(endDrag);
  e.mouseout(endDrag);

  if((pfx = checksupport())) {
    if(mediaController) {
      playVideo();
    } else {
      $("#loading").remove();
    }
    doRotate(0, 0, 0, 0, 0);
  } else {
    $("#loading").text("CSS/3D is not supported.");
  }
}

function playVideo()
{
  var v = $("#cube").children(), i;
  for(i=0; i<v.length; i++) {
    var t = v[i];
    if(t.readyState!=t.HAVE_ENOUGH_DATA) {
      setTimeout(playVideo, 1000);
      return;
    }
  }
  for(i=0; i<v.length; i++) {
    v[i].muted = (i==0)? false: true;
    v[i].play();
  }
  $("#loading").remove();
}

function build_cube()
{
  $("#container").append('<div id="cube" class="cube"></div>');
  var src = $("#texture");
  var tag = src[0].tagName.toLowerCase();
  if((tag=="img") || (tag=="video")) {
    // packed
    for(var i=0; i<6; i++) {
      $("#cube").append('<canvas id="side' + i + '" class="side" width="511px" height="511px"></canvas>');
    }
    transferImage(tag=="video");
  } else {
    // separated
    var v = src.children()[0];
    if(v.tagName.toLowerCase()=="video") {
      try {
        mediaController = new MediaController();
      } catch(e) {
        console.log("MediaController() is not supported.");
      }
    }
    for(var i=0; i<6; i++) {
      var t = src.children()[0];
      t.id = "side" + i;
      t.className = "side";
      t.style.width = "511px";
      t.style.height = "511px";
      if(mediaController) {
        t.controller = mediaController;
        t.loop = true;
      }
      $("#cube").append(t);
    }
  }
}

function transferImage(loop)
{
  var x = [0, 1, 2, 0, 1, 2];
  var y = [0, 0, 0, 1, 1, 1];
  var src = $("#texture");
  var w = src.width()/3.0;
  var h = src.height()/2.0;
  for(var i=0; i<6; i++) {
    var dst = $("#side" + i);
    var ctx = dst[0].getContext("2d");
    ctx.drawImage(src[0], x[i]*w, y[i]*h, w, h, 0, 0, dst.width(), dst.height());
  }
  if(loop) {
    setTimeout("transferImage(true)", 50);
  }
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
