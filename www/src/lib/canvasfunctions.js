import { fit } from "@/lib/utils.js";

export function drawVideo(video, canvas, flip_horizontal) {
  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  var ctx = canvas.getContext('2d');
  if (flip_horizontal) {
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  } else {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

export function copyCanvas(origin, destination) {
  destination.width = origin.width; destination.height = origin.height;
  var ctx = destination.getContext('2d');
  ctx.clearRect(0, 0, destination.width, destination.height);
  ctx.drawImage(origin, 0, 0, destination.width, destination.height);
  return destination;
}

export function resizeCanvasToFit(canvas, dimensions) {
  const p = canvas.parentNode;
  const f = fit({width: dimensions.width, height: dimensions.height}, {width: p.clientWidth, height: p.clientHeight});
  canvas.style.marginTop = `${f.margin_top}px`
  canvas.width = f.width;
  canvas.height = f.height;
  return canvas;
}
