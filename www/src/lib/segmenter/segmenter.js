/*
 * Segmenter: a Facade to MediaPipe SegmentationSelfie
 */

import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { get_thispersondoesnotexist_image } from "./thispersondoesnotexist.js";

function get_background_bitmap(canvas, image, mask) {
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      // const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // return createImageBitmap(data);
      return canvas;
}

function get_foreground_bitmap(canvas, image, mask) {
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      // const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // return createImageBitmap(data);
      return canvas;
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
          var res = null;
          this.#selfie_segmentation.onResults((r) => {res = r;});
          await this.#selfie_segmentation.send({image});
          if (res === null) { throw Error("Unable to perform extraction on the image provided"); }
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


	/*
	static from_media(media) {
		const segmenter = new Segmenter(media);
		return segmenter;
	}
	*/

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

	/*
  static from_video(video) {
    const segmenter = new Segmenter(new Video(video));
    // segmenter.load();
    return segmenter;
  }
  */

	static #key = 0;
	static get_key() {
		Segmenter.#key += 1;
		return Segmenter.#key;
	}


        static #segmentor = null;

	#myKey;
        #media;
	#canvas_background;
	#canvas_foreground;

        #onimage;
	#onerror;

        constructor(media) {
	  this.#myKey = Segmenter.get_key();
          this.#onimage = null;
	  this.#onerror = (e) => {console.log(e); throw Error("Error in Segmenter");};

          this.#media = media;
	  this.#media.onimage = (r) => {this.handle_image(r.image); }

	  this.#canvas_foreground = document.createElement('canvas');
	  this.#canvas_foreground.style.display = 'none';
	  document.body.appendChild(this.#canvas_foreground);

	  this.#canvas_background = document.createElement('canvas');
	  this.#canvas_background.style.display = 'none';
	  document.body.appendChild(this.#canvas_background);
        }

        destroy() {
	  this.#media.destroy();
	  this.#canvas_background.remove();
	  this.#canvas_foreground.remove();
        }

	get media()      { return this.#media; }
	get width()      { return this.#media.width; }
	get height()     { return this.#media.height; }
	set oncanplay(f) { this.#media.oncanplay = f; }
        set onimage(f)   { this.#onimage = f; }
	set onerror(f) { 
		this.#onerror = f; 
		this.#media.onerror = (e) => {this.#onerror({from: "segmenter.#media.onerror", err: e});};
	}

	#media_loaded;
	#segmentor_loaded;
	#segmentor_load_error;


	load() { 
		this.#media_loaded = false;
		this.#segmentor_loaded = false;
		return new Promise((resolve, reject) => {
			let image = get_thispersondoesnotexist_image();
			this.segmentor.push(this.#myKey,
				image,
				() => { this.#segmentor_loaded = true; if (this.loaded()) {resolve();}; },
				(e) => { this.#segmentor_loaded = false; reject(e); }
			);
		        this.#media.load()
			.then(() => { this.#media_loaded = true; if (this.loaded()) {resolve();}; })
			.catch((e) => { this.#media_loaded = false; reject(e); });
		});
	}

	loaded() { return this.#segmentor_loaded && this.#media_loaded; }

        start() {
	  this.#canvas_background.width = this.#media.width;
	  this.#canvas_background.height = this.#media.height;
	  this.#canvas_foreground.width = this.#media.width;
	  this.#canvas_foreground.height = this.#media.height;
          this.#media.start();
        }

        stop() {
	  this.#media.stop();
        }

	//
	get segmentor() {
		if (Segmenter.#segmentor === null) { Segmenter.#segmentor = new Segmentor(); }
		return Segmenter.#segmentor;
	}

        handle_image(image) {
	  this.segmentor.push(this.#myKey, 
		  image,
		  (r) => {
			  if (this.#onimage !== null) {
				  this.result_to_images_promise(r).then(this.#onimage).catch((e) => {this.#onerror({from: "segmenter.handle_image.result_to_images_promise", err: e});});
			  }
		  },
		  (err) => {this.#onerror({from: "segmenter.handle_image.segmentor.push", err: err});}
	  );
        }

        result_to_images_promise(r) {
	  return new Promise((resolve, reject) => {
		  try {
		    const foreground = get_foreground_bitmap(this.#canvas_foreground, r.image, r.segmentationMask);
		    const background = get_background_bitmap(this.#canvas_background, r.image, r.segmentationMask);
		    resolve({ image: r.image, foreground, background });
		  } catch(e) {
			  reject(e);
		  }
	  });
        }
}

export default {
	Segmenter,
	Segmentor,
};

