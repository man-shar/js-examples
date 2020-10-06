import * as d3 from "d3";
import { throttle } from "./util";

var ctr = document.querySelector(".main");
var h = ctr.offsetHeight - window.innerHeight;
var currentDeathCount = 0;
// var totalDeaths = (24 * 3600) / 18;
var totalDeaths = 5437;

var fmt = d3.format(",");

function tickHour(pct) {
  var curr = +document.querySelector(
    "#hour-label-phone .hour-label .hour-count"
  ).innerText;
  const h = Math.floor(pct * 24) < 24 ? Math.floor(pct * 24) : 24;
  if (h === curr) return;

  if (h >= 1) {
    d3.select("#hour-label-phone .hour-count-container").classed(
      "d-none",
      false
    );
    if (h > 1) {
      d3.select("#hour-label-phone .hour-word").text("hours");
    } else {
      d3.select("#hour-label-phone .hour-word").text("hour");
    }
  } else {
    d3.select("#hour-label-phone .hour-count-container").classed(
      "d-none",
      true
    );
  }
  document.querySelector(
    "#hour-label-phone .hour-label .hour-count"
  ).innerText = h;
}

function tickDeathCount(x) {
  document.querySelector(
    "#hour-label-phone .hour-label .death-count"
  ).innerText = fmt(x);
}

var windowWidth = document.documentElement.clientWidth;

var coordFile =
  windowWidth <= 500 ? "data/coords-phone.csv" : "data/coords.csv";

var icon =
  windowWidth <= 500 ? "img/person-icon-thick" : "img/person-icon-thick";

var peopleIcon = new Image();
peopleIcon.src = `${icon}.png`;
var img = new Promise((resolve) => {
  peopleIcon.onload = function () {
    resolve(peopleIcon);
  };
});

var peopleIconBlack = new Image();
peopleIconBlack.src = `${icon}-black.png`;
var imgBlack = new Promise((resolve) => {
  peopleIconBlack.onload = function () {
    resolve(peopleIconBlack);
  };
});

img.then((img) => {
  var containerHeight = window.innerHeight;

  document.getElementById("graphic-container").style.height =
    containerHeight + "px";

  // canvas width and height
  var originalWidth = document.getElementById("people-icons").offsetWidth - 20;
  // var fullHeight = img.height * 60;
  var originalHeight =
    containerHeight -
    70 -
    // 100 for the margin on the hour label to prevent it from hitting the absolute bottom of the container
    // 100 -
    document.querySelector(".clock").offsetHeight -
    document.querySelector(".hour-label").offsetHeight;

  imgBlack.then((imgBlack) => {
    var canvas = d3
      .select("#people-icons")
      .append("canvas")
      .style("width", originalWidth + "px")
      .style("height", originalHeight + "px")
      .attr("width", originalWidth)
      .attr("height", originalHeight)
      .node();

    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    // d3.select('.clock').classed('hide', false);
    d3.select(".clock").classed("show", true);

    // ctx.scale(1, fullHeight / originalHeight);

    var m = (originalWidth * 0.05) / 2;

    function round(num) {
      var x = Math.round(num * 2) / 2;
      x = x % 1 === 0 ? x + 0.5 : x;
      return x;
    }

    var perRow = windowWidth <= 500 ? 22 : 90;
    var imgScale = originalWidth / perRow / img.width;
    var scaledImgW = round(img.width * imgScale);
    var scaledImgH = round(img.height * imgScale);

    var currentY = 0;

    // var originalW = 20;
    // var originalH = 53.61;

    // function drawPerson(ctx, x, y, w, h) {
    //   ctx.arc()
    // }

    d3.csv(coordFile).then((d) => {
      var extent = d3.extent(d, (d2) => +d2.x);
      extent[1] = extent[1] + scaledImgW;
      var x = d3
        .scaleLinear()
        .domain(extent)
        .range([m, originalWidth - m]);

      var data = [];

      for (let i = 0; i < d.length; i = i + 2) {
        data.push({
          x: round(x(+((+d[i].x + +d[i + 1].x) / 2).toFixed(0))),
          y: round(+((+d[i].y + +d[i + 1].y) / 2).toFixed(0)),
        });
      }
      data.sort((a, b) => {
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
      });

      for (let i = 0; i < data.length; i++) {
        if (data[i].y - currentY > 10) {
          currentY = data[i].y;
        }
        data[i].y = currentY;
      }

      data.sort((a, b) => {
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
      });

      var templateW = 20;
      var templateH = 55;

      // head
      var headX = 10;
      var headY = 6.7;
      var headStroke = 1;
      var headR = 6.7 - headStroke;

      // body
      var bodyW = 11;
      var bodyH = 38.5;
      var bodyX = (templateW - bodyW) / 2;
      var bodyY = 12.7;
      var bodyLineWidth = 2;

      // feet
      var leftFootX = bodyX + bodyW / 4;
      var leftFootY = bodyY + bodyH;
      var footStroke = 2;
      var leftFootR = bodyW / 4 - footStroke;

      var rightFootX = bodyX + (3 * bodyW) / 4;
      var rightFootY = bodyY + bodyH;
      var rightFootR = leftFootR;

      // foot dividing line
      var footDividerStartX = 10;
      var footDividerStartY = 32;
      var footDividerEndX = bodyX + bodyW / 2;
      var footDividerEndY = bodyY + bodyH;
      var thickLine = windowWidth <= 500 ? 3 : 3;

      // draws a little person icon...
      // yeah.. i wrote this.. manually.
      // rendering an svg icon in canvas was reaaaal slow and blurry.
      function drawShape(x, y, w, h, black = false) {
        // console.log('Drawing');
        function scaleY(y) {
          return (y * h) / templateH;
        }

        function scaleX(x) {
          return (x * w) / templateW;
        }

        ctx.fillStyle = black ? "#212121" : "#ffffff";
        ctx.strokeStyle = "#212121";

        // body and arms
        ctx.strokeStyle = "#212121";
        ctx.lineWidth = thickLine;
        ctx.beginPath();
        ctx.moveTo(x + scaleX(bodyX + bodyLineWidth), y + scaleY(bodyY));
        // + 2 is for the linewidth of the body
        ctx.lineTo(x + scaleX(bodyW + bodyLineWidth), y + scaleY(bodyY));
        ctx.quadraticCurveTo(
          x + scaleX(19),
          y + scaleY(bodyY),
          x + scaleX(19),
          y + scaleY(17)
        );
        ctx.lineTo(x + scaleX(19), y + scaleY(17 + 13.5));
        ctx.quadraticCurveTo(
          x + scaleX(19),
          y + scaleY(30),
          x + scaleX(bodyW + bodyLineWidth),
          y + scaleY(34)
        );
        ctx.lineTo(x + scaleX(bodyX + bodyLineWidth), y + scaleY(34));
        ctx.quadraticCurveTo(
          x + scaleX(1),
          y + scaleY(34),
          x + scaleX(1),
          y + scaleY(30)
        );
        ctx.lineTo(x + scaleX(1), y + scaleY(17));
        ctx.quadraticCurveTo(
          x + scaleX(1),
          y + scaleY(bodyY),
          x + scaleX(bodyX + bodyLineWidth),
          y + scaleY(bodyY)
        );
        ctx.stroke();
        ctx.fill();

        // draw head
        ctx.lineWidth = bodyLineWidth;
        ctx.beginPath();
        ctx.arc(
          x + scaleX(headX),
          y + scaleY(headY),
          scaleY(headR),
          0,
          2 * Math.PI
        );
        ctx.fill();
        ctx.stroke();

        // // long rectangle for body
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.rect(
          x + scaleX(bodyX),
          y + scaleY(bodyY),
          scaleX(bodyW),
          scaleY(bodyH)
        );
        ctx.fill();
        if (black) ctx.stroke();

        // left foot
        ctx.lineWidth = footStroke;
        ctx.beginPath();
        ctx.arc(
          x + scaleX(leftFootX),
          y + scaleY(leftFootY),
          scaleY(leftFootR) + 1,
          // scaleY(leftFootR),
          0,
          2 * Math.PI
        );
        ctx.fill();
        // ctx.stroke();

        // right foot
        ctx.beginPath();
        ctx.arc(
          x + scaleX(rightFootX),
          y + scaleY(rightFootY),
          scaleY(rightFootR) + 1,
          // scaleY(leftFootR),
          0,
          2 * Math.PI
        );
        ctx.fill();
        // ctx.stroke();

        // foot dividing line
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(
          x + scaleX(footDividerStartX),
          y + scaleY(footDividerStartY)
        );
        ctx.lineTo(x + scaleX(footDividerEndX), y + scaleY(footDividerEndY));
        ctx.stroke();

        // left arm line
        ctx.lineWidth = 1;
        ctx.moveTo(x + scaleX(bodyX - 0.7), y + scaleY(34));
        ctx.lineTo(x + scaleX(bodyX - 0.7), y + scaleY(bodyY + 5));
        ctx.stroke();

        // right arm line
        ctx.lineWidth = 1;
        ctx.moveTo(x + scaleX(bodyX + bodyW + 0.7), y + scaleY(34));
        ctx.lineTo(x + scaleX(bodyX + bodyW + 0.7), y + scaleY(bodyY + 5));
        ctx.stroke();
      }

      // console.log(data, img);
      var hourLabelVisible = false;

      // rows in one full screen
      var peopelInOneScreen = Math.ceil(
        (window.innerHeight / scaledImgH) * perRow * 2.5
      );

      function handleScroll(ev) {
        var pct = (window.scrollY - ctr.offsetTop) / h;
        // if (pct > 1.1) return;

        pct = pct < 0 ? 0 : pct;

        console.log(pct);

        var newDeathCount = Math.floor(pct * totalDeaths);
        newDeathCount =
          newDeathCount > totalDeaths ? totalDeaths : newDeathCount;
        if (newDeathCount !== currentDeathCount) tickDeathCount(newDeathCount);

        if (newDeathCount === currentDeathCount) return;

        tickHour(pct);

        document.querySelector(".hour").style.transform =
          "rotate(" + pct * 2 * 2 * Math.PI + "rad)";

        document.querySelector(".minute").style.transform =
          "rotate(" + pct * 24 * 2 * Math.PI + "rad)";

        // console.log('ran', newDeathCount);

        // if required height doesn't match current height of the canvas and is greater than the original height of canvas, then change

        var newHeight =
          data[newDeathCount - 1 < 0 ? 0 : newDeathCount - 1].y +
          scaledImgH +
          1;

        if (newHeight > originalHeight) {
          // if (Math.abs(newBottom - currentBottom) > 5) {
          //   document.querySelector('#graphic-container > div').style.bottom =
          //     newBottom + 'px';
          //   currentBottom = newBottom;
          // }

          // new people
          if (newHeight !== canvas.height) {
            canvas.height = newHeight;
            canvas.style.height = newHeight + "px";
            // d3.select('#redrawing').text(Math.random());
            for (
              let i =
                currentDeathCount - peopelInOneScreen < 0
                  ? 0
                  : currentDeathCount - peopelInOneScreen;
              i < currentDeathCount;
              i++
            ) {
              drawShape(data[i].x, data[i].y, scaledImgW, scaledImgH);
              // ctx.drawImage(img, data[i].x, data[i].y, scaledImgW, scaledImgH);
            }
          }
          // ctx.scale(1, fullHeight / newHeight);
        } else {
          //  if it's less we should just reset bottom to 0px
          if (canvas.height !== originalHeight) {
            // document.querySelector('#graphic-container > div').style.bottom =
            //   '0px';
            // currentBottom = 0;
            canvas.height = originalHeight;
            canvas.style.height = originalHeight + "px";
            for (let i = 0; i < currentDeathCount; i++) {
              drawShape(data[i].x, data[i].y, scaledImgW, scaledImgH);
              // ctx.drawImage(img, data[i].x, data[i].y, scaledImgW, scaledImgH);
            }
          }
        }

        if (newDeathCount > currentDeathCount) {
          // d3.select('#redrawing').text(Math.random());
          if (!hourLabelVisible && newDeathCount >= 1) {
            d3.select("#hour-label-phone .hour-label").classed("show", true);
            d3.select("#hour-label-phone .hour-label").classed("hide", false);
            hourLabelVisible = true;
          }

          // for (var i = 0; i < newDeathCount - currentDeathCount; i++) {
          for (var i = currentDeathCount; i < newDeathCount; i++) {
            // ctx.drawImage(img, data[i].x, data[i].y, scaledImgW, scaledImgH);
            drawShape(data[i].x, data[i].y, scaledImgW, scaledImgH);
          }
        } else if (newDeathCount < currentDeathCount) {
          // d3.select('#redrawing').text(Math.random());
          if (hourLabelVisible && newDeathCount <= 1) {
            d3.select("#hour-label-phone .hour-label").classed("show", false);
            d3.select("#hour-label-phone .hour-label").classed("hide", true);
            hourLabelVisible = false;
          }
          // need to redraw from previous row onwards
          // so start from -162
          const lo = newDeathCount - 162 < 0 ? 0 : newDeathCount - 162;
          // fill with black icon
          for (let i = newDeathCount; i < currentDeathCount; i++) {
            drawShape(data[i].x, data[i].y, scaledImgW, scaledImgH, true);
            // ctx.drawImage(
            //   imgBlack,
            //   data[i].x,
            //   data[i].y,
            //   scaledImgW,
            //   scaledImgH
            // );
          }

          // draw new people
          for (let i = lo; i < newDeathCount; i++) {
            // ctx.drawImage(img, data[i].x, data[i].y, scaledImgW, scaledImgH);
            drawShape(data[i].x, data[i].y, scaledImgW, scaledImgH);
          }
        }

        currentDeathCount = newDeathCount;
        // document.querySelector('.second').style.transform =
        //   'rotate(' + pct * 48 * 60 * Math.PI + 'rad)';
      }

      window.addEventListener("scroll", throttle(handleScroll, 20));
    });
  });
});
