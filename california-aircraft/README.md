Code I wrote for the top map aircraft animation this story: https://tmsnrt.rs/2GAfhqb

What the files do:

## boundary.json

Has the boundaries for the region we were interested in. Started off as a whole world file that we clipped to the California coast.

## timeLatLongData.json

Contains the tixestamped lat long data for all firefighting aircraft flights over the region on the map from flightradar24.com

## animation.js

One liner: goes through 15 seconds of real time every 20 milliseconds and draws the line paths based on that. How:

- Set up a map using d3 with a rotated projectiono so that California's coast is horizontal. (It's not rotated on the phone)
- all the below length and x, y calculations done using the d3 projection above.
- For a particular time, figure out how many planes were in the air
- For each of those planes, figure out where it was in it's trajectory. This happens [here](https://github.com/manas271196/js-examples/blob/main/california-aircraft/animation.js#L311-L353) in the code. How it works:
  - Since the data from flightradar24.com/ come in lat, long locations, figure out the last lat long that was reported before current timestemp. Let's call that <x1, y1> Let's say you're on 12:10 pm and the last segment for Flight A123 was reported on 12:09 pm and the next was 12:11pm. Lets say the next one was <x2, y2>
  - For the time gap you have between 12:09 pm and your current time (12:10 pm), find the lat long at 12:10 **IF** the plane would be flying at constant speed in a straight lin from <x1, y1> to <x2, y2>.
  - Now once you have the final lat long, calculate the total length of all the path "segments" till the 12:09 pm location and add the remainder length calculated above.
  - Set the "stroke-dashoffset" which is animated using css on that svg path.
