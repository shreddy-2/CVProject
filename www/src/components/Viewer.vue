<template>
  <div>
    <video class="hidden" id="camera"></video>
    <canvas class="hidden" id="work-canvas"></canvas>
    <div class="absolute inset-0 bg-blue-400" id="canvas-container">
      <div class="absolute top-0 left-0 h-1/2 w-1/2 border-gray-800">
        <canvas class="object-none object-center bg-gray-100 border-gray-800" id="canvas-in"></canvas>
      </div>
      <div class="absolute top-0 right-0 h-1/2 w-1/2 border-gray-800">
        <canvas class="object-none object-center bg-gray-100 border-gray-800" id="canvas-background"></canvas>
      </div>
      <div class="absolute bottom-0 left-0 h-1/2 w-1/2 border-gray-800">
        <canvas class="object-none object-center bg-gray-100 border-gray-800" id="canvas-foreground"></canvas>
      </div>
      <div class="absolute bottom-0 right-0 h-1/2 w-1/2 border-gray-800">
        <canvas class="object-none object-center bg-gray-100 border-gray-800" id="canvas"></canvas>
      </div>
    </div>
    <div class="absolute top-0 left-0">
        <video id="video-in" src="/assets/videos/video.mp4" loop />
    </div>
    <div class="absolute top-2 right-4">
       <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="playing ? pause() : start()">
         {{ playing ? "Stop" : "Play" }}
      </button>
    </div>
  </div>
</template>

<script>
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { Camera } from "@mediapipe/camera_utils";

class Feed {
  #segmentation;
  #results;

  constructor() {
    this.#segmentation = new SelfieSegmentation({locateFile: (file) => {
          return `/assets/mediapipe/selfie_segmentation/${file}`;
    }});
    this.#segmentation.setOptions({ modelSelection: 1 });
    this.#segmentation.onResults((results) => {this.on_selfie_segmentation_results(results);});
    this.#results = null;
  }

  async handle(video) {
    await this.#segmentation.send({image: video});
  }

  on_selfie_segmentation_results(results) {
    this.#results = results;
  }

  has_results() { return this.#results !== null;}

  get_image() {
    if (this.#results === null) {return null;}
    return this.#results.image;
  }

  get_mask() {
    if (this.#results === null) {return null;}
    return this.#results.segmentationMask;
  }
};

export default {
  name: "Viewer",

  // 
  data: function() {
    return {
      main: null,
      secondary: null,
      camera_obj: null,
      playing: false,
    };
  },

  //
  mounted: function() {
    console.log("Viewer - mounted");
    this.resize_canvas();

    this.main = new Feed();
    this.secondary = new Feed();

    this.camera();
    this.initialize_video();

    window.onresize = () => {this.resize_canvas();};
  },

  methods: {
    /* Video methods */
    initialize_video: function() {
      this.get_video().onplay = () => {this.on_play_video();};
    },

    on_play_video: async function() {
      console.log("Playing video.....");
      const video = this.get_video();
      if (video.paused || video.ended) {return;}
      if (this.playing) {await this.main.handle(video);}
      setTimeout(() => {this.on_play_video();}, 0);
    },

    get_video: function() {
      return document.getElementById("video-in");
    },

    // Handle camera
    get_camera: function() {
      return document.getElementById("camera");
    },

    camera: function() {
      if (this.camera_obj === null) {
        const videoElement = this.get_camera();
        this.camera_obj = new Camera(videoElement, {
          onFrame: async () => { 
            if (this.playing) {
              await this.secondary.handle(this.get_camera());
            }
          },
          width: 600, height: 360
          // width: 1200, height: 720
        });
      }
      return this.camera_obj;
    },

    // Handle animation
    start: function() {
      this.playing = true;
      this.camera().start();
      this.get_video().play();
      window.requestAnimationFrame(() => {this.do_animation();});
    },

    pause: function() {
      this.playing = false;
      // this.camera().stop();
      this.get_video().pause();
    },

    do_animation: function() {
      if (this.playing) {
        console.log("do animation");
        this.do_animation_work();
        window.requestAnimationFrame(() => {this.do_animation();});
      }
    },

    do_animation_work: function() {
      if (this.main.has_results() && this.secondary.has_results()) {
        console.log("Handle main and secondary results");
        var c; var ctx;
        c = this.canvas_in(); ctx = c.getContext('2d');
        ctx.save()
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(this.secondary.get_image(), 0, 0, c.width, c.height);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(this.secondary.get_mask(), 0, 0, c.width, c.height);
        ctx.restore()

        c = this.canvas_background(); ctx = c.getContext('2d');
        ctx.save()
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(this.main.get_image(), 0, 0, c.width, c.height);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(this.main.get_mask(), 0, 0, c.width, c.height);
        ctx.restore()
     
        c = this.canvas_foreground(); ctx = c.getContext('2d');
        ctx.save()
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(this.main.get_image(), 0, 0, c.width, c.height);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(this.main.get_mask(), 0, 0, c.width, c.height);
        ctx.restore()
     
        Promise.all([
          this.get_image_bitmap(this.canvas_background()),
          this.get_image_bitmap(this.canvas_in()),
          this.get_image_bitmap(this.canvas_foreground())
        ]).then((bmpImgs) => {
          c = this.canvas(); ctx = c.getContext('2d');
          ctx.drawImage(bmpImgs[0], 0, 0);
          ctx.drawImage(bmpImgs[1], 0, 0);
          ctx.drawImage(bmpImgs[2], 0, 0);
        });
        
      } else {
        console.log("Main or secondary do not have results");
      }
    },

    get_image_bitmap: function(canvas) {
      var ctx = canvas.getContext('2d');
      var d = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return createImageBitmap(d);
    },

    // Legacy stuff
    get_image_data_deprec: function(imageBitmap) {
      const c = this.work_canvas();
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(imageBitmap, 0, 0, c.width, c.height);
      return ctx.getImageData(0, 0, c.width, c.height);
    },

    on_selfie_segmentation_results: function(results) {
      console.log("on_selfie_segmentation_results"); console.log(results);

      var c; var ctx;

/*
      c = this.canvas_in(); ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(results.image, 0, 0, c.width, c.height);
*/

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
  }
};
</script>

