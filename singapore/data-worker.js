import * as d3 from "d3";
// var cluster_codes = require('../static/data/bigClusterCodes.json');
var nodesCategory = require("../static/data/bigNodesCategory.json");

self.onmessage = (event) => {
  // var t0 = performance.now();
  var pos = JSON.stringify(process(JSON.parse(event.data)));
  // var t1 = performance.now();
  // console.log('process took - ' + (t1 - t0) / 1000 + 's');
  // console.log('recieving: ' + byteLength(event.data) / 1000 + 'kb');
  // console.log('sending back: ' + byteLength(pos) / 1000 + 'kb');
  // t0 = performance.now();
  self.postMessage(pos);
  // t1 = performance.now()
  // console.log("process took - " + (t1 - t0) / 1000 + "s");
};

function process({
  day,
  dayData,
  previousPositions,
  cluster_positions_from_cluster_code = null,
  rotated,
}) {
  // add in an "initial position" entry to every entry at the day's end
  var tweenPositions = [];
  var previousKeys = Object.keys(previousPositions);
  // console.log(previousKeys);
  // console.log(dayData[0][0]);
  // var t0 = performance.now();
  for (let i = 0; i < dayData.length; i++) {
    var node = dayData[i];
    var nodeId = "" + node[0];
    // if this node existed in the previous day's nodes, just carry over those positions
    var ticks = Math.ceil(dayData.length / 20);
    // var ticks = 20;

    // if case node
    var exists;
    if (nodeId[0] == "C") {
      // nodes are always at the end of the array
      exists =
        previousPositions[previousPositions.length - (3 - +nodeId[1]) - 1];
    } else {
      exists = previousPositions[+nodeId - 1];
    }

    // var exists = -1;

    // initialPosition for this node
    var init = [null, null];

    if (exists && "" + exists[0] === nodeId) {
      init = [exists[1], exists[2]];
    }

    // else initialise center of the cluster. IF the cluster centers are passed
    // else just initialise to the current node position. so no animation
    else {
      if (cluster_positions_from_cluster_code)
        init = cluster_positions_from_cluster_code[nodesCategory[nodeId]];
      else {
        init = [node[1], node[2]];
        if (rotated) {
          init = [init[1], init[0]];
        }
      }
    }

    var ticksThisDay = 20;

    if (rotated) {
      tweenPositions[i] = [node[0], [init[0], node[2]], [init[1], node[1]]];
    } else {
      tweenPositions[i] = [node[0], [init[0], node[1]], [init[1], node[2]]];
    }
    // if(nodeId[0] == 'C')
    //   debugger;
  }
  // var t1 = performance.now();
  // console.log('process took - ' + (t1 - t0) / 1000 + 's');

  // console.log('BIG WORKER: processed - ' + day);

  return {
    day: day,
    tweenPositions: tweenPositions,
  };
}
