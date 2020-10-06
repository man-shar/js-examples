import makeClock from './svg-countdown';
import { throttle, debounce } from './util';

const d3Sel = require('d3-selection');
// const d3Time = require('d3-time-format');
var d3 = Object.assign({}, d3Sel);

const personIcon = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 14.592 39.113" width=13 style="enable-background:new 0 0 14.592 39.113;" xml:space="preserve">
<g>
	<g>
		<g>
			<path style="fill:#FFFFFF;" d="M7.289,9.052c-2.309,0-4.188-1.919-4.188-4.278C3.102,2.418,4.98,0.5,7.289,0.5
				c2.303,0,4.176,1.917,4.176,4.274C11.464,7.133,9.589,9.052,7.289,9.052z"/>
			<path style="fill:#231F20;" d="M7.289,1c2.027,0,3.677,1.693,3.677,3.774c-0.003,2.084-1.651,3.778-3.677,3.778
				c-2.034,0-3.687-1.695-3.687-3.778C3.602,2.693,5.256,1,7.289,1 M7.289,0C4.705,0,2.602,2.142,2.602,4.774
				c0,2.635,2.103,4.778,4.687,4.778c2.575,0,4.673-2.143,4.677-4.777C11.966,2.142,9.868,0,7.289,0L7.289,0z"/>
		</g>
		<g>
			<path style="fill:#231F20;" d="M7.289,1.299c1.862,0,3.377,1.56,3.377,3.476c-0.001,1.929-1.515,3.48-3.377,3.48
				c-1.875,0-3.389-1.551-3.389-3.48C3.9,2.858,5.414,1.299,7.289,1.299 M7.289,0.702c-2.197,0-3.985,1.827-3.985,4.072
				c0,2.247,1.788,4.076,3.985,4.076c2.19,0,3.972-1.828,3.975-4.076C11.264,2.53,9.481,0.702,7.289,0.702L7.289,0.702z"/>
		</g>
	</g>
	<g>
		<g>
			<path style="fill:#FFFFFF;" d="M9.076,38.613c-0.707,0-1.356-0.321-1.792-0.844c-0.437,0.522-1.085,0.844-1.792,0.844
				c-1.294,0-2.348-1.076-2.348-2.398L3.139,23.532c-0.233,0.107-0.489,0.166-0.756,0.166c-0.913,0-1.883-0.73-1.883-2.085v-8.712
				c0-2.185,1.676-4.542,4.385-4.542l4.86-0.009c2.397,0,4.347,2.018,4.347,4.499v8.766c0,1.346-0.973,2.071-1.889,2.071
				c-0.277,0-0.542-0.061-0.78-0.173v13.501h-0.134C10.963,37.962,10.089,38.613,9.076,38.613z"/>
			<path style="fill:#231F20;" d="M9.746,8.85c2.121,0,3.846,1.793,3.846,3.998v8.766c0,1.031-0.699,1.571-1.389,1.571
				c-0.527,0-1.059-0.314-1.28-0.922v14.251h-0.024c-0.143,0.905-0.905,1.6-1.823,1.6c-0.858,0-1.584-0.601-1.792-1.415
				c-0.21,0.814-0.934,1.415-1.792,1.415c-1.019,0-1.848-0.852-1.848-1.899L3.639,22.319c-0.232,0.58-0.746,0.88-1.255,0.88
				C1.696,23.198,1,22.654,1,21.613v-8.712c0-1.944,1.485-4.042,3.885-4.042L9.746,8.85 M9.746,7.85L9.746,7.85H9.744L4.883,7.859
				C1.868,7.859,0,10.476,0,12.901v8.712c0,1.679,1.228,2.585,2.383,2.585c0.086,0,0.172-0.005,0.256-0.014l0.005,12.031
				c0,1.598,1.277,2.899,2.848,2.899c0.67,0,1.297-0.238,1.792-0.643c0.495,0.406,1.122,0.643,1.793,0.643
				c1.107,0,2.075-0.637,2.545-1.6h0.277l0.024-1V24.168c0.092,0.011,0.186,0.017,0.28,0.017c1.158,0,2.389-0.901,2.389-2.571
				v-8.766C14.592,10.092,12.418,7.85,9.746,7.85L9.746,7.85z"/>
		</g>
		<g>
			<path style="fill:#231F20;" d="M9.745,9.147c1.969,0,3.546,1.651,3.546,3.7v8.766c0,0.848-0.546,1.271-1.091,1.271
				c-0.546,0-1.091-0.425-1.091-1.271v-8.527h-0.488v23.127H10.62c0,0.885-0.684,1.601-1.544,1.601
				c-0.857,0-1.555-0.716-1.555-1.601V22.799H7.046v13.414c0,0.885-0.699,1.601-1.555,1.601c-0.861,0-1.55-0.716-1.55-1.601
				L3.934,13.086H3.467v8.526c0,0.859-0.542,1.287-1.084,1.287s-1.085-0.429-1.085-1.287V12.9c0-1.894,1.434-3.744,3.587-3.744
				L9.745,9.147 M9.745,8.549L9.745,8.549L9.745,8.549L4.881,8.559c-2.582,0-4.182,2.252-4.182,4.34v8.712
				c0,1.237,0.845,1.885,1.681,1.885c0.336,0,0.674-0.106,0.959-0.311l0.005,13.029c0,1.212,0.963,2.197,2.147,2.197
				c0.746,0,1.407-0.39,1.792-0.982C7.67,38.02,8.33,38.41,9.076,38.41c0.979,0,1.807-0.678,2.06-1.601h0.08l0.001-0.596V23.157
				c0.289,0.215,0.637,0.324,0.982,0.324c0.839,0,1.687-0.642,1.687-1.869v-8.767C13.888,10.477,12.03,8.549,9.745,8.549
				L9.745,8.549z"/>
		</g>
	</g>
</g>
</svg>
`;

function addPerson() {
  d3.select('#death-since-open').classed('hidden', false);
  const newCount =
    +document.querySelector('#deaths-since-open-count').innerText + 1;
  const newLabel = newCount > 1 ? ' people' : ' person';
  document.querySelector('#deaths-since-open-count').innerText = newCount;
  document.querySelector('#people-person').innerText = newLabel;

  d3.select('#deaths-icon-container').append('div').html(personIcon);

  fixMargin();
}

var fmt = function (secs) {
  const mins = Math.floor(secs / 60)
    .toFixed()
    .padStart(2, '0');
  secs = (secs - mins).toFixed().padStart(2, '0');
  return `${mins}:${secs}`;
};

function tickNavCountdown(ev) {
  // console.log(ev.detail);
  d3.select('#nav-time-container span').text(
    fmt(Math.floor(ev.detail.remaining))
  );
}

var clock = makeClock('#countdown-clock', {
  targetSeconds: 16,
  clockExtent: 16,
  needle: false,
  needleArc: false,
  digital: true,
  resetEvHandler: addPerson,
  tickEvHandler: tickNavCountdown,
  w: 150,
  h: 150,
  digitalWidth: 10,
  digitalCircle: false,
});

clock.start();

document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    clock.pause();
  } else {
    clock.start();
  }
});

var countdownBottom =
  document.getElementById('countdown-clock-container').offsetTop +
  document.getElementById('countdown-clock-container').getBoundingClientRect()
    .height -
  150;

document.addEventListener(
  'scroll',
  throttle(function (ev) {
    if (window.scrollY > countdownBottom) {
      d3.select('#nav-time-container').classed('show', true);
      d3.select('#nav-time-container').classed('hide', false);

      d3.select('.deaths-icon-section').classed('color-nav', false);
      d3.select('.deaths-icon-section').classed('color-lightGray', true);
    } else {
      d3.select('#nav-time-container').classed('show', false);
      d3.select('#nav-time-container').classed('hide', true);

      d3.select('.deaths-icon-section').classed('color-lightGray', false);
      d3.select('.deaths-icon-section').classed('color-nav', true);
    }
  }, 100)
);

function fixMargin(ev, resize = false) {
  var wFull =
    document.getElementsByClassName('deaths-icon-section')[0].offsetWidth *
    0.95;
  wFull = wFull < 300 ? 300 : wFull;
  var all = document.querySelectorAll('#deaths-icon-container div');
  if (all.length === 0) return;
  var single = document.querySelector('#deaths-icon-container div').clientWidth;
  var numPerRow = Math.floor(wFull / single);

  document.getElementById('deaths-icon-container').style.width =
    numPerRow * single + 1 + 'px';
  var deaths = all.length;
  var rowCount = 0;
  var counter = 0;
  // console.log(numPerRow, wFull);
  while (counter < deaths) {
    var m = rowCount * 20 + 'px';
    var l = (rowCount % 2 ? 6.5 : 0) + 'px';
    var numThisRow = rowCount % 2 ? numPerRow - 1 : numPerRow;
    all[counter].style.marginLeft = l;

    for (let i = counter; i < counter + numThisRow && i < deaths; i++) {
      all[i].style.bottom = m;

      if (resize && i !== counter) all[i].style.marginLeft = '0px';
    }
    rowCount++;
    counter += numThisRow;
  }
}

window.addEventListener(
  'resize',
  debounce(function (ev) {
    console.log('resize');
    fixMargin(ev, true);
  }, 100)
);
