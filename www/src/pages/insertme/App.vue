<template>
  <div id="app">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="step === 1">
        <div>
          <label for="youtube-url" class="block text-sm font-medium text-gray-700">YouTube URL</label>
          <div class="mt-1">
            <input type="text" 
               name="url" 
               id="youtube-url" 
               class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
               v-model="youtube_url"
               placeholder="youtube.com/watch?v=ScMzIvxBSi4">
          </div>
        </div>

        <button type="button" class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" @click="play()">
          Play
        </button>
      </div> <!-- v-if="step === STEP_INIT" -->

      <div v-if="step === 2">
<!--
        <Renderer :background_bitmap="undefined" 
                  :foreground_bitmap="undefined"
                  :insert_bitmap="undefined"></Renderer>
        <p class="absolute top-0 left-0">Playing {{ youtube_url }}</p>
-->
      </div> <!-- v-if="step === STEP_PLAY" -->
    </div>

    <!-- hidden elements -->
    <div> <!-- class="hidden"> -->
      <img src="/assets/images/thispersondoesnotexist.jfif" id="warmup-image" />
      <video controls id="video-feed"></video>
    </div>
  </div>
</template>

<script>
// import Viewer from "@/components/Viewer.vue";
// import Yt2Html5 from "@/lib/yt2html5";
import Video from "@/lib/video";
import ImageExtraction from "@/lib/image_extraction";
// import Renderer from "@/components/renderer";


export default {
  name: "App",
  components: {
    // Renderer,
    // Viewer,
  },

  data: function() {
    return {
      step: 1,
      youtube_url: null,

      video_url: null,

      item_status: {
        model: 0,
      }
    };
  },

  mounted: function() {
    // this.initialize_warm_model();
    this.initialize_video();
  },
  
  methods: {
    /*
     * Initialization: warm-up model
     */
    initialize_warm_model: function() {
      console.log("Warm up model");
      ImageExtraction.extract(document.getElementById("warmup-image"))
      .then((r) => {console.log("model warm-up complete", r); this.item_status.model = 1; this.run();})
    .  catch((e) => {this.on_error("model warm up failed", e); this.item_status.model = -1;});
    },

   /*
    * Initialize video: set call back when playing a video
    */
   initialize_video: function() {
     // this.video_feed().onplay = () => {this.on_play_video_feed();};
   },

   video_feed: function() { return document.getElementById("video-feed"); },

   on_play_video_feed: function() {
     const video = this.video_feed();
     if (video.paused || video.ended) {return ;}
     ImageExtraction.extract(video)
     .then((r) => {console.log("handle video results", r);})
     .catch((e) => {this.on_error("Unable to extract video results", e);});
     setTimeout(() => {this.on_play_video_feed();}, 0);
   },

    play: function() {
      Video.from_YouTube(this.youtube_url)
      .then(video => {this.on_video(video);})
      .catch(e => {this.on_error("Unable to find youtube url", e);});

      this.step = 2;
    },

   on_video: function(video) {
     console.log("handling video", video.info);
     if (video.durationInSeconds > 5 * 60) {
       this.on_error("Video are limited to 5 minutes long video. The proposed video is " + video.durationInSeconds + " seconds long");
       throw Error("Video duration exceeds permissible length of 5 minutes");
     }

     video.as_blob_url()
     .then(blob_url => {
       // const url = URL.createObjectURL(blob);
       var source = document.createElement('source');
       source.setAttribute('src', blob_url);
       this.video_feed().appendChild(source);
       this.video_feed().play();
     })
     .catch(e => {this.on_error("Unable to fetch video " + video.title + " as blob", e);});
   },

   run: function() {
     if ((this.item_status.model === 1) &&
         (this.video_url !== null)) {
       var source = document.createElement('source');
       source.setAttribute('src', this.video_url);
       source.setAttribute('type', "video/mp4");
       this.video_feed().appendChild(source);
       this.video_feed().load();
       this.video_feed().play()
       .then(() => {this.on_play_video_feed();})
       .catch(e => {this.on_error("Unable to play video", e);});
     }
   },

   on_error: function(msg, e) {
     console.log(msg);
     console.log("Error: ", e);
   }
    
  }
};
</script>

