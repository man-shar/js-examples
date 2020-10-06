/*
labels come in and go initial
side description labels
*/

import * as d3 from "d3";
import "whatwg-fetch";
var pako = require("pako");
import { getWidth, mobileCheck, getHeight, supportsWebGL } from "./app";

const isEmbedded = window.location !== window.parent.location;

var cluster_codes = require("../static/data/bigClusterCodes.json");
var nodesCategory = require("../static/data/bigNodesCategory.json");
var bigTotals = require("../static/data/big_totals.json");

bigTotals.forEach((d) => {
  d.dt = d.date.replace(/\//gi, "") + "20+0800";
});

var runningTotals = {
  dorm: 0,
  local: 0,
  imported: 0,
};

bigTotals = bigTotals.reduce((obj, d) => {
  runningTotals = {
    imported: runningTotals["imported"] + +d.imported,
    dorm: runningTotals["dorm"] + +d.dorm,
    local: runningTotals["local"] + (+d.comm + +d.work_permit_not_dorm),
  };
  obj[d.date.replace(/\//gi, "") + "20+0800"] = {
    dorm: runningTotals["dorm"],
    local: runningTotals["local"],
    imported: runningTotals["imported"],
  };

  return obj;
}, {});

// cluster codes to names
var cluster_names = Object.keys(cluster_codes).reduce((obj, d) => {
  obj[cluster_codes[d]] = d;
  return obj;
}, {});

var tp = d3.timeParse("%d%m%Y%Z");
var tfDot = d3.timeFormat("%b. %d");
var tfNoDot = d3.timeFormat("%b %d");
var tf = (d) => {
  if (d.getMonth() === 4) return tfNoDot(d);
  return tfDot(d);
};

// var firstDate = tp('21042020+0800');
var maxDate = tp("17052020+0800");
// var maxDate = tp('20042020+0800');
var renderedDaysCount = 0;
var scrolledToElement = false;
var animationRunning = false;

var p = {
  t: 100,
  l: 300,
};

var screenWidth = getWidth();
var screenHeight = getHeight();

const original_height = 4000,
  original_width = 6500;

var width = original_width * 1.1,
  height = original_height * 1.1;

var scale = (screenWidth - 100) / width;
var rad = 6;
var rotated = false;
var makeItBigger = 1.1;

var radPerPixelRatio = rad / 2;
var radPerPixelRatioPhone = 2.5;

var canvasWidth = width * scale,
  canvasHeight = height * scale;

if (mobileCheck()) {
  rad = 4;
  // // if big iphones, rad = 5
  if (window.devicePixelRatio === 3) {
    rad = 5;
  }
  // flip this on phones.
  rotated = true;
  let temp = width;
  width = height;
  height = temp;
  let new_scale = (screenWidth * makeItBigger) / width;
  p.l = (((canvasWidth - canvasHeight) / 2) * scale) / new_scale - p.t;
  scale = new_scale;
  canvasWidth = (width * screenWidth) / width;
  canvasHeight = (height * screenWidth) / width;
} else {
  rad = radPerPixelRatio * window.devicePixelRatio;
}

// since the positions are generated based on a 5000 x 4000 canvas, we need to translate if we're using some other widths
function translateX(x) {
  return x + p.l + (width - (!rotated ? original_width : original_height)) / 2;
}

function translateY(y) {
  return y + p.t + (height - (!rotated ? original_height : original_width)) / 2;
}

var cluster_positions = {
  imported: [translateX((2 * 5000) / 4 + 300), translateY(4000 / 2.5)],
  local: [translateX((2 * 5000) / 4 + 300), translateY(4000 / 2)],
  dorm: [translateX(5000 / 3), translateY(4000 / 2.2)],
};

var cluster_positions_from_cluster_code = {};

Object.keys(cluster_codes).forEach((d) => {
  if (!rotated)
    cluster_positions_from_cluster_code[cluster_codes[d]] =
      cluster_positions[d];
  else
    cluster_positions_from_cluster_code[cluster_codes[d]] = [
      cluster_positions[d][1],
      cluster_positions[d][0],
    ];
});

// var canvas = d3
//   .select('#chart-2')
//   .attr('width', `${canvasWidth}px`)
//   .attr('height', `${canvasHeight}px`)
//   .node();
var pixCorrect = window.devicePixelRatio || 1;
var regl;
if (!isEmbedded || !supportsWebGL) {
  d3.select("#chart-2")
    .style("width", `${canvasWidth}px`)
    .style("height", `${canvasHeight}px`);

  regl = require("regl")({
    container: "#chart-2",
    attributes: {
      antialias: false,
      pixelRatio: pixCorrect,
    },
  });
}

var centreX = width / 2;
var centreY = height / 2;

var tickDuration = 200;

var worker = new Worker("data-worker.js");
var renderData = {};
var renderQueue = [];
var processedDays = [];

var data;
var days;
var processingDayIndex = 0;
var previousPositions = [];
var animId;
var renderPaused = true;

var node_colors_regl = {
  1: [57 / 255, 165 / 255, 216 / 255],
  2: [187 / 255, 187 / 255, 187 / 255],
  3: [239 / 255, 59 / 255, 44 / 255],
};

worker.onmessage = (event) => {
  let ticks = JSON.parse(event.data);
  // generate ticks here because passing messages is slow
  var ticksThisDay = processingDayIndex <= 2 ? 60 : 30;

  var steps = d3.range(
    0,
    1 + 2 * (1 % (0.9 / ticksThisDay)),
    +(0.9 / ticksThisDay).toFixed(3)
  );

  // debugger
  // add a 1 at the end
  if (steps.slice(-1)[0] !== 1) {
    steps.push(1);
  }

  var timePerTick = 20;

  renderData[ticks.day] = ticks.tweenPositions;
  renderData[ticks.day].ticksCount = ticksThisDay;
  renderData[ticks.day].timePerTick = timePerTick;
  renderQueue.push(ticks.day);
  processedDays.push(ticks.day);

  if (processingDayIndex < days.length - 1) {
    updateLatestNodePositions();
    processingDayIndex++;
    processNextData();
  }

  // since we've already incremented processingDayIndex earlier, we compare it to 1 here not 0 even thoough we're checking for the first day.
  if (renderPaused) {
    renderPaused = false;
    if (
      (window.activeAnimation === 2 || processingDayIndex === 1) &&
      !animationRunning
    ) {
      animId = requestAnimationFrame((t) => startAnimation());
    }
  }
};

function offsetX(x, _id, widthOffset) {
  return (
    // rect.left +
    widthOffset * 20 +
    x -
    // text alignment shift
    // if shift to right then no shift for text-alignment, if shit to legt then have to shift by whole width of the text box
    (widthOffset <= 0
      ? document.getElementById(_id).offsetWidth / (widthOffset < 0 ? 1 : 2)
      : 0)
  );
}

// widthOffset
// 0 -> no shift
// 1 -> shift to right for text-left
// -1 -> shift to left for text-right
// [0, 1, 2]
function positionClusterLabels(
  day,
  clusterList,
  widthOffset = 0,
  firstIter = 0,
  onlyNumber = false
) {
  renderData[day]
    .filter((d) => clusterList.indexOf(d[0]) >= 0)
    .forEach((d) => {
      var _id = cluster_names[d[0].slice(1)].split(" ")[0].toLowerCase();
      // var _id = cluster_names[d];
      // var pos = cluster_positions_from_cluster_code[d]

      if (!bigTotals[day]) return;

      if (onlyNumber) {
        var currentCount = +document
          .querySelector("#" + _id + "> .number-of-cases")
          .innerText.replace(/,/, "");

        let interp = d3.interpolateNumber(currentCount, bigTotals[day][_id]);

        d3.select("#" + _id)
          .select(".number-of-cases")
          .transition()
          .duration(300)
          .textTween(() => (t) => d3.format(",")(+interp(t).toFixed(0)));
        return;
      }

      if (!firstIter) {
        d3.select("#" + _id)
          .transition()
          .duration(400)
          .style("left", offsetX(d[1][1] * scale, _id, widthOffset) + "px")
          .style("top", d[2][1] * scale - (widthOffset !== 0 ? 20 : 25) + "px");

        var currentCount = +document
          .querySelector("#" + _id + "> .number-of-cases")
          .innerText.replace(/,/, "");

        let interp = d3.interpolateNumber(currentCount, bigTotals[day][_id]);

        d3.select("#" + _id)
          .select(".number-of-cases")
          .transition()
          .duration(300)
          .textTween(() => (t) => d3.format(",")(+interp(t).toFixed(0)));
      } else {
        d3.select("#" + _id)
          .style("left", offsetX(d[1][1] * scale, _id, widthOffset) + "px")
          .style("top", d[2][1] * scale - (widthOffset !== 0 ? 20 : 25) + "px");

        document.querySelector("#" + _id + "> .number-of-cases").innerText =
          bigTotals[day][_id];
      }
    });
}

function showTextLabels(selector) {
  d3.selectAll("#chart-2-container " + selector).classed("animate", true);
}

function processNextData() {
  worker.postMessage(
    JSON.stringify({
      day: days[processingDayIndex],
      dayData: data[days[processingDayIndex]],
      previousPositions,
      cluster_positions_from_cluster_code,
      rotated,
    })
  );
}

function updateClusterNodePositions() {
  cluster_positions_from_cluster_code = renderData[days[processingDayIndex]]
    .filter((d) => d[0][0] === "C")
    .reduce((obj, d) => {
      obj[d[0].slice(1)] = [d[1].slice(-1)[0], d[2].slice(-1)[0]];
      return obj;
    }, {});
}

function updateLatestNodePositions() {
  // if(processingDayIndex <= 3) {
  updateClusterNodePositions();
  // }
  previousPositions = [];
  var _cluster_nodes = [];

  for (let i = 0; i < renderData[days[processingDayIndex]].length; i++) {
    let n = renderData[days[processingDayIndex]][i];
    // cluster nodes at the end
    if (n[0][0] == "C") {
      _cluster_nodes[_cluster_nodes.length] = [
        n[0],
        n[1].slice(-1)[0],
        n[2].slice(-1)[0],
      ];
    }
    previousPositions[n[0] - 1] = [n[0], n[1].slice(-1)[0], n[2].slice(-1)[0]];
  }
  previousPositions = previousPositions.concat(_cluster_nodes);

  // debugger;
}

function makeShader(currentPoints) {
  const drawPoints = regl({
    frag: `
      #extension GL_OES_standard_derivatives : enable
      // set the precision of floating point numbers
      precision highp float;

      // this value is populated by the vertex shader
      varying vec3 fragColor;

      void main() {
        float r = 0.0;
        float delta = 0.0;
        float alpha = 1.0;
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;

        r = dot(cxy, cxy);
        #ifdef GL_OES_standard_derivatives
        delta = fwidth(r);
        alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
        #endif

      if (r > 1.0) {
        discard;
      }

      gl_FragColor = vec4(fragColor, 1) * alpha;
      }
    `,
    vert: `
      // per vertex attributes
      attribute vec2 startPosition;
      attribute vec2 endPosition;
      attribute vec3 color;
      
      // variables to send to the fragment shader
      varying vec3 fragColor;
      
      // values that are the same for all vertices
      uniform float pointWidth;
      uniform float stageWidth;
      uniform float stageHeight;
      uniform float scale;
      uniform float elapsed;
      uniform float duration;
      
      // helper function to transform from pixel space to normalized
      // device coordinates (NDC). In NDC (0,0) is the middle,
      // (-1, 1) is the top left and (1, -1) is the bottom right.
      vec2 normalizeCoords(vec2 position) {
        // read in the positions into x and y vars
        float x = position[0] * scale;
        float y = position[1] * scale;
      
        return vec2(
          2.0 * ((x / stageWidth) - 0.5),
          // invert y to treat [0,0] as bottom left in pixel space
          -(2.0 * ((y / stageHeight) - 0.5)));
      }

      // theft from https://observablehq.com/@emamd/animating-lots-and-lots-of-circles-with-regl-js
      // Helper function to handle cubic easing
      // There are also premade easing functions available via glslify
      float easeCubicInOut(float t) {
        t *= 2.0;
        t = (t <= 1.0 ? t * t * t : (t -= 2.0) * t * t + 2.0) / 2.0;

        if (t > 1.0) {
          t = 1.0;
        }

        return t;
      }
        
      void main() {
        float t;

        // t = easeCubicInOut(elapsed / duration);
        t = elapsed / duration;

        if (t > 1.0) {
          t = 1.0;
        }
      
        // update the size of a point based on the prop pointWidth
        gl_PointSize = pointWidth;
      
        // send color to the fragment shader
        fragColor = color;
      
        // scale to normalized device coordinates
        // gl_Position is a special variable that holds the position
        // of a vertex
        vec2 position = mix(startPosition, endPosition, t);
        gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
      }
    `,

    attributes: {
      // each of these gets mapped to a single entry for each of
      // the points. this means the vertex shader will receive
      // just the relevant value for a given point.
      color: currentPoints.map((d) => node_colors_regl[nodesCategory[d[0]]]),
      startPosition: currentPoints.map((d) => [
        translateX(d[1][0]),
        translateY(d[2][0]),
      ]),
      endPosition: currentPoints.map((d) => [
        translateX(d[1][1]),
        translateY(d[2][1]),
      ]),
    },

    uniforms: {
      pointWidth: regl.prop("pointWidth"),
      stageWidth: regl.prop("stageWidth"),
      stageHeight: regl.prop("stageHeight"),
      scale: scale,
      duration: regl.prop("duration"),
      elapsed: ({ time }, { startTime = 0 }) => {
        return (time - startTime) * 1000;
      },
    },

    // specify the number of points to draw
    count: currentPoints.length,
    // specify that each vertex is a point (not part of a mesh)
    primitive: "points",
  });

  return drawPoints;
}

function renderDay(day) {
  let startTime = null;

  var currentPoints = renderData[day].filter((d) => d[0][0] !== "C");

  const animation = makeShader(currentPoints);

  const animationDuration =
    renderData[day].timePerTick * renderData[day].ticksCount;

  const frameLoop = regl.frame(({ time }) => {
    if (startTime === null) {
      startTime = time;
    }

    regl.clear({
      color: [1, 1, 1, 1],
      depth: 1,
    });

    animation({
      pointWidth: rad,
      stageWidth: canvasWidth,
      stageHeight: canvasHeight,
      duration: animationDuration,
      startTime: startTime,
    });

    if (time - startTime > animationDuration / 1000) {
      frameLoop.cancel();
      startTime = null;
      renderedDaysCount++;
      if (renderedDaysCount === 1) {
        let readyEvent = new CustomEvent("animation-ready", {
          detail: {
            id: 2,
          },
        });
        window.dispatchEvent(readyEvent);
      }
      if (window.activeAnimation === 2) {
        startAnimation();
      } else {
        renderPaused = true;
        animationRunning = false;
      }
    }
  });
}

function updateDateTicker(day) {
  let dt = tp(day);
  if (+dt <= +maxDate)
    document.getElementById("date-ticker-2").innerText = tf(dt);
}

export function isReadyOrDone() {
  return renderQueue.length !== 0 || renderedDaysCount === days.length - 1;
}

export function isRunning() {
  return animationRunning;
}

// starts animation for a particular day
export function startAnimation() {
  animationRunning = true;
  // figure out what to do if render queue is empty
  if (renderQueue.length === 0) {
    renderPaused = true;
    return;
  }
  // get latest processed day
  var day = renderQueue.shift();
  var dt = +tp(day);

  if (renderedDaysCount === 0) {
    showTextLabels(".cases-on");
    showTextLabels("#date-ticker-2");
  }

  if (renderedDaysCount % 3 === 0 || renderedDaysCount === days.length - 1) {
    // at the end show the biggest clusters
    positionClusterLabels(
      day,
      [
        "C" + cluster_codes["imported"],
        "C" + cluster_codes["dorm"],
        "C" + cluster_codes["local"],
      ],
      0,
      renderedDaysCount === 1
    );
    showTextLabels(".reveal-end");
  } else {
    positionClusterLabels(
      day,
      [
        "C" + cluster_codes["imported"],
        "C" + cluster_codes["dorm"],
        "C" + cluster_codes["local"],
      ],
      0,
      renderedDaysCount === 1,
      true
    );
  }

  updateDateTicker(day);

  renderDay(day);
}

if (!isEmbedded || !supportsWebGL) {
  window.fetch("data/allBigSimData.json").then((d) => {
    d.blo().then((d2) => {
      var arrayBuffer;
      var fileReader = new FileReader();
      fileReader.onload = function () {
        arrayBuffer = this.result;
        try {
          let result = pako.ungzip(new Uint8Array(arrayBuffer), {
            to: "string",
          });
          data = JSON.parse(result);
          days = Object.keys(data);

          worker.postMessage(
            JSON.stringify({
              day: days[processingDayIndex],
              dayData: data[days[processingDayIndex]],
              previousPositions,
              cluster_positions_from_cluster_code: null,
              rotated,
            })
          );
        } catch (err) {
          console.log("Error " + err);
        }
      };

      fileReader.readAsArrayBuffer(d2);
    });
  });
}
