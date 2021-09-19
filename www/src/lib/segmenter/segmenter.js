/*
 * Segmenter: a Facade to MediaPipe SegmentationSelfie
 */

import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

function get_background_bitmap(canvas, image, mask) {
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return createImageBitmap(data);
}

function get_foreground_bitmap(canvas, image, mask) {
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return createImageBitmap(data);
}

export class Segmentor {
  #selfie_segmentation;
  constructor() {
    this.#selfie_segmentation = new SelfieSegmentation({locateFile: (file) => {return `/assets/mediapipe/selfie_segmentation/${file}`;}});
    this.#selfie_segmentation.setOptions({ modelSelection: 1 });
  }

  async extract(image) {
var res = null;
this.#selfie_segmentation.onResults((r) => {res = r;});
await this.#selfie_segmentation.send({image});
if (res === null) {
throw Error("Unable to perform extraction on the image provided");
}
    return res;
  }
};


export class Segmenter {

  static from_media_stream(media_stream, segmentor = null) {
    const segmenter = new Segmenter(null, segmentor);
    segmenter.video.srcObject = media_stream;
	  segmenter.video.onplay = () => {segmenter.do_work();};
    segmenter.video.load();
    return segmenter;
  }

  static from_url(url, segmentor = null) {
    const segmenter = new Segmenter(null, segmentor);
    let source = document.createElement('source');
    source.setAttribute('src', url);
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
        segmenter.video.crossOrigin = "anonymous";
    }
    segmenter.video.appendChild(source);
    segmenter.video.load();
    return segmenter;
  }

  static from_video(video, segmentor = null) {
    const segmenter = new Segmenter(video, segmentor);
    segmenter.video.load();
    return segmenter;
  }

  #segmentor;
  #video;
  #own_video;
  #running;
	#canvas;

  #on_result_callback;

  constructor(video, segmentor) {
    this.#running = false;
    this.#on_result_callback = null;

    this.#own_video = null;
    this.#video = video;
    if (this.#video === null) {
      // Make own video
	    this.#own_video = document.createElement('video');
	    this.#own_video.style.display = 'none';
	    document.body.appendChild(this.#own_video);
    }
	  this.#canvas = document.createElement('canvas');
	    this.#canvas.style.display = 'none';
	    document.body.appendChild(this.#canvas);

    this.#segmentor = (segmentor !== null ? segmentor : new Segmentor());

  }

  get video() {
    return (this.#video !== null ? this.#video : this.#own_video);
  }

  destroy() {
    if (this.#own_video !== null) { this.#own_video.remove(); }
	  if (this.#canvas !== null) {this.#canvas.remove(); }
  }

  set on_result(callback) {
    this.#on_result_callback = callback;
  }

  start() {
    this.#running = true;
	  this.#canvas.width = this.video.videoWidth;
	  this.#canvas.height = this.video.videoHeight;
	  this.do_work();
    this.video.play();
  }

  result_to_images_promise(r) {
	  return new Promise((resolve, reject) => {
		  get_foreground_bitmap(this.#canvas, r.image, r.segmentationMask)
		  .then((foreground) => {
			  get_background_bitmap(this.#canvas, r.image, r.segmentationMask)
			  .then((background) => {
				  resolve({
					  image: r.image,
					  foreground,
					  background
				  });
			  })
			  .catch(reject);
		  })
		  .catch(reject);
	  });
  }

  do_work() {
    if (this.#running) {
      this.#segmentor.extract(this.video)
	    .then((r) => { 
		    // Do stuff with the result
		    if (this.#on_result_callback !== null) {
			    this.result_to_images_promise(r)
			    .then(this.#on_result_callback)
			    .catch((e) => {console.log(e); throw Error("Unable to extract images from segmentation results");});
		    }
		    setTimeout(() => {this.do_work();}, 0);
	    })
	    .catch((e) => {
		    console.log(e);
		    throw Error("Unable to perform extraction on the image provided...");
	    });
    }
  }

  stop() {
    this.#running = false;
	  this.video.pause();
  }
}

export default {
	Segmenter,
	Segmentor,
};

