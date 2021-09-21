/*
 * Segmenter: a Facade to MediaPipe SegmentationSelfie
 */

import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { Video } from "./video";

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

class Segmentor {
  #selfie_segmentation;
	#processing;
	#keys;
	#store;

  constructor() {
    this.#selfie_segmentation = new SelfieSegmentation({locateFile: (file) => {return `/assets/mediapipe/selfie_segmentation/${file}`;}});
    this.#selfie_segmentation.setOptions({ modelSelection: 1 });
	  this.#processing = false;
	  this.#store = {};
	  this.#keys = [];
  }

	push(key, image, onimages, onerror) {
		if (! (key in this.#store)) {
			this.#keys.push(key);
		}
		this.#store[key] = {image, onimages, onerror};
		if (! this.#processing) {this.process();}
	}

	async process() {
		this.#processing = true;
		const key = this.#keys.shift();
		if (key in this.#store) {
		  const data = this.#store[key];

		  delete this.#store[key];

                  var res = null;
                  this.#selfie_segmentation.onResults((r) => {res = r;});
                  await this.#selfie_segmentation.send({image: data.image});
                  if (res === null) {
                    data.onerror("Unable to perform extraction on the image provided");
                  } else {
                    data.onimages(res);
                  }
		}
                if (this.#keys.length > 0) { 
			this.process(); 
		} else {
			this.#processing = false;
		}
	}

  async extract(image) {
	  console.log("Segmentor:extract", image);
var res = null;
	  console.log("Segmentor:extract (2)", res);
this.#selfie_segmentation.onResults((r) => {res = r;});
await this.#selfie_segmentation.send({image});
	  console.log("Segmentor:extract (3)", res);
if (res === null) {
throw Error("Unable to perform extraction on the image provided");
}
	  console.log("Segmentor:extract (4)", res);
    return res;
  }
};


export class Segmenter {

	/*
  static from_media_stream(media_stream, segmentor = null) {
    const segmenter = new Segmenter(null, segmentor);
    segmenter.video.srcObject = media_stream;
	  segmenter.video.onplay = () => {segmenter.do_work();};
    segmenter.video.load();
    return segmenter;
  }
  */


	static from_media(media) {
		const segmenter = new Segmenter(media);
		return segmenter;
	}

	/*
  static from_url(url, segmentor = null) {
	  let video = document.createElement('video');
	  video.style.display = 'none';
	  document.body.appendChild(video);

    let source = document.createElement('source');
    source.setAttribute('src', url);
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
        video.crossOrigin = "anonymous";
    }
    video.appendChild(source);

    return Segmenter.from_video(new Video(video), segmentor);
  }
  */

  static from_video(video) {
    const segmenter = new Segmenter(new Video(video));
    // segmenter.load();
    return segmenter;
  }

	static #key = 0;
	static get_key() {
		Segmenter.#key += 1;
		return Segmenter.#key;
	}


  static #segmentor = null;

	#myKey;
  #media;
	#canvas;

  #on_images;
	#onerror;

  constructor(media) {
	  this.#myKey = Segmenter.get_key();
    this.#on_images = null;
	  this.#onerror = (e) => {console.log(e); throw Error("Error in Segmenter");};

    this.#media = media;
	  this.#media.onimage = (image) => {this.handle_image(image); }

	  this.#canvas = document.createElement('canvas');
	    this.#canvas.style.display = 'none';
	    document.body.appendChild(this.#canvas);
  }

  destroy() {
	  this.#media.destroy();
	  this.#canvas.remove();
  }

	get segmentor() {
		if (Segmenter.#segmentor === null) {
			Segmenter.#segmentor = new Segmentor();
		}
		return Segmenter.#segmentor;
	}

  set on_result(f) { this.#on_images = f; }
  set on_images(f) { this.#on_images = f; }
	set onerror(f) { 
		this.#onerror = f; 
		this.#media.onerror = f;
	}

	load() {
		return this.#media.load();
	}

  start() {
	  this.#canvas.width = this.#media.width;
	  this.#canvas.height = this.#media.height;
    this.#media.start();
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


  handle_image(image) {
	  this.segmentor.push(this.#myKey, 
		  image,
		  (r) => {
			  if (this.#on_images !== null) {
				  this.result_to_images_promise(r).then(this.#on_images).catch(this.#onerror);
			  }
		  },
		  (err) => {this.#onerror(err);}
	  );
	  /*
      this.segmentor.extract(image)
	    .then((r) => { 
		    // Do stuff with the result
		    if (this.#on_images!== null) {
			    this.result_to_images_promise(r)
			    .then(this.#on_images)
			    .catch(this.#onerror);
		    }
	    })
	    .catch(this.#onerror);
	    */
  }

  stop() {
	  this.#media.stop();
  }
}

export default {
	Segmenter,
	Segmentor,
};

