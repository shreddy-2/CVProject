/*
 * Segmenter: a Facade to MediaPipe SegmentationSelfie
 */

import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { get_thispersondoesnotexist_image } from "./thispersondoesnotexist.js";
import * as tf from "@tensorflow/tfjs-core";
import * as bodyPix from "@tensorflow-models/body-pix";
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';

function get_background(canvas, image, mask) {
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

function get_foreground(canvas, image, mask) {
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

class SegModel {
	#on_results;
	#use_selfie;
	#selfie_model;
	#selfie_error;
	#use_bodypix;
	#bodypix_model;
	#bodypix_error;
	#mask;


	constructor() {
		this.#on_results = null;
		this.#use_selfie = false;
		this.#selfie_model = null;
		this.#selfie_error = "";
		this.#use_bodypix = true;
		this.#bodypix_model = null
		this.#bodypix_error = "";
		this.#mask = null;
	}

	onResults(f) {
		this.#on_results = f;
	}

	async send(image) {
		if (this.#use_selfie) {
			try {
				if (this.#selfie_model === null) { 
					this.#selfie_model = new SelfieSegmentation({locateFile: (file) => {return `/assets/mediapipe/selfie_segmentation/${file}`;}}); 
					this.#selfie_model.setOptions({ modelSelection: 1 });
				}
				this.#selfie_model.onResults(this.#on_results);
				await this.#selfie_model.send({image});
			} catch (e) {
				this.#selfie_error = e;
				this.#use_selfie = false;
				this.#selfie_model = null;
				return this.send(image);
			}
		} else if (this.#use_bodypix) {
			try {
				if (this.#bodypix_model === null) {
					await tf.ready();
					this.#bodypix_model = await bodyPix.load({ 
						architecture: 'MobileNetV1', 
						outputStride: 16, 
						multiplier: 0.5, 
						quantBytes: 2
					});
				}
				const result = await this.#bodypix_model.segmentPerson(image);
          if (this.#mask === null) {
            this.#mask = document.createElement("canvas");
          }
          {
            const w = result.width;
            const h = result.height;
            const arr = new Uint8ClampedArray(4 * w * h);
            for (let i = 0; i < w * h; i+=1) {
              arr[4*i+0] = 255; // R value
              arr[4*i+1] = 0; // G value
              arr[4*i+2] = 0; // B value
              arr[4*i+3] = 255*result.data[i]; // Alpha value
           }
            const imageData = new ImageData(arr, w, h);
	    const c = this.#mask;
		  c.width = w; c.height = h;
            const ctx = c.getContext('2d');
            ctx.clearRect(0, 0, w, h);
            ctx.putImageData(imageData, 0, 0);
          }

          this.#on_results({image, segmentationMask: this.#mask});

			} catch (e) {
				this.bodypix_error = e;
				this.#use_bodypix = false;
				this.#bodypix_model = null;
				return this.send(image);
			}
		} else {
			console.log("selfie_error: ", this.selfie_error);
			console.log("bodypix_error: ", this.bodypix_error);
			throw new Error("Unable to process image. selfie_error " + this.selfie_error.toString() + ", bodypix error: " + this.bodypix_error.toString());
		}
	}
}

class Segmentor {
        #segmentation;
	#processing;
	#keys;
	#store;

        constructor() {
		this.#segmentation = new SegModel();
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

		  try {
		    delete this.#store[key];

                    var res = null;
                    this.#segmentation.onResults((r) => {res = r;});
                    await this.#segmentation.send(data.image);
                    if (res === null) {
                      data.onerror("Unable to perform extraction on the image provided");
                    } else {
                      data.onimages(res);
                    }
		  } catch (e) {
			  data.onerror("Unable to perform extraction. Error: " + e.toString());
		  }
		}
                if (this.#keys.length > 0) { 
			this.process(); 
		} else {
			this.#processing = false;
		}
	}

	/*
        async extract(image) {
          var res = null;
          this.#selfie_segmentation.onResults((r) => {res = r;});
          await this.#selfie_segmentation.send({image});
          if (res === null) { throw Error("Unable to perform extraction on the image provided"); }
          return res;
        }
	*/
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
		    const foreground = get_foreground(this.#canvas_foreground, r.image, r.segmentationMask);
		    const background = get_background(this.#canvas_background, r.image, r.segmentationMask);
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

