export const DEFAULT_FRAMERATE = 24;

export function captureStream(videoEl, streamOptions) {
  const cvResult = createVideoCanvas(videoEl, streamOptions);
  const framerate = streamOptions.framerate || DEFAULT_FRAMERATE;

  const v_stream = cvResult.canvas.captureStream(framerate);
  const a_stream = getAudioStream(videoEl);

  const a_track = a_stream.getAudioTracks()[0];
  if (a_track) {
    v_stream.addTrack(a_track);
  }
  // Optimization methods but also provides feature to pause the video frame.
  // It's necessary to call stopVideo when finished to clean up or it will
  //   otherwise continue rendering (to canvas) in the bg and prevent gc.
  v_stream.startVideo = cvResult.startUpdating;
  v_stream.stopVideo = cvResult.stopUpdating;

  return v_stream;
}

export function createVideoCanvas(videoEl, options = {}) {
  const width = options.width || videoEl.videoWidth;
  const height = options.height || videoEl.videoHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const framerate = options.framerate || DEFAULT_FRAMERATE;

  function update() {
    ctx.drawImage(videoEl, 0, 0, width, height);
  }

  let stopId;
  function stopUpdating() {
    clearInterval(stopId);
  }
  function startUpdating() {
    stopId = setInterval(update, 1000 / framerate);
  }

  // Start automatically
  startUpdating();

  return { videoEl, canvas, stopUpdating, startUpdating };
}

// Audio streams need to be cached because createMediaElementSource() can only be called once per videoEl
const audioStreamRefs = new WeakMap();

// Issue/downside that volume depends on video element
export function getAudioStream(videoEl) {
  let stream = audioStreamRefs.get(videoEl);
  if (stream) return stream.clone();

  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaElementSource(videoEl);
  const destination = audioCtx.createMediaStreamDestination();

  // Pipe video sounds to stream
  source.connect(destination);

  // Reconnect to audio output (so client hears sound)
  source.connect(audioCtx.destination);

  stream = destination.stream;
  audioStreamRefs.set(videoEl, stream);
  return stream.clone();
}
