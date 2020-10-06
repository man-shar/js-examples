var d3 = require("d3");
var moment = require("moment-timezone");

var topojson = require("topojson-client");
var tp = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
var rad = 3;

var phone = window.innerWidth <= 767;

d3.json("data/timeLatLongData.json").then((latLongData) => {
  d3.json("data/boundary-simon.json").then((boundaryData) => {
    if (!phone) {
      makeChart(latLongData, boundaryData);
    } else {
      showVideo();
    }
  });
});

function makeChart(data, world) {
  var land = topojson.feature(world, world.objects.land);

  var width = 1000;
  var height = 600;

  if (phone) {
    width = 600;
    height = window.innerHeight >= 800 ? 800 : window.innerHeight + 60;
  }
  var projection = d3.geoMercator();
  var startEndStamps = [];
  var allEndStamps = [];

  var m = {
    l: 15,
    t: 15,
    r: 15,
    b: 15,
  };

  var svg = d3
    .select("#top-map")
    .style("height", "auto")
    .append("svg")
    .attr("width", window.innerWidth + (50 * window.innerWidth) / 1000)
    .attr("viewBox", `0 0 ${width} ${height}`);

  if (phone) {
    d3.select("#top-map").style("height", height + "px");
    svg.attr("height", height);
  }

  var svgNode = svg.node();

  var g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${m.l - (phone ? -5 : (50 * window.innerWidth) / 1000)}, ${
        m.t
      })`
    );

  var defaults = {
    x: 17,
    y: -110,
    scaleX: 1.022,
    scaleY: 1.0,
    rotate: 1.5,
  };

  // scale defaults which were in 1000x600 to actual dims of the svg
  defaults.x = (defaults.x * width) / 1000;
  defaults.y = (defaults.y * height) / 600;
  defaults.scaleX = (defaults.scaleX * width) / 1000;
  defaults.scaleY = (defaults.scaleY * height) / 600;

  if (phone) {
    defaults = {
      x: -110,
      y: -75,
      scaleX: 1.44,
      scaleY: 1.44,
      rotate: 0,
    };
  }

  if (!phone) {
    g.append("svg:image")
      .attr("width", width)
      .attr("height", height)
      .attr("x", defaults.x)
      .attr("y", defaults.y)
      .attr(
        "transform",
        `scale(${defaults.scaleX}, ${defaults.scaleY}) rotate(${defaults.rotate})`
      )
      .attr("xlink:href", "img/background-test-1.jpg");
  }

  width = width - m.l - m.r;
  height = height - m.t - m.b;

  var box = [-122.834766, 36.408823, -122.105664, 39.5992];
  if (phone) {
    box = [-123.9, 36.8, -121.0, 39.347103];
  }

  var extentPoints = {
    type: "Feature",
    geometry: {
      type: "MultiPoint",
      coordinates: [
        [box[0], box[1]],
        [box[2], box[3]],
        [box[0], box[3]],
        [box[2], box[1]],
      ],
    },
  };

  projection.rotate([0, phone ? 0 : 80, 0]);

  if (!phone) {
    projection.fitSize([width, height], extentPoints);
  } else {
    projection.fitWidth(width, extentPoints);
  }

  var path = d3.geoPath(projection);

  if (phone) {
    var upperLeft = projection([-123.7919765, 39.7246666]);
    var lowerLeft = projection([-123.7919765, 35.882741]);
    var upperRight = projection([-121.0369698, 39.7246666]);
    defaults.width = Math.abs(upperRight[0] - upperLeft[0]);
    defaults.height = Math.abs(lowerLeft[1] - upperLeft[1]);
    defaults.x = upperLeft[0];
    defaults.y = upperLeft[1];
    rad = 5;
    g.append("svg:image")
      .attr("width", defaults.width)
      .attr("height", defaults.height)
      .attr("x", defaults.x)
      .attr("y", defaults.y)
      .attr("transform", `rotate(${defaults.rotate})`)
      .attr("xlink:href", "img/background-VERT.jpg");
  }

  g.append("svg:image")
    .attr("width", 20)
    // .attr('height', defaults.height)
    .attr("x", projection([-121.0369698, 35.882741])[0])
    .attr("y", 80)
    .attr("transform", `rotate(${defaults.rotate})`)
    .attr("xlink:href", "img/North_arrow.png");

  var boundary = g
    .append("path")
    .datum(land)
    .attr("d", path)
    .attr("id", "world-boundary")
    .attr("class", "reference")
    .node();

  // amount the headline can move up
  // bottom edge of the world boundary

  if (!phone) {
    var svgWhiteSpace =
      svgNode.getBoundingClientRect().height -
      (window.scrollY + boundary.getBoundingClientRect().bottom) -
      30;

    d3.select("#headline").style("margin-top", -1 * svgWhiteSpace + "px");
  } else {
    d3.select("#headline").classed("phone-headline", true);
    d3.select(".phone-headline").style("top", height - 300 + "px");
    // d3.select('#top-map-time').style('display', 'none');
    d3.select("#top-map-time").classed("phone-time", true);
    d3.select("#top-map").classed("phone-top-map", true);
  }

  function dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  var lastTime;

  Object.keys(data).forEach((nNumber) => {
    Object.keys(data[nNumber].data).forEach((trip) => {
      var t = data[nNumber].data[trip].map((d) =>
        tp("2020-08-" + d[2] + "+00:00")
      );

      var timeExtent = [t[0], t.slice(-1)[0]];
      var c = data[nNumber].data[trip].map((d) => [d[0], d[1]]);
      // segment lengths
      var segLengths = [];
      var totalLength = 0;

      for (let i = 1; i < c.length; i++) {
        var [x1, y1] = projection(c[i - 1]);
        var [x2, y2] = projection(c[i]);
        var l = dist(x2, y2, x1, y1);
        totalLength += l;
        segLengths.push(l);
      }

      var tripGeoJson = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: c,
        },
        properties: {
          timestamps: t,
          timeExtent: timeExtent,
          el: null,
          dashOffset: totalLength,
          iconLoc: [0, 0],
        },
      };

      var el2 = g
        .append("path")
        .attr("class", "trip-path " + data[nNumber].type)
        .attr("id", trip)
        .style("stroke-dasharray", totalLength)
        .style("stroke-dashoffset", totalLength)
        .datum(tripGeoJson)
        .attr("d", path);

      var icon = g
        .append("circle")
        .datum(tripGeoJson)
        .attr("class", "trip-path-icon " + "icon-" + data[nNumber].type)
        .attr("id", "icon-" + trip)
        // .attr('d', icons[data[nNumber].type]);
        .attr("r", rad)
        .attr("cx", -10000)
        .attr("cy", -10000);

      tripGeoJson.properties.el = el2;
      // start stamp, end stamp, all timestamps, length of flight, path element, length of segments, total length, currentActiveSegmentIndex
      startEndStamps.push([
        t[0],
        t[1],
        t,
        el2,
        segLengths,
        totalLength,
        -1,
        icon,
        el2.node(),
        trip,
      ]);
      if (!lastTime || +lastTime <= +timeExtent[1]) {
        lastTime = timeExtent[1];
      }
    });
  });

  g.selectAll(".trip-path-icon").raise();

  var sortedIndex = Object.keys(startEndStamps).sort((a, b) => {
    if (+startEndStamps[+a][0] > +startEndStamps[+b][0]) return 1;
    if (+startEndStamps[+b][0] > +startEndStamps[+a][0]) return -1;
  });

  startEndStamps = sortedIndex.map((d) => startEndStamps[d]);

  startEndStamps = startEndStamps.slice(21);
  var timePassed = +startEndStamps[0][0];

  var currentLatestTripStartedIndex = 0;

  let offsetR = 0;
  let oldR = 0;

  function getRotation(oldPoint, newPoint, print = false) {
    const dx = newPoint.x - oldPoint.x;
    const dy = newPoint.y - oldPoint.y;
    let newR = (Math.atan(dy / dx) * 180) / Math.PI + offsetR;

    // prevent icon from flip-flopping across the line
    // if in second or third quadrant
    if (dx < 0) {
      newR += 180;
    }

    return newR;
  }

  var interval = setInterval(() => {
    timePassed += 15 * 1000;

    var caliTime = moment(timePassed).tz("America/Los_Angeles");

    d3.selectAll(".time-text").text(caliTime.format("h:mm a"));

    for (
      let i = currentLatestTripStartedIndex + 1;
      i < startEndStamps.length;
      i++
    ) {
      if (+startEndStamps[i][0] > timePassed) break;
      else currentLatestTripStartedIndex = i;
    }

    for (let i = 0; i <= currentLatestTripStartedIndex; i++) {
      // from ALL the timestamps of the trip, figure out where tf the plane was last timestamped.
      // add up all segment lengths UPTO that timestamp.
      // thenn from this timestamp to the next, calculate pct completed in the segment length
      // set stroke dash offset to that...
      // phew
      var allTripTimeStamps = startEndStamps[i][2];
      var el = startEndStamps[i][3];
      var segLengths = startEndStamps[i][4];
      var totalLength = startEndStamps[i][5];
      var previousTimeStampIndex = startEndStamps[i][6];
      var icon = startEndStamps[i][7];
      var elNode = startEndStamps[i][8];
      var trip = startEndStamps[i][9];

      // already fully drawn
      if (previousTimeStampIndex === allTripTimeStamps.length - 1) continue;

      for (let j = 0; j < allTripTimeStamps.length; j++) {
        if (+allTripTimeStamps[j] > timePassed) break;
        else previousTimeStampIndex = j;
      }

      startEndStamps[i][6] = previousTimeStampIndex;

      if (previousTimeStampIndex === allTripTimeStamps.length - 1) {
        el.style("stroke-dashoffset", 0).classed("disappear", true);
        // also disappear icon
        icon.classed("disappear-complete", true);
        continue;
      }
      var dashOffset = 0;

      for (let k = 0; k < previousTimeStampIndex; k++) {
        dashOffset += segLengths[k];
      }
      var pctTimePassedSinceLastTimeStamp =
        (timePassed - +allTripTimeStamps[previousTimeStampIndex]) /
        (+allTripTimeStamps[previousTimeStampIndex + 1] -
          +allTripTimeStamps[previousTimeStampIndex]);

      dashOffset +=
        segLengths[previousTimeStampIndex] * pctTimePassedSinceLastTimeStamp;

      // place icon
      // get point at length of path
      var iconLoc = elNode.getPointAtLength(dashOffset);

      var nextLoc = elNode.getPointAtLength(
        dashOffset + 0.01 * segLengths[previousTimeStampIndex]
      );

      var r = getRotation(iconLoc, nextLoc);

      el.style("stroke-dashoffset", totalLength - dashOffset + "px");
      icon.attr("cx", iconLoc.x).attr("cy", iconLoc.y);
    }

    if (+lastTime < timePassed) {
      clearInterval(interval);
    }
  }, 20);
}

function showVideo() {
  var width = 600;
  var height = window.innerHeight >= 800 ? 800 : window.innerHeight + 60;
  d3.select("#top-map-time").style("display", "none");
  d3.select("#top-map").style("display", "none");
  d3.select("#top-map-video").style("display", "block");
  d3.select("#headline").classed("phone-headline", true);
  d3.select(".phone-headline").style("top", height - 300 + "px");
  // d3.select('#top-map-time').style('display', 'none');
  d3.select("#top-map-time").classed("phone-time", true);
  d3.select("#top-map").classed("phone-top-map", true);
  // d3.select;
}
