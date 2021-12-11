export function makeWebcam(options) {
  return new Promise((resolve, reject) => {
    if (! navigator.mediaDevices) {return reject("webcam: navigator mediaDevices is not supported!");}
    navigator.mediaDevices.getUserMedia(options)
    .then(resolve)
    .catch(reject);
  });
}

/*
 * Retrieve width and height to fit into a target {width: xyz, height: xyz}
 * input:
 *   - origin: object container width/height as {width: xyz, height: xyz}
 *   - target: object containing container with/height as {width: xyz, height: xyz}
 * Output:
 *    {width: abc, height: abc}
 */
export function fit(origin, target) {
  if ((Math.abs(target.width) < 1e-3) || (Math.abs(target.height) < 1e-3)) { return {width: 0, height: 0}; }

  const w = origin.width; const h = origin.height; const ar = w / h;
  const ar_t = target.width / target.height;
  var height = null; var width = null;
  if (ar < ar_t) {
    height = target.height; width = w / h * target.height;
  } else {
    height = h / w * target.width; width = target.width;
  }

  const margin_top  = (height < target.height) ? Math.floor(0.5 * (target.height - height)) : 0;
  const margin_left = (width < target.width) ? Math.floor(0.5 * (target.width - width)) : 0;

  return {height, width, margin_top, margin_left};
}
