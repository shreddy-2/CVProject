import { get_thispersondoesnotexist_image } from "@/lib/segmenter/thispersondoesnotexist.js";

import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import * as tf from "@tensorflow/tfjs-core";
import * as bodyPix from "@tensorflow-models/body-pix";
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';

export function makeSelfieSegModel() {
  return new Promise((resolve, reject) => {
      const use_selfie = true;
      const use_bodypix = false;
      var segmentor = new SegModel(use_selfie, use_bodypix);
      segmentor.send( get_thispersondoesnotexist_image() )
      .then(() => { resolve(segmentor); })
      .catch(reject);
  });
}

export function makeBodypixSegModel() {
  return new Promise((resolve, reject) => {
      const use_selfie = false;
      const use_bodypix = true;
      var segmentor = new SegModel(use_selfie, use_bodypix);
      segmentor.send( get_thispersondoesnotexist_image() )
      .then(() => { resolve(segmentor); })
      .catch(reject);
  });
}

export class SegModel {
  #use_selfie;
  #model;
  #selfie_error;
  #use_bodypix;
  #bodypix_error;
  #mask;

  constructor(use_selfie = true, use_bodypix = true) {
    this.#use_selfie = use_selfie;
    this.#use_bodypix = use_bodypix;

    this.#model = null;

    this.#selfie_error = "";
    this.#bodypix_error = "";

    this.#mask = null;
  }

  get model() {
    if (this.#use_selfie) {
      return "Selfie";
    } else if (this.#use_bodypix) {
      return "bodypix";
    } else {
      return "none";
    }
  }

  get mask() { 
    if (this.#mask === null) {this.#mask = document.createElement("canvas");}
    return this.#mask;
  }

  async send(image) {
    if (this.#use_selfie) {
      try {
        if (this.#model === null) { 
          this.#model = new SelfieSegmentation({locateFile: (file) => {return `/assets/mediapipe/selfie_segmentation/${file}`;}}); 
          this.#model.setOptions({ modelSelection: 1 });
        }

        var results = null;
        this.#model.onResults((r) => { results = {image: r.image, segmentationMask: r.segmentationMask};});
        await this.#model.send({image});
        return results;

      } catch (e) {
        this.#selfie_error = e;
        this.#use_selfie = false;
        this.#model = null;
        throw e;
      }

    } else if (this.#use_bodypix) {
      try {
        if (this.#model === null) {
          await tf.ready();
          this.#model = await bodyPix.load({ 
            architecture: 'MobileNetV1', 
            outputStride: 16, 
            multiplier: 0.5, 
            quantBytes: 2
          });
        }
        const result = await this.#model.segmentPerson(image);
        { // Convert array to canvas
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
          const c = this.mask;
          c.width = w; c.height = h;
          const ctx = c.getContext('2d');
          ctx.clearRect(0, 0, c.width, c.height);
          ctx.putImageData(imageData, 0, 0);
        }
        return {image, segmentationMask: this.mask};
  
      } catch (e) {
        this.#bodypix_error = e;
        this.#use_bodypix = false;
        this.#model = null;
        throw e;
      }

    } else {
      console.log("selfie_error: ", this.#selfie_error);
      console.log("bodypix_error: ", this.#bodypix_error);
      throw new Error("Unable to process image. selfie_error " + this.#selfie_error.toString() + ", bodypix error: " + this.#bodypix_error.toString());
    }
  }
}


