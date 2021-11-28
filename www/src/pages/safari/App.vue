<template>
  <div id="app">
    <div class="absolute top-0 bottom-0 left-0 right-0 bg-blue-400">
      <div class="absolute top-0 left-0 right-0 bottom-0 border-gray-800">
        <div class="absolute top-1 left-1 text-gray-200" v-html="message"></div>
        <!-- video class="absolute top-1 right-1 h-1/2 w-1/2" id="video"></video -->
        <canvas
          class="object-none object-center bg-gray-100 border-gray-800"
          id="canvas-in"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script>
// import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import * as tf from "@tensorflow/tfjs-core";
import * as bodyPix from "@tensorflow-models/body-pix";
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
// const bodyPix = require('@tensorflow-models/body-pix');

export default {
  name: "App",
  components: {
  },
  data: function () {
    return {
      count: 0,
      message: null,
      webcam_video: null,
      segmentation: null,
      segmentation_ready: false,
      result: {
        image: null,
        segmentationMask: null
      }
    };
  },
  mounted: function () {
    try {
    this.segmentation = null;
    this.segmentation_ready = false;
    this.resize();
    window.onresize = () => { this.resize(); };
    this.init();
    } catch (e) {
      this.on_error("Error in mounted", e);
    }
  },
  computed: {
  },
  methods: {
    /*
     * Initialize Selfie Segmentation
     */
    init_segmentation: async function () {
      try {
        await tf.ready();
        this.segmentation = await bodyPix.load({
           architecture: 'MobileNetV1',
           outputStride: 16,
           multiplier: 0.5,
           quantBytes: 2
         });
        // .then((m) => {
           // this.segmentation = m; 
           this.segmentation_ready = true;
        // })
        // .catch((e) => {this.on_error("Error in BodyPix.load", e);});
      } catch (e) {
        this.on_error("Error in init_segmentation", e);
      }
    },

    on_results: function(results) {
      this.count += 1;
      this.message = "Handling results " + this.count + "<br/>";
      for (var o in results) { this.message += o + "<br/>"; }
      const c = this.canvas();
      const ctx = c.getContext('2d');
      ctx.save();
      ctx.drawImage(results.image, 0, 0, c.width, c.height);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(results.segmentationMask, 0, 0, c.width, c.height);
      ctx.restore();
    },

    init: function() {
      try {
        this.init_segmentation();
        this.message = "Ok...";

	if (! navigator.mediaDevices) {throw new Error("webcam::load navigator.mediaDevices is not supported!");}

      // Request webcam with audio and user facing camera
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" } })
        .then((media_stream) => {
          this.message = "Does it shows up as onplay?";
          // Assign media stream to video element - with audio muted
          this.webcam_video = document.createElement("video");
          this.webcam_video.setAttribute('playsinline', '');
          this.webcam_video.setAttribute('autoplay', '');
          this.webcam_video.srcObject = media_stream;
          this.webcam_video.muted = true;
          this.webcam_video.style.display = "none";
          // document.body.appendChild(this.webcam_video);

          // this.webcam_video.onplay = this.playing;
          this.webcam_video.onloadeddata = this.playing;

          // And start playing
          this.webcam_video.play();
        })
        .catch((e) => {
          this.on_error("Unable to start webcam", e);
        });

      } catch (e) {
        this.on_error("Error in init", e);
      }
    },
    playing: async function() {
      try {
/*
        this.count += 1;
        this.message = "Count " + this.count;
        let c = this.canvas();
        let ctx = c.getContext('2d');
        ctx.drawImage(this.webcam_video, 0, 0, c.width, c.height);
*/
        if (this.segmentation_ready) {
          // this.message = "Selfie ready";
          if (this.result.image === null) {
            let c = document.createElement("canvas");
            c.width = this.webcam_video.videoWidth;
            c.height = this.webcam_video.videoHeight;
            this.result.image = c;
          }
          {
            const c = this.result.image;
            const w = c.width; const h = c.height;
            const ctx = c.getContext('2d');
            ctx.drawImage(this.webcam_video, 0, 0, w, h);
          }
          const result = await this.segmentation.segmentPerson(this.result.image);
          if (this.result.segmentationMask === null) {
            let c = document.createElement("canvas");
            c.width = result.width;
            c.height = result.height;
            this.result.segmentationMask = c;
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
            // ctx.clearRect(0, 0, c.width, c.height);
            const ctx = this.result.segmentationMask.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
          }

          this.on_results(this.result);
        } else {
          this.message = "Selfie NOT ready";
        }

        window.requestAnimationFrame(this.playing);
      } catch(e) {
        this.on_error("Error in playing", e);
      }
    },
    canvas: function() {
      return document.getElementById("canvas-in");
    },
    resize: function() {
      try {
         let c = this.canvas();
         c.width = c.parentNode.clientWidth;
         c.height = c.parentNode.clientHeight;
      } catch (e) {
console.log(e);
        this.on_error("Error in resize", e);
      }
    },

    on_error: function(msg, e) {
console.log(msg); console.log(e);
      this.message = msg + " -- " + (e.stack ? e.stack : e.toString());
throw new Error("STOP");
    }
  },
};
</script>
