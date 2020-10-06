const d3 = require('d3-selection');

function makeClock(
  containerSelector,
  {
    targetSeconds = 20,
    resetEvHandler = null,
    tickEvHandler = null,
    w = 200,
    h = 200,
    clockExtent = 3600,
    needleArc = true,
    needle = true,
    needleOffset = 12,
    digital = false,
    digitalWidth = 12,
    tickDigitalTime = true,
    digitalCircle = true,
  }
) {
  var fmt = function (secs) {
    const mins = Math.floor(secs / 60)
      .toFixed()
      .padStart(2, '0');
    secs = (secs - mins).toFixed().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (clockExtent < targetSeconds) clockExtent = targetSeconds;
  const r = w / 2;
  let secsElapsed = 0;
  let times = 0;

  const clockContainer = document.querySelector(containerSelector);

  var clockInner = d3
    .select(containerSelector)
    .append('div')
    .attr('id', 'svg-countdown-clock-container');

  clockContainer.addEventListener('clock-reset', resetEvHandler);
  clockContainer.addEventListener('clock-tick', tickEvHandler);

  const anglePerSecond = (2 * Math.PI) / clockExtent;
  const endAngle = (2 * Math.PI * targetSeconds) / clockExtent;

  // from https://codereview.stackexchange.com/questions/47889/alternative-to-setinterval-and-settimeout
  const rInterval = function (callback, delay) {
    const dateNow = Date.now;
    const requestAnimation = window.requestAnimationFrame;
    let start = dateNow();
    let stop, pause;
    function intervalFunc() {
      if (document.hidden || pause || stop) {
        start = dateNow();
      } else if (dateNow() - start >= delay) {
        start += delay;
        callback();
      }

      // if (!stop && !pause) {
      requestAnimation(intervalFunc);
      // }
    }
    return {
      start: () => {
        pause = 0;
        stop = 0;
        requestAnimation(intervalFunc);
      },
      stop: () => {
        stop = 1;
      },
      pause: () => {
        pause = 1;
      },
    };
  };

  const svg = clockInner
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('class', 'clock');
  // .attr('viewBox', `0 0 200 200`);

  // offset functions:
  // all my angle and x y calculations are using the centre of the clock as <0, 0>
  // need to translate these to svg coordinates. in avg coordinates, the centre would be <w / 2, h / 2>
  // also need to flip the y axis
  function xOffset(x) {
    return x + w / 2;
  }

  function yOffset(y) {
    return -(y - h / 2);
  }

  function makeTick(g, rEff, angle, length, type) {
    const coords = {
      x1: xOffset((rEff - length) * Math.sin(angle)),
      y1: yOffset((rEff - length) * Math.cos(angle)),
      x2: xOffset(rEff * Math.sin(angle)),
      y2: yOffset(rEff * Math.cos(angle)),
    };
    g.append('line')
      .attr('class', type)
      .attr('x1', coords.x1)
      .attr('y1', coords.y1)
      .attr('x2', coords.x2)
      .attr('y2', coords.y2);
  }

  function updateNeedle(el, angle, length = r) {
    const rEff = r - needleOffset;

    const coords = {
      x1: xOffset((rEff - length) * Math.sin(angle)),
      y1: yOffset((rEff - length) * Math.cos(angle)),
      x2: xOffset(rEff * Math.sin(angle)),
      y2: yOffset(rEff * Math.cos(angle)),
    };

    el.transition()
      .attr('x1', coords.x1)
      .attr('y1', coords.y1)
      .attr('x2', coords.x2)
      .attr('y2', coords.y2);
  }

  function updateDigital(el, r, angle) {
    if (digitalCircle) {
      const rEff = r - digitalWidth;
      const largeArcFlag = +(angle > Math.PI);

      const pathData = `
      M ${xOffset(0)}, ${yOffset(rEff)}
      L ${xOffset(0)}, ${yOffset(r)}
      A ${r} ${r} 0 ${largeArcFlag} 1 ${
        xOffset(r * Math.sin(angle)) - 0.1
      } ${yOffset(r * Math.cos(angle))}
      L ${xOffset(rEff * Math.sin(angle))}, ${yOffset(rEff * Math.cos(angle))}
      A ${rEff} ${rEff} 0 ${largeArcFlag} 0 ${xOffset(0) + 0.1}, ${yOffset(
        rEff
      )}
      Z`;

      el.attr('d', pathData);
    }

    if (tickDigitalTime) {
      document.querySelector('.digital-text').innerHTML = fmt(
        Math.floor(targetSeconds - secsElapsed)
      );
    }
  }

  function makeBackGround() {
    const g = svg.append('g').attr('class', 'background-container');

    g.append('circle')
      .attr('class', 'background-circle')
      .attr('cx', w / 2)
      .attr('cy', h / 2)
      .attr('r', r);
  }

  function makeMarkings() {
    const g = svg.append('g').attr('class', 'markings-container');

    const rEff = r - 10;

    // minute marking
    // for (let i = 0; i <= clockExtent; i += clockExtent / 10) {
    //   makeTick(g, rEff, (2 * Math.PI * i) / 60 / 60, 3, 'mark minute-mark');
    // }

    // hour mark
    // for (let i = 0; i <= 12; i += 1) {
    //   makeTick(g, rEff, (2 * Math.PI * i) / 12, 5, 'mark hour-mark');
    // }

    for (let i = 0; i <= clockExtent; i += clockExtent / 10) {
      makeTick(g, rEff, (2 * Math.PI * i) / clockExtent, 3, 'mark minute-mark');
    }
  }

  function makeDigital() {
    if (digitalCircle) {
      makeBackGround();
      const g = svg.append('g').attr('class', 'digital-container');
      const rEff = r - digitalWidth;
      const largeArcFlag = +(endAngle > Math.PI);

      const fullPathData = `
      M ${xOffset(0)}, ${yOffset(rEff)}
      L ${xOffset(0)}, ${yOffset(r)}
      A ${r} ${r} 0 1 0 ${xOffset(r * Math.sin(2 * Math.PI)) + 0.01} ${yOffset(
        r * Math.cos(2 * Math.PI)
      )}
      L ${xOffset(rEff * Math.sin(2 * Math.PI))}, ${yOffset(
        rEff * Math.cos(2 * Math.PI)
      )}
      A ${rEff} ${rEff} 0 1 1 ${xOffset(0) - 0.01}, ${yOffset(rEff)}
      Z`;

      const pathData = `
      M ${xOffset(0)}, ${yOffset(rEff)}
      L ${xOffset(0)}, ${yOffset(r)}
      A ${r} ${r} 0 ${largeArcFlag} 1 ${xOffset(
        r * Math.sin(endAngle)
      )} ${yOffset(r * Math.cos(endAngle))}
      L ${xOffset(rEff * Math.sin(endAngle))}, ${yOffset(
        rEff * Math.cos(endAngle)
      )}
      A ${rEff} ${rEff} 0 ${largeArcFlag} 0 ${xOffset(0)}, ${yOffset(rEff)}
      Z`;

      g.append('path').attr('class', 'full-arc').attr('d', fullPathData);
      g.append('path').attr('class', 'digital-arc').attr('d', pathData);
    }

    var text = clockInner.append('div').attr('class', 'digital-text-container');

    text.append('div').attr('class', 'digital-text').text(fmt(targetSeconds));

    // text.append('div').text('seconds');
  }

  function makeNeedle() {
    makeBackGround();
    const g = svg.append('g').attr('class', 'needle-container');
    const rEff = r - needleOffset;
    const largeArcFlag = +(endAngle >= Math.PI);

    // make arc
    if (needleArc) {
      g.append('path')
        .attr('class', 'time-arc')
        .attr(
          'd',
          `M ${w / 2} ${h / 2} L ${xOffset(
            rEff * Math.sin(endAngle)
          )} ${yOffset(
            rEff * Math.cos(endAngle)
          )} A ${rEff} ${rEff} 0 ${largeArcFlag} 0 ${w / 2} ${h / 2 - rEff} Z`
        );
    }

    makeTick(g, rEff, endAngle, r, 'needle');

    // centre circle
    g.append('circle')
      .attr('class', 'centre-circle')
      .attr('cx', w / 2)
      .attr('cy', h / 2)
      .attr('r', 5);
  }

  function ticker() {
    return rInterval(() => {
      // why 0.5?
      // so that we can have one more tick between 0 seconds and targetSeconds and for that 0.5 second show the full bar on the DIGITAL clock
      secsElapsed += 0.5;
      // dispatch reset event if clock timer needs to reset
      if (secsElapsed === targetSeconds) {
        secsElapsed = 0;
        times += 1;

        clockContainer.dispatchEvent(
          new CustomEvent('clock-reset', {
            detail: {
              elapsed: Math.floor(secsElapsed),
              remaining: targetSeconds - Math.floor(secsElapsed),
              times,
            },
          })
        );
      }
      clockContainer.dispatchEvent(
        new CustomEvent('clock-tick', {
          detail: {
            elapsed: secsElapsed,
            remaining: targetSeconds - secsElapsed,
            times,
          },
        })
      );

      if (needle) {
        updateNeedle(
          svg.select('.needle'),
          Math.floor(targetSeconds - secsElapsed) * anglePerSecond,
          r
        );
      }
      if (digital) {
        updateDigital(
          svg.select('.digital-arc'),
          r,
          Math.floor(targetSeconds - secsElapsed) * anglePerSecond,
          digitalWidth
        );
      }
    }, 500);
  }

  if (needle) {
    makeMarkings();
    makeNeedle();
  }

  if (digital) makeDigital();

  return ticker();
}

export default makeClock;
