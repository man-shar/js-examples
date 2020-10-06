import layout from "./layout";
import { pickNRandom, mobileCheck } from "./util";
import { cache } from "./cache-neighbours";

// import neighbours from './cache-neighbours';

// https://web.stanford.edu/~jhj1/teachingdocs/Jones-on-R0.pdf
// https://en.wikipedia.org/wiki/Mathematical_modelling_of_infectious_disease#Modelling_epidemics
// c is average rate of contact between suspected and infected
// d is the duration of infectiousness.
// i is the proportion of people infected initially
// v is the proportion of people vaccinated initially
// assumes 1 tick = 1 day

// states:
// S: Susceptible
// I: Infected
// V: Vaccinated
// R: Removed/Inert

function herdSim({
  pop,
  r0,
  d,
  c,
  i,
  v,
  curedImmunity = true,
  infectEvent = null,
  vaccinateEvent = null,
  cureEvent = null,
  susceptibleEvent = null,
  removeEvent = null,
  maintainR0 = false,
  finishEvent = null,
  startEvent = null,
  specialCats = {},
  initials = {},
  longRangeConnections = true,
  longRangeFrac = 7,
  vacEff = 0.7,
}) {
  // tao = transmissibility
  var people, tao, s, X, vacProbPerDay;
  var runningR0 = 0;
  var resets = 0;
  // average rate of contact between s and i
  // every susceptible person has 8 neighbours
  // probability of the neighbour being infected is i
  // so ON AN AVERAGE, number of infected neighbours will be
  // probability of infection * number of neighbours

  // console.log(longRangeFrac);

  function calculateConstants() {
    // susceptible probability
    s = 1 - v - i;

    // per neighbour probability of infection
    // c - 1 because this is a lattice model so at least one of the neighbours
    // is already infected as it's the source of the infection.
    /*
    from Dr Joel Miller
    So here is the calculation to make sure that the probability an individual transmits to a partner is 2.5/7.
    Assume that the per-day probability of transmitting to a partner is p.  Then the probability of not transmitting in a day is 1-p.  The probability of not transmitting in 2 days is (1-p)^2, and more generally the probability of not transmitting in 7 days is (1-p)^7.
    So the probability of transmitting at least once is 1-(1-p)^7.   Then we have 1-(1-p)^7 = X.  So  (1-p)^7 = 1-X and 1-p=(1-X)^(1/7).  So finally
    p = 1- (1-X)^(1/7)
    */

    X = r0 / (c - 1);
    if (X >= 1) {
      tao = 1;
    } else {
      tao = 1 - Math.pow(1 - X, 1 / d);
    }

    // probability of a vaccinated individual getting infected per day
    // https://www.cdc.gov/csels/dsepd/ss1978/lesson3/section6.html

    vacProbPerDay = (0.3 * tao) / r0;
  }

  calculateConstants();

  // tao = r0 / (s * c) / d;
  //
  // console.log(tao, r0 / (s * c) / d);
  // tao = 1;

  // n = number of...
  // nI: number of infected
  // nS: number of susceptible
  // nV: number of vaccinated/cured/immune
  var nI = 0;
  var nS = 0;
  var nV = 0;
  var nR = 0;
  var initialise;
  var currentGeneration = 1;

  var tickInterval;
  var ticks = 0;

  var totalNeighboursInfected = 0;
  var cellsOneRoundOfInfectionCompleted = 0;

  if (infectEvent === null) infectEvent = () => {};
  if (cureEvent === null) cureEvent = () => {};
  if (vaccinateEvent === null) vaccinateEvent = () => {};
  if (susceptibleEvent === null) susceptibleEvent = () => {};

  // agents is a list of only the infected individuals. to prevent looping over the entire array.
  var agents = [];

  function setup({
    layoutType = "rectGrid",
    perRow,
    xOffset,
    yOffsetPerRow,
    cellPadding = 0,
    align = 0,
    ctx,
  }) {
    // add checks for type and required variables
    people = layout[layoutType]({
      total: pop,
      perRow,
      xOffset,
      yOffsetPerRow,
      cellPadding,
      align,
    });

    // console.log(pop);

    if (!window.neighbours[perRow]) {
      window.neighbours[perRow] = {};
      window.neighbours[perRow][people.coords.length] = {};
      window.neighbours[perRow][people.coords.length] = cache(
        perRow,
        people.coords.length
      );
    } else if (!window.neighbours[perRow][people.coords.length]) {
      window.neighbours[perRow][people.coords.length] = {};
      window.neighbours[perRow][people.coords.length] = cache(
        perRow,
        people.coords.length
      );
    }

    if (ctx) {
      var phone = mobileCheck();
      var w = people.extentX[1] + xOffset;
      var h = people.extentY[1] + 2 * xOffset;
      var scale = window.devicePixelRatio;
      ctx.canvas.style.width = w + "px";
      ctx.canvas.style.height = h + "px";

      ctx.canvas.width = w * scale;
      ctx.canvas.height = h * scale;

      ctx.scale(scale, scale);
      ctx.strokeStyle = "#212121";

      ctx.lineWidth = phone ? 0.1 : 0.4;
    }

    // shuffle index
    // now just approximate number of individuals needed
    // keep a running tally of all the indices that are already categorised
    var toSkip = [];
    var initialInfected = [];
    var initialVaccinated = [];
    var specialCatsInitials = [];

    function setupInitials() {
      toSkip = [];
      initialInfected = [];
      initialVaccinated = [];
      specialCatsInitials = [];

      if (initials.i) {
        initialInfected = initials.i;
      } else {
        // initial infected
        if (initials.v) {
          toSkip = toSkip.concat(initials.v);
        }
        initialInfected = pickNRandom(pop, Math.floor(i * pop), toSkip);
      }

      toSkip = toSkip.concat(initialInfected);

      if (initials.v) {
        initialVaccinated = initials.v;
      } else {
        // initial vaccinated
        initialVaccinated = pickNRandom(pop, Math.floor(v * pop), toSkip);
      }

      // console.log(initialVaccinated);

      // console.log(
      //   initialInfected
      //     .map((d) => initialVaccinated.indexOf(d))
      //     .filter((d) => d !== -1)
      // );

      // try {
      toSkip = toSkip.concat(initialVaccinated);
      // } catch (e) {
      //   console.log(e);
      //   console.log(
      //     initialVaccinated,
      //     toSkip,
      //     initialVaccinated.length,
      //     toSkip.length
      //   );
      //   debugger;
      // }

      if (initials.spl) {
        specialCatsInitials = initials.spl;
      } else {
        // special cats
        specialCatsInitials = Object.keys(specialCats).reduce((obj, cat) => {
          obj[cat] = pickNRandom(
            pop,
            Math.floor(specialCats[cat] * pop),
            toSkip
          );
          toSkip = toSkip.concat(obj[cat]);
          return obj;
        }, {});
      }
    }

    setupInitials();

    initialise = function (refreshInitials = true) {
      nI = 0;
      nS = 0;
      nV = 0;
      nR = 0;

      currentGeneration = 1;
      totalNeighboursInfected = 0;
      cellsOneRoundOfInfectionCompleted = 0;

      for (let rowNum = 0; rowNum < people.coords.length; rowNum++) {
        var row = people.coords[rowNum];
        for (let colNum = 0; colNum < row.length; colNum++) {
          var cell = row[colNum];
          // everyone is susceptible
          cell.state = "S";
          cell.infectedDuration = 0;
          cell.neighboursInfected = 0;
          cell.generation = Infinity;
          cell.susceptibleContact = 0;
          cell.oneRoundOfInfectionCompleted = false;
          nS++;
          cell.index = rowNum * perRow + colNum;
          var ref = neighbours[perRow][people.coords.length][rowNum][colNum];
          cell.neighbours = [];

          for (let k = 0; k < ref.length; k++) {
            cell.neighbours[k] = people.coords[ref[k][0]][ref[k][1]];
          }
          // for (
          //   let k = Math.max(0, rowNum - 1);
          //   k <= Math.min(people.coords.length - 1, rowNum + 1);
          //   k++
          // ) {
          //   for (
          //     let l = Math.max(0, colNum - 1);
          //     l <= Math.min(row.length - 1, colNum + 1);
          //     l++
          //   ) {
          //     if ((k !== rowNum || l !== colNum) && people.coords[k][l]) {
          //       cell.neighbours[cell.neighbours.length] = people.coords[k][l];
          //       // cell.neighbours.push(people.coords[k][l]);
          //     }
          //   }
          // }
          susceptibleEvent(cell);
          // cell.neighbours = [
          //   [rowNum - 1, colNum - 1, (rowNum - 1) * perRow + colNum - 1],
          //   [rowNum - 1, colNum, (rowNum - 1) * perRow + colNum],
          //   [rowNum - 1, colNum + 1, (rowNum - 1) * perRow + colNum + 1],
          //   [rowNum, colNum - 1, rowNum * perRow + colNum - 1],
          //   [rowNum, colNum + 1, rowNum * perRow + colNum + 1],
          //   [rowNum + 1, colNum - 1, (rowNum + 1) * perRow + colNum - 1],
          //   [rowNum + 1, colNum, (rowNum + 1) * perRow + colNum],
          //   [rowNum + 1, colNum + 1, (rowNum + 1) * perRow + colNum + 1],
          // ];

          // if (
          //   rowNum === 0 ||
          //   rowNum === people.coords.length - 1 ||
          //   colNum === 0 ||
          //   colNum === row.length - 1
          // ) {
          //   cell.neighbours = cell.neighbours.filter((d) => {
          //     return (
          //       d[0] >= 0 &&
          //       d[1] >= 0 &&
          //       people.coords[d[0]] &&
          //       people.coords[d[0]][d[1]]
          //     );
          //   });
          // }
          // cell.neighbours = cell.neighbours.map((d) => {
          //   return people.coords[d[0]][d[1]];
          // });
        }
      }

      if (refreshInitials) {
        setupInitials();
      }

      if (longRangeConnections && longRangeFrac !== 0) {
        // console.log(longRangeFrac);
        // add a long range neighbours to 1/6th of the cells
        var longRange = pickNRandom(pop, Math.floor(pop / longRangeFrac));
        // for each of these cells, add a long range neighbour
        // console.log(longRange.length, pop, pop / longRange.length);
        // console.log(`1/${longRangeFrac}`, longRange.length);
        longRange.forEach((d) => {
          var cell = people.coords[Math.floor(d / perRow)][d % perRow];

          var neighbourIndexes = cell.neighbours.map((d, i) => {
            return d.index;
          });
          var newNeighbour = pickNRandom(pop, 1, neighbourIndexes);
          cell.neighbours.push(
            people.coords[Math.floor(newNeighbour[0] / perRow)][
              newNeighbour[0] % perRow
            ]
          );
        });
      }

      initialInfected.forEach((d, i) => {
        const cell = people.coords[Math.floor(d / perRow)][d % perRow];
        nI++;
        nS--;
        cell.state = "I";
        cell.infectedDuration = 0;
        cell.generation = 1;
        agents.push(cell);
        infectEvent(cell, true);
      });

      initialVaccinated.forEach((d) => {
        const cell = people.coords[Math.floor(d / perRow)][d % perRow];
        nV++;
        nS--;
        cell.state = "V";
        cell.immune = true;
        vaccinateEvent(cell);
      });

      // use vaccine effective rate to make 1 - vacEff percent of vaccinated people not immune
      var badVac = pickNRandom(
        initialVaccinated.length,
        Math.ceil((1 - vacEff) * initialVaccinated.length)
      );

      // console.log(initialVaccinated.length, immune.length);

      badVac.forEach((i) => {
        var d = initialVaccinated[i];
        people.coords[Math.floor(d / perRow)][d % perRow].immune = false;
      });

      Object.keys(specialCatsInitials).forEach((cat) => {
        specialCatsInitials[cat].forEach((d) => {
          const cell = people.coords[Math.floor(d / perRow)][d % perRow];
          nV++;
          nS--;
          cell.state = "V";
          cell.special = cat;
          cell.immune = true;
          vaccinateEvent(cell, cat);
        });
      });

      startEvent();
    };

    initialise(false);

    // finishEvent(reset);

    return people;
  }

  var cellsForR0 = [];

  function updateR0(indexList) {
    // find number needed to get closest to r0
    var runningDelta = Infinity;
    var count = 0;
    // console.log(
    //   totalNeighboursInfected,
    //   cellsOneRoundOfInfectionCompleted,
    //   runningR0,
    //   nI
    // );
    for (let i = 0; i < indexList.length; i++) {
      var diff = Math.abs(
        (totalNeighboursInfected + i + 1) / cellsOneRoundOfInfectionCompleted -
          r0
      );
      if (diff <= runningDelta) {
        // console.log(count, 'diff: ', diff, 'runningDelta: ', runningDelta);
        count = i + 1;
        runningDelta = diff;
      } else {
        // means we're going further away from the average. so no need to continue
        break;
      }
    }
    if (count === 0) return [];

    return pickNRandom(indexList.length, count).map((d) => indexList[d]);
  }

  function fullRun() {
    var finished = false;
    while (!finished) {
      finished = tickSim({ repeat: true });
    }
    return null;
  }

  // return value: if the sim is finished or not.
  function tickSim(
    { repeat = false, cb = null } = { repeat: false, cb: null }
  ) {
    // console.log(((nI + nR) * 100) / pop);
    // if (nI === 0 && nS === 0) {
    //   clearInterval(tickInterval);
    // }

    if (nI === 0 && nR !== 0) {
      finishEvent();
      if (cb !== null) {
        cb(nI, nR, ticks);
      }
      return true;
    }

    // for (let rowNum = 0; rowNum < people.coords.length; rowNum++) {
    //   const row = people.coords[rowNum];
    //   for (let colNum = 0; colNum < row.length; colNum++) {
    //     const cell = row[colNum];

    for (let i = agents.length - 1; i >= 0; i--) {
      const cell = agents[i];

      // if (cell.state === 'V' || cell.state === 'R') continue;
      if (cell.state === "I" && cell.generation <= currentGeneration) {
        // infect neighbours based on transmissibility
        // if (cell.neighbours.filter((d) => d.state === 'S').length === 8) {
        //   cellsForR0.push(cell);
        // }

        var neighbour;

        // either probability method
        // if (!maintainR0) {
        for (let j = 0; j < cell.neighbours.length; j++) {
          neighbour = cell.neighbours[j];
          if (neighbour === undefined) continue;
          // if susceptible comes in contact with infected and random is higher than transmissibility
          // make it infected
          // colour the corresponding cell

          if (neighbour.state === "S") {
            cell.susceptibleContact += 1;
            if (Math.random() < tao) {
              // if (neighbour.state === 'S' && neighbour.susceptible) {
              neighbour.state = "I";
              nI++;
              nS--;
              infectEvent(neighbour, true);
              cell.neighboursInfected++;
              neighbour.generation = cell.generation + 1;
              totalNeighboursInfected++;
              agents.push(neighbour);
            }
          }
          // vaccine efficacy
          // vaccine works 70% (default vacEff) of time.
          // so Math.random > 0.7 should infect
          // is equivalent to saying Math.random < 1 - 0.7 should infect
          if (neighbour.state === "V" && !neighbour.immune) {
            // if (Math.random() < vacProbPerDay) {
            if (Math.random() < tao) {
              neighbour.state = "I";
              nI++;
              nV--;
              infectEvent(neighbour, true);
              cell.neighboursInfected++;
              neighbour.generation = cell.generation + 1;
              totalNeighboursInfected++;
              agents.push(neighbour);
            }
          }
        }
        // } else {
        // }

        // increment the infectedDuration
        cell.infectedDuration++;
        // check infectedDuration against duration of infectiousness. update to immune if duration has exceeded.
        // also this person can't infect neighbours anymore so return

        if (cell.infectedDuration > d) {
          nI--;
          cell.infectedDuration = 0;

          // if cured immunity flag is true (default), the just turn into inert cell
          if (curedImmunity) {
            cell.state = "R";
            removeEvent(cell);
            nR++;
            // var t = agents.splice(i, 1);
            // instead of splice... pop the last element of the array, and replace the current one with that
            if (i !== agents.length - 1) {
              // pop the last element
              var last = agents.pop();
              // replace current element with that. since we're iterating backwards, we've already iterated over the popped element
              // so no worries re missing this one.
              agents[i] = last;
            } else {
              // if the current element is the last element, simply pop it
              var last = agents.pop();
            }
          } else {
            // then they can decide if they want to get vaccinated or not.
            // otherwise back to susceptible
            if (Math.random() < v) {
              cell.state = "R";
              removeEvent(cell);
              nR++;
            } else {
              cell.state = "S";
              susceptibleEvent(cell);
              nS++;
            }
          }
        }
      }
    }
    // }
    ticks++;
    currentGeneration++;

    if (cb !== null) {
      cb(nI, nR, ticks);
    }

    // some random code I tried writing to calculate the average R0 when using the "maintain R0" method.
    // IGNORE. DON'T USE.
    // s = nS / pop;
    // console.log(tao);
    // tao = r0 / (s * c) / d;
    // console.log(totalNeighboursInfected, cellsOneRoundOfInfectionCompleted);
    // if (ticks === 120) {
    //   cellsForR0 = [];
    //   var x = 0;
    //   for (let rowNum = 0; rowNum < people.coords.length; rowNum++) {
    //     const row = people.coords[rowNum];
    //     for (let colNum = 0; colNum < row.length; colNum++) {
    //       const cell = row[colNum];
    //       if (cell.generation === 1) {
    //         cellsForR0.push(cell);
    //         x += cell.neighboursInfected;
    //       }
    //     }
    //   }
    // }
  }

  function reset(
    newR0 = undefined,
    newVac = undefined,
    {
      refreshInitials = true,
      newVacEff = vacEff,
      newLongRangeFrac = longRangeFrac,
      newInitials = false,
    } = {
      refreshInitials: true,
      newVacEff: vacEff,
      newLongRangeFrac: longRangeFrac,
      newInitials: false,
    }
  ) {
    if (newR0 !== false && newR0 !== undefined) {
      r0 = newR0;
    }
    if (newVac !== false && newVac !== undefined) {
      v = newVac;
    }
    if (newVacEff !== false && newVacEff !== undefined) {
      vacEff = newVacEff;
    }
    if (newLongRangeFrac) {
      longRangeFrac = newLongRangeFrac;
    }
    if (newInitials) {
      Object.keys(newInitials).forEach((cat) => {
        initials[cat] = newInitials[cat];
      });
    }

    calculateConstants();
    // maintainR0 = !maintainR0;
    // console.log(initials.spl);
    initialise(refreshInitials);
    for (let rowNum = 0; rowNum < people.coords.length; rowNum++) {
      const row = people.coords[rowNum];
      for (let colNum = 0; colNum < row.length; colNum++) {
        const cell = row[colNum];
        if (cell.state === "I") {
          infectEvent(cell);
        }
        if (cell.state === "V") {
          vaccinateEvent(cell, cell.special);
        }
        if (cell.state === "S") {
          susceptibleEvent(cell);
        }
      }
    }
    ticks = 0;
    cellsForR0 = [];
    resets++;
    return false;
  }

  function log() {
    var logString = `
    Population: ${pop}
    Vaccination %: ${v * 100}%
    Infected: ${nI}, ${(nI * 100) / pop}%
    Removed: ${nR}, ${(nR * 100) / pop}%
    Susceptible: ${nS}, ${(nS * 100) / pop}%
    Vaccinated: ${nV}, ${(nV * 100) / pop}%
    Sanity: ${nS + nI + nR + nV}
    `;

    // return `${pop},${v},${nI},${nR},${nS},${nV},${nS + nI + nR + nV}`;

    return {
      pop,
      v,
      nI,
      nR,
      nS,
      nV,
      sanity: nS + nI + nR + nV,
      logString,
    };
  }

  return {
    setup,
    tickSim,
    tickCount: () => ticks,
    reset,
    log,
    fullRun,
  };
}

export default herdSim;
