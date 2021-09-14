<template>
  <div id="app">
    <Navbar></Navbar>
    <div class="absolute top-16 bottom-0 left-0 right-0">

      <div v-if="(! video_ready) && (! has_error)">
        <div class="relative max-w-3xl mx-auto mt-12 lg:mt-24 text-center">
          <h2 class="text-lg leading-8 font-bold tracking-tight text-gray-900 sm:text-xl">
            Select a video from the list below
          </h2>
        </div>

        <div class="relative max-w-3xl mx-auto mt-12">
        <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <li v-for="s in samples"
              :key="s.video_url"
              class="col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200">
            <div class="flex-1 flex flex-col p-2">
              <img class="h-32 flex-shrink-0 mx-auto rounded-full" :src="s.thumbnail_url" alt="">
              <dl class="mt-1 flex-grow flex flex-col justify-between">
                <dd class="text-gray-500 text-sm">{{ s.description }}</dd>
              </dl>
            </div>
            <div>
              <div class="-mt-px flex divide-x divide-gray-200">
                <div class="w-0 flex-1 flex">
                  <a href="#" class="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500" @click="set_video(s.video_url)">
                    <!-- Heroicon name: solid/play -->
                    <svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                    <span class="ml-3">View</span>
                  </a>
                </div>
              </div>
            </div>
          </li>

          <!-- More people... -->
        </ul>
        </div>


        <div class="relative max-w-3xl mx-auto mt-12 lg:mt-24 text-center">
          <h2 class="text-lg leading-8 font-bold tracking-tight text-gray-900 sm:text-xl">
            Or use your own
          </h2>
        </div>

        <div class="relative max-w-xl mx-auto mt-12">
          <div class="relative text-center mt-12">
            <div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div class="space-y-1 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex text-sm text-gray-600">
                  <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Select a file</span>
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
      <video id="webcam-feed"></video>
      <canvas id="webcam-canvas"></canvas>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/navbar";
// import Renderer from "@/components/renderer";
import ImageExtraction from "@/lib/image_extraction";

const samples = [
  {description: "Demonstration video used in tutorial on manipulating video using canvas - how to perform chroma-keying using JavaScript code.",
   source_url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas",
   video_url: "/assets/videos/video.mp4",
   thumbnail_url: "/assets/videos/thumbnail.png" },
  {description: "John Bishop - We have to trust Boris, John Bishop shares his thoughts on Corona Virus and the UK government",
   source_url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas",
   video_url: "https://d39ntp7mtoszgk.cloudfront.net/001_JohnBishop-WeHaveToTrustBoris/video.mp4",
   thumbnail_url: "https://d39ntp7mtoszgk.cloudfront.net/001_JohnBishop-WeHaveToTrustBoris/thumbnail.png"}
];

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

      video_url: null,
      video_ready: false,
      model_ready: false,
      user_media_ready: false,

      is_playing: false,

      background_bitmap: null,
      foreground_bitmap: null,

      user_media_capabilities: null,

      samples

    };
  },

  mounted: function() {
    this.has_error = false;

    this.model_ready = false;
    this.user_media_ready = false;

    this.is_playing = false;

    this.initialise_video_feed();
    this.initialise_user_media();

    const url = new URL(window.location);
    console.log("url", url);
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

      const wv = this.webcam_feed();
      const ar = wv.videoWidth / wv.videoHeight;
      console.log("Video w/h", wv.videoWidth, wv.videoHeight);

      if (ar < w/h) {
        c.width = ar * h;
        c.height = h;
      } else {
        c.width = w;
        c.height = w / ar;
      }

      const c2 = this.webcam_canvas();
      c2.width = wv.videoWidth;
      c2.height = wv.videoHeight;

      const v = this.video_feed();
      const c1 = this.video_foreground_extractor();
      c1.width = v.videoWidth;
      c1.height = v.videoHeight;
    },

    /*
     * Initialise webcam (user media device)
     */
    initialise_user_media: function() {
      navigator.mediaDevices.getUserMedia({audio: false, video: { facingMode: "environment" } })
      .then((media_stream) => {
        this.user_media_capabilities = media_stream.getVideoTracks()[0].getCapabilities();
        this.webcam_feed().srcObject = media_stream;
        this.webcam_feed().oncanplay = () => {
          this.user_media_ready = true;
          this.resize();
        };

        this.webcam_feed().play();
      })
      .catch((e) => {this.on_error("Unable to access web camera", e);});
    },

    /*
     * Play user media
     */
    play_user_media: function() {
      const video = this.webcam_feed();
      if (video.paused || video.ended) {return ;}
      const canvas = this.webcam_canvas();
      var context = canvas.getContext('2d');
      if (this.user_media_capabilities.facingMode.includes('user')) { // User facing flip along y
        context.save();
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.restore();
      } else { // Environment facing camera
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const data = context.getImageData(0, 0, canvas.width, canvas.height);
      createImageBitmap(data)
      .then((bmp) => {
        this.background_bitmap = bmp;
        setTimeout(() => {this.play_user_media();}, 0);
      })
      .catch((e) => {this.on_error("Unable to extract bitmap image from webcam", e);});
    },

    /*
     * Accessor to webcam video feed element
     */
    webcam_feed: function() {return document.getElementById("webcam-feed");},

    /*
     * Accessor to webcam video feed element
     */
    webcam_canvas: function() {return document.getElementById("webcam-canvas");},

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

        if (this.background_bitmap) {
          ctx.drawImage(this.background_bitmap, 0, 0, c.width, c.height);
        }

        // if (this.insert_bitmap) {ctx.drawImage(this.insert_bitmap, 0, 0, c.width, c.height);}

        if (this.foreground_bitmap) { 
          const r = this.fit_image(this.foreground_bitmap, c);
          ctx.drawImage(this.foreground_bitmap, 
                        0.5*(c.width - r.width), c.height - r.height, 
                        r.width, r.height); 
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
     * Initialise video feed response
     */
    initialise_video_feed: function() {
      this.video_feed().oncanplay = () => {
        this.video_ready = true;
        this.do_model_warmup();
      };
      this.video_feed().onplay = () => {
        this.is_playing = true; 
        this.resize();
        window.onresize = () => {this.resize();};
        this.play_user_media();
        this.play_video(); 
        this.render();
      };
    },

    /*
     * Check if ready for starting video
     */
    is_ready: function() {
      return this.video_ready &&
             this.model_ready &&
             this.user_media_ready;
    },

    /*
     * Handle the video feed when it starts to play
     */
    play_video: function() {
      const video = this.video_feed();
      this.is_playing = ! (video.paused || video.ended);
      if (video.paused || video.ended) {return ;}
      this.handle_video(this.video_feed(), this.video_foreground_extractor())
      .then((foreground_bmp) => {
        this.foreground_bitmap = foreground_bmp; 
        setTimeout(() => {this.play_video();}, 0);
      })
      .catch((e) => {this.on_error("Error proceesing video", e);});
    },

    /*
     * Get the first image to initialise render
     */
    handle_video: function(video, canvas) {
      return new Promise((resolve, reject) => {
        ImageExtraction.extract(video)
        .then((r) => {
          this.get_foreground_bitmap(canvas, r.image, r.mask)
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
      if ((new URL(url, window.location.href)).origin !== window.location.origin) {
        this.video_feed().crossOrigin = "anonymous";
      }
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

