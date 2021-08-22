<template>
  <div>
    <video class="hidden" id="camera"></video>
    <canvas class="hidden" id="work-canvas"></canvas>
    <div class="absolute inset-0 bg-blue-400" id="canvas-container">
      <div class="absolute top-0 left-0 h-1/2 w-1/2 border-gray-800"><canvas class="object-none object-center bg-gray-100 border-gray-800" id="canvas-in"></canvas></div>
      <div class="absolute top-0 right-0 h-1/2 w-1/2 border-gray-800"><canvas class="object-none object-center bg-gray-100 border-gray-800" id="canvas-background"></canvas></div>
      <div class="absolute bottom-0 left-0 h-1/2 w-1/2 border-gray-800"><canvas class="object-none object-center bg-gray-100 border-gray-800" id="canvas-foreground"></canvas></div>
      <div class="absolute bottom-0 right-0 h-1/2 w-1/2 border-gray-800"><canvas class="object-none object-center bg-gray-100 border-gray-800" id="canvas"></canvas></div>
    </div>
  </div>
</template>

<script>
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { Camera } from "@mediapipe/camera_utils";


export default {
  name: "Viewer",

  // 
  data: function() {
    return {
      selfieSegmentation: null,
      camera: null,
      do_selfie: true,
    };
  },

  //
  mounted: function() {
    console.log("Viewer - mounted");
    this.resize_canvas();
    this.get_selfie_segmentation();
    this.get_camera().start();
    window.onresize = () => {this.resize_canvas();};
  },

  methods: {
    get_camera: function() {
      if (this.camera === null) {
        const videoElement = document.getElementById("camera");
        this.camera = new Camera(videoElement, {
          onFrame: async () => { 
            if (this.do_selfie) {
              await this.get_selfie_segmentation().send({image: document.getElementById("camera")}); 
              // this.do_selfie = false;
            }
          },
          width: 600, height: 360
          // width: 1200, height: 720
        });
      }
      return this.camera;
    },

    get_selfie_segmentation: function() {
      if (this.selfieSegmentation === null) {
        this.selfieSegmentation = new SelfieSegmentation({locateFile: (file) => {
          return `/assets/mediapipe/selfie_segmentation/${file}`;
        }});
        this.selfieSegmentation.setOptions({ modelSelection: 1 });
        this.selfieSegmentation.onResults(function(results) {console.log("onResults"); this.on_selfie_segmentation_results(results);}.bind(this));
      }
      console.log("get_selfie_segmentation", this.selfieSegmentation);
      return this.selfieSegmentation;
    },

    
    get_image_data: function(imageBitmap) {
      const c = this.work_canvas();
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(imageBitmap, 0, 0, c.width, c.height);
      return ctx.getImageData(0, 0, c.width, c.height);
    },

    on_selfie_segmentation_results: function(results) {
      console.log("on_selfie_segmentation_results"); console.log(results);

      var c; var ctx;

      c = this.canvas_in(); ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(results.image, 0, 0, c.width, c.height);

      c = this.canvas_background(); ctx = c.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(results.image, 0, 0, c.width, c.height);
      ctx.globalCompositeOperation = 'destination-out'
      ctx.drawImage(results.segmentationMask, 0, 0, c.width, c.height);
      ctx.restore();

      c = this.canvas_foreground(); ctx = c.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(results.image, 0, 0, c.width, c.height);
      ctx.globalCompositeOperation = 'destination-in'
      ctx.drawImage(results.segmentationMask, 0, 0, c.width, c.height);
      ctx.restore();

      c = this.canvas(); ctx = c.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(results.segmentationMask, 0, 0, c.width, c.height);
      ctx.restore();

/*
      const canvasElement = this.canvas();
      const canvasCtx = this.canvas().getContext('2d');
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      // canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
      const mask = this.get_image_data(results.segmentationMask);
      canvasCtx.putImageData(mask, 0, 0);

      canvasCtx.globalCompositeOperation = 'source-in';
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      // Only overwrite existing pixels.
      canvasCtx.globalCompositeOperation = 'source-in';
      canvasCtx.fillStyle = '#00FF00';
      canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

      // Only overwrite missing pixels.
      canvasCtx.globalCompositeOperation = 'destination-atop';
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      canvasCtx.restore();
*/
    },

    resize_canvas: function() {
      console.log("resize_canvas");
      [this.canvas(), this.canvas_in(), this.canvas_background(), this.canvas_foreground()].forEach(c => {
        c.width = c.parentNode.clientWidth;
        c.height = c.parentNode.clientHeight;
      });
    },
    canvas: function() {
      return document.getElementById("canvas");
    },
    canvas_in: function() {
      return document.getElementById("canvas-in");
    },
    canvas_background: function() {
      return document.getElementById("canvas-background");
    },
    canvas_foreground: function() {
      return document.getElementById("canvas-foreground");
    },
    work_canvas: function() {
      return document.getElementById("work-canvas");
    },
    test: function() {
    }
  }
};
</script>

