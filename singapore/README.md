Javascript I wrote for the webgl animations in this story: https://tmsnrt.rs/2WV3adi

They work based off of a [d3 force simulation](https://github.com/d3/d3-force)

Since I had ~5000 points and running the force simulation in the browser is very heavy beyond ~500 points, I ran the simluations and stored the position of the dots after each "tick" of the simulation in a json. Then I created a webgl animation based on the x y coordinates of the dots.

The json had xy locations for each day:

```
    [
      {
        "date": "28 june 2020",
        "positions": [[x1, y1], [x2, y2]...]

      },
      {
        "date": "29 june 2020",
        "positions": [[x1, y1], [x2, y2]...]
      },
      ...
    ]
```

I gzipped the json and used [pako](https://github.com/nodeca/pako) on the front end to decompress it

What the files do:

## data-worker.js

Sets up a web worker to work on a separate thread and read the x y position of the dots from the json and returns the current xy position and the destination xy position of the dots as "tweenPositions". The front-end takes these positions and animates the dots using them.

Used a web worker because didn't want the main animationo thread to wait for the xy positions to be calculated. Since web worker threads are usually faster, they can just keep churning out xy positions to be used later by the front-end.

## cluster-webgl.js

Sets up the web worker and keeps it running. When it receives data from web worker, it checks if it needs to render it immediately. If not, saves it, otherwise renders it.

Sets up the main webgl animation. I used [regl](https://github.com/regl-project/regl) for this since it was the only library that seemed learn-able in one night :) (Like a true engineer, I rewrote this from canvas to webgl a day before publish)

It also renders various annotations based on the day and timestamp it's currently rendering.

Most of the rendering work happens in the _makeShader_ function.

exports various functions that are used by the main animation controller. Since there are two animations running (this is code for just one of those), we need to keep track of which animation is on the page. And pause the animation when it goes off the screen.

- isReadyOrDone: returns if the animation is ready to be run (the first few days have been processed by the web worker) or it's already complete.
- isRunning: returns if it's currently running.
- startAnimation: function to start the animation.

the pausing/playing is done by the main controller usiing a _window.activeAnimation_ property. The animation checks before the next tick if the _window.activeAnimation_ property matches it's own id.
