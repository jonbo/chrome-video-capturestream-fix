import { captureStream } from "./captureStream";

export function polyfill() {
  HTMLVideoElement.prototype.captureStream = function(streamOptions = {}) {
    return captureStream(this, streamOptions);
  };
}
