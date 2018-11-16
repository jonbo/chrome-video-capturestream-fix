## Polyfill fix

Fixes possible crashes caused by calling captureStream on a HTMLVideoElement with its src being a MediaSource in chrome.

- https://bugs.chromium.org/p/chromium/issues/detail?id=820489

Usage example:

```js
import { polyfill } from "chrome-video-capturestream-fix";

polyfill();

let videoEl = document.querySelector("video");

// Can pass an additional argument to video.captureStream()
let streamOptions = {
  // video will stretch to fit 'width' and 'height' of stream
  width: 1920,
  height: 1080,
  framerate: 24,
};

// No longer will possibly crash tab
let stream = videoEl.captureStream(streamOptions);

// When finished and cleaning up
stream.stopVideo();
```

Differences:

- The resolution is locked to whatever the resolution the video was when it started.
- Framerate isn't automatically detected (defaults to 24FPS) but can be set by the first argument in captureStream(_streamOptions_).
- The captured volume matches that of the video element (rather than full volume)
- Doesn't randomly crash in Chrome ;)

## Non-polyfilled lib function

Provides alternative to HTMLMediaElement(/HTMLVideoElement).captureStream.

Usage example:

```js
import { captureStream } from "chrome-video-capturestream-fix";

let videoEl = document.querySelector("video");
let streamOptions = {
  width: 1920,
  height: 1080,
  framerate: 24,
};

let stream = captureStream(videoEl, streamOptions);

// When finished and cleaning up
stream.stopVideo();
```

## Script tag example

page.html

```html
<script src="dist/videoCaptureStreamFix.umd.min.js"></script>
```

code.js

```js
VideoCaptureStreamFix.polyfill();

let video = document.querySelector("video");
let stream = video.captureStream();
```
