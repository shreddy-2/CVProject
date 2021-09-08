<template>
  <div id="app">
    <Navbar></Navbar>
    <div class="absolute top-16 bottom-0 left-0 right-0">

      <div v-if="(! video_ready) && (! has_error)">
        <div class="relative max-w-3xl mx-auto mt-12 lg:mt-24 text-center">
          <h2 class="text-lg leading-8 font-bold tracking-tight text-gray-900 sm:text-xl">
            View the action at home
          </h2>
        </div>

        <div class="relative max-w-xl mx-auto mt-12">
<!--
          <div class="relative flex items-start">
            <div class="flex items-center h-5">
              <input id="model-warmup" v-model="model_warmup" aria-describedby="model-warmup-description" name="model-warmup" type="checkbox" disabled class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
            </div>
            <div class="ml-3 text-sm">
              <label for="model-warmup" class="font-medium text-gray-700">Model warm-up</label>
              <p id="model-warmup-description" class="text-gray-500">A model is employed to extract foreground and background. This checkbox becomes ticked off when the model is loaded and ready.</p>
            </div>
          </div>
-->

          <div class="relative text-center mt-12">
            <div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div class="space-y-1 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex text-sm text-gray-600">
                  <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" class="sr-only" @change="on_file">
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">
                  MP4 (??? up to ??MB)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="is_ready() && (! has_error)">
        <div class="relative max-w-3xl mx-auto pt-12 lg:pt-24 text-center">
          <h2 class="text-lg leading-8 font-bold tracking-tight text-gray-900 sm:text-xl">
            Video playing
          </h2>
        </div>
      </div>

      <div v-if="! is_ready() && video_ready">
        <div class="max-w-xl mx-auto mt-24">
          <div class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <!-- Heroicon name: solid/check-circle -->
                <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">
                Processing in process
                </h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>The video is being loaded and the model prepared. Please be patient.<br/>
                     It will not be very long.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute inset-0 bg-gray-800"
           :class="{'hidden': (! is_ready()) || has_error }">
        <canvas class="object-none mx-auto my-auto bg-gray-500" id="canvas-renderer"></canvas>
      </div>

      <div class="absolute top-0.5 right-0.5 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
           :class="{'hidden': (! is_ready()) || has_error }">
        <video controls id="video-feed"></video>
      </div>
  
      <div v-if="has_error">
        <div class="max-w-xl mx-auto mt-24">
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <!-- Heroicon name: solid/x-circle -->
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                An error occured whilst processing the page
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <ul role="list" class="list-disc pl-5 space-y-1">
                    <li>
                      Error message: {{ error_message }}
                    </li>
                    <li v-if="error !== null">
                      Error: {{ error }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- hidden elements -->
    <div class="hidden">
      <img src="/assets/images/thispersondoesnotexist.jfif" id="model-warmup-image" />
      <canvas id="canvas-video-foreground"></canvas>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/navbar";
// import Renderer from "@/components/renderer";
import ImageExtraction from "@/lib/image_extraction";

export default {
  name: "App",
  components: {
    Navbar,
    // Renderer,
  },

  data: function() {
    return {
      has_error: false,
      error_message: null,
      error: null,

      video_ready: false,
      model_ready: false,

      foreground_bitmap: null,

      is_playing: false
    };
  },

  mounted: function() {
    this.has_error = false;
    this.video_ready = false;
    this.model_ready = false;
    this.is_playing = false;

    this.initialise_video_feed();
  },

  methods: {
    /*
     * Resize
     */
    resize: function() {
      let c = this.renderer();
      let w = c.parentNode.clientWidth;
      let h = c.parentNode.clientHeight;

      const v = this.video_feed();
      const ar = v.videoWidth / v.videoHeight;
      console.log("Video w/h", v.videoWidth, v.videoHeight);

      if (ar < w/h) {
        c.width = ar * h;
        c.height = h;
      } else {
        c.width = w;
        c.height = w / ar;
      }

      const c1 = this.video_foreground_extractor();
      c1.width = v.videoWidth;
      c1.height = v.videoHeight;
    },

    /*
     * Accessor to video feed element
     */
    video_feed: function() {return document.getElementById("video-feed");},

    /*
     * Accessor to canvas used to extract video foreground
     */
    video_foreground_extractor: function() {return document.getElementById("canvas-video-foreground");},

    /*
     * Accessor to canvas used for rendering
     */
    renderer: function() {return document.getElementById("canvas-renderer"); },

    /*
     * Render available images
     */
    render: function() {
      if (this.is_playing && ! this.has_error) {
        var c = this.renderer();
        var ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        // if (this.background_bitmap) {ctx.drawImage(this.background_bitmap, 0, 0, c.width, c.height);}
        // if (this.insert_bitmap) {ctx.drawImage(this.insert_bitmap, 0, 0, c.width, c.height);}
        if (this.foreground_bitmap) {ctx.drawImage(this.foreground_bitmap, 0, 0, c.width, c.height);}
        window.requestAnimationFrame(() => {this.render();});
      }
    },

    /*
     * Initialise video feed response
     */
    initialise_video_feed: function() {
      this.video_feed().oncanplay = () => {
        this.video_ready = true;
        this.resize();
        this.do_model_warmup();
      };
      this.video_feed().onplay = () => {
        this.resize();
        window.onresize = () => {this.resize();};
        this.is_playing = true; 
        this.play_video(); 
        this.render();
      };
    },

    /*
     * Check if ready for starting video
     */
    is_ready: function() {
      return this.video_ready &&
             this.model_ready;
    },

    /*
     * Handle the video feed when it starts to play
     */
    play_video: function() {
      const video = this.video_feed();
      this.is_playing = ! (video.paused || video.ended);
      if (video.paused || video.ended) {return ;}
      this.handle_video()
      .then((foreground_bmp) => {
        this.foreground_bitmap = foreground_bmp; 
        setTimeout(() => {this.play_video();}, 0);
      })
      .catch((e) => {this.on_error("Error proceesing video", e);});
    },

    /*
     * Get the first image to initialise render
     */
    handle_video: function() {
      return new Promise((resolve, reject) => {
        ImageExtraction.extract(this.video_feed())
        .then((r) => {
          this.get_foreground_bitmap(this.video_foreground_extractor(), r.image, r.mask)
          .then(resolve)
          .catch(reject);
        })
        .catch(reject);
      });
    },

    /*
     * Load and warmup model
     */
    do_model_warmup: function() {
      ImageExtraction.extract(document.getElementById("model-warmup-image"))
      .then(() => {this.model_ready = true;})
      .catch((e) => {this.on_error("Model warmup failed", e);});
    },

    /*
     * When a file is selected
     */
    on_file: function(evt) {
      const files = evt.target.files;
      console.log(files);
      if (files.length > 1) {
        this.on_error("Multiple files have been selected", null);
      } else if (! (files[0].type.match(/video\/mp4/))) {
        this.on_error(`Selected file is of type ${files[0].type} which is not a supported file type. Supported file types are video/mp4`, null);
      } else {
        this.set_video(URL.createObjectURL(files[0]));
      }
    },

    /*
     * Assign video url
     */
    set_video: function(url) {
      let source = document.createElement('source');
      source.setAttribute('src', url);
      this.video_feed().appendChild(source);
      this.video_feed().load();
    },

    /*
     * Extract foreground bitmap image from SegmentationResult
     */
    get_foreground_bitmap: function(canvas, image, mask) {
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return createImageBitmap(data);
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
    }
    
  }
  
};
</script>

