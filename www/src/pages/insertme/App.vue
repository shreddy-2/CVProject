<template>
  <div id="app">
    <Navbar></Navbar>
    <div class="absolute top-16 bottom-0 left-0 right-0">
      <div class="mb-12" v-if="(! video_ready) && (! has_error)">
        <VideoSelection @error="on_error($event)"
                        @video-url="set_video($event)">
        </VideoSelection>
      </div>

      <div v-if="is_ready() && (! has_error)">
        <div class="relative max-w-3xl mx-auto pt-12 lg:pt-24 text-center">
          <h2 class="text-lg leading-8 font-bold tracking-tight text-gray-900 sm:text-xl">
            Video playing
          </h2>
        </div>
      </div>

      <div class="mb-12" v-if="! is_ready() && video_ready">
        <Processing></Processing>
      </div>

      <div class="absolute inset-0 bg-gray-800"
           :class="{'hidden': (! is_ready()) || has_error }">
        <canvas class="object-none mx-auto my-auto bg-gray-500" id="canvas-renderer"></canvas>
      </div>

      <div class="absolute top-0.5 right-0.5 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
           :class="{'hidden': (! is_ready()) || has_error }">
        <video controls id="video-feed"></video>
      </div>
  
      <div class="mb-12" v-if="has_error">
        <Error :error="error" :error_message="error_message"></Error>
      </div>

      <BespokeFooter></BespokeFooter>
    </div>

    <!-- hidden elements -->
    <div class="hidden">
      <img src="/assets/images/thispersondoesnotexist.jfif" id="model-warmup-image" />
    </div>

  </div>
</template>

<script>
import Error from "@/components/error";
import BespokeFooter from "@/components/bespokefooter";
import Navbar from "@/components/navbar";
import Processing from "@/components/processing";
import VideoSelection from "@/components/VideoSelection";
import { Segmenter } from "@/lib/segmenter/segmenter.js";
import { Webcam } from "@/lib/segmenter/webcam.js";


export default {
  name: "App",
  components: {
    Error,
    BespokeFooter,
    Navbar,
    Processing,
    VideoSelection,
  },

  data: function() {
    return {
      has_error: false,
      error_message: null,
      error: null,

      model_ready: false,
      segmenter_video: null,

      segmenter_webcam: null,
      webcam_ready: false,

      video_ready: false,

      is_playing: false,

      background_bitmap: null,
      foreground_bitmap: null,
      insert_bitmap: null
    };
  },

  mounted: function() {
    this.has_error = false;

    this.model_ready = false;
    this.webcam_ready = false;

    this.is_playing = false;

    const webcam = new Webcam({audio: false, video: {facingMode: "environment"}});
    webcam.oncanplay = () => { this.webcam_ready = true; }
    this.segmenter_webcam = Segmenter.from_media(webcam);
    this.segmenter_webcam.on_images = (r) => {this.insert_bitmap = r.foreground;};
    this.segmenter_webcam.onerror = (e) => {this.on_error("Error in webcam", e);};
    this.segmenter_webcam.load()
    .catch((e) => {this.on_error("Unable to load the webcam", e);});

    const url = new URL(window.location);
    if (url.searchParams.has("video")) {
      console.log("Load video " + url.searchParams.get("video"));
      this.set_video(url.searchParams.get("video"));
    }
   },
  
  methods: {
    /*
     * Resize
     */
    resize: function() {
      console.log("Resize");
      let c = this.renderer();
      let w = c.parentNode.clientWidth;
      let h = c.parentNode.clientHeight;

      const ar = this.video().videoWidth / this.video().videoHeight;
      console.log("Video: ", this.video().videoWidth, this.video().videoHeight);
      if (ar < w/h) {
        c.width = ar * h;
        c.height = h;
      } else {
        c.width = w;
        c.height = w / ar;
      }
    },

    /*
     * Accessor to canvas used for rendering
     */
    renderer: function() {return document.getElementById("canvas-renderer"); },

    /*
     * Accessor to video feed element
     */
    video: function() {return document.getElementById("video-feed");},

    /*
     * Render available images
     */
    render: function() {
      this.is_playing = ! (this.video().paused || this.video().ended);

      if (! this.is_playing || this.has_error) {
        // Stop playing
        this.segmenter_video.stop();
        this.segmenter_webcam.stop();
      }

      if (this.is_playing && ! this.has_error) {
        var c = this.renderer();
        var ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);

        if (this.background_bitmap) {
            ctx.drawImage(this.background_bitmap, 0, 0, c.width, c.height);
        }

        if (this.insert_bitmap) {
          const r = this.fit_image(this.insert_bitmap, c);
          ctx.drawImage(this.insert_bitmap, 
                        0.5*(c.width - r.width), c.height - r.height, 
                        r.width, r.height); 
        }

        if (this.foreground_bitmap) { 
            ctx.drawImage(this.foreground_bitmap, 0, 0, c.width, c.height);
        }
        window.requestAnimationFrame(() => {this.render();});
      }
    },

    /*
     * Retrieve width and height to fit into a target {width: xyz, height: xyz}
     * input:
     *   - image: object of type ImageBitmap
     *   - target: object containing container with/height as {width: xyz, height: xyz}
     * Output:
     *    {width: abc, height: abc}
     */
    fit_image: function(image, target) {
      if ((Math.abs(target.width) < 1e-3) || (Math.abs(target.height) < 1e-3)) { return {width: 0, height: 0}; }

      const w = image.width; const h = image.height; const ar = w / h;
      const ar_t = target.width / target.height;
      if (ar < ar_t) {
        return {height: target.height,
                width: w / h * target.height};
      } else {
        return {height: h / w * target.width,
                width: target.width};
      }
    },

    /*
     * Check if ready for starting video
     */
    is_ready: function() {
      return this.video_ready &&
             this.model_ready &&
             this.webcam_ready;
    },

    /*
     * Load and warmup model
     */
    do_model_warmup: function() {
      if (! this.model_ready) {
        this.segmenter_video.segmentor.extract(document.getElementById("model-warmup-image"))
        .then(() => {this.model_ready = true; console.log("model warmup successful");})
        .catch((e) => {this.on_error("Model warmup failed", e);});
      }
    },

    /*
     * Assign video url
     */
    set_video: function(url) {
console.log("set video to ", url);
      let source = document.createElement('source');
      source.setAttribute('src', url);
      if ((new URL(url, window.location.href)).origin !== window.location.origin) {
        this.video().crossOrigin = "anonymous";
      }
      this.video().appendChild(source);

      this.video().oncanplay = () => {
        console.log("video oncanplay");
        this.video_ready = true;
        this.do_model_warmup();
        this.resize();
      };
      this.video().onplay = () => {
        console.log("video onplay");
        this.is_playing = true;
        this.resize();
        window.onresize = () => {this.resize();};
        this.segmenter_webcam.start();
        this.segmenter_video.start();
        this.render();
      };
      this.video().load();

      this.segmenter_video = Segmenter.from_video(this.video());
      this.segmenter_video.on_images = (r) => { 
        this.foreground_bitmap = r.foreground; 
        this.background_bitmap = r.background; 
      };
      this.segmenter_video.onerror = this.on_error;
    },

    /*
     * Handle error message
     */
    on_error: function(msg, e) {
      console.log("Error: ", msg, "Error: ", e);
      this.has_error = true;
      this.error_message = msg;
      this.error = e;
      this.is_playing = false;
      this.segmenter_video.stop();
      this.segmenter_webcam.stop();
    }
  }
};
</script>

