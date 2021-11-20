<template>
  <div id="app">
    <Navbar></Navbar>
    <div class="absolute top-16 bottom-0 left-0 right-0">
      <div class="mb-12" v-if="(! is_ready()) && (! has_error)">
        <Processing></Processing>
      </div>

      <div class="absolute inset-0 bg-gray-800" v-if="is_ready()">
        <SegmenterPlayer
          :image_back="image_back"
          :image_middle="null"
          :image_front="null"
          :audio_track="webcam.media.audio_track"
          :controls="true"
          :allow_recording="true"
          :video_current_time="0"
          :video_duration="null"
          @on_record="record()"
          @on_start="start()"
          @on_stop="stop()"
          @onerror="on_error('Error in segmenter player', $event)"
          ref="segmenter_player"
          >
        </SegmenterPlayer>
      </div>

      <div class="fixed top-1 right-1" v-if="is_recording && (! has_error)">
        <div class="animate-pulse text-red-600 text-lg font-bold">recording</div>
      </div>

      <div class="mb-12" v-if="has_error">
        <Error :error="error" :error_message="error_message"></Error>
     </div>

      <BespokeFooter v-if="! is_ready()"></BespokeFooter>
    </div>

    <SegmenterMedia 
        :media="webcam"
        @onimage="handle_segmented_images($event);"
        @onready="webcam_ready = true;"
        @onerror="on_error('Error loading webcam', $event)"
        v-if="webcam != null"
        >
    </SegmenterMedia>

  <canvas class="hidden" id="app-canvas"></canvas>
  </div>
</template>

<script>
import Error from "@/components/error";
import Navbar from "@/components/navbar";
import BespokeFooter from "@/components/bespokefooter";
import Processing from "@/components/processing";
import SegmenterMedia from "@/lib/segmenter/segmentermedia";
import SegmenterPlayer from "@/lib/segmenter/segmenterplayer";
import { Segmenter } from "@/lib/segmenter/segmenter.js";
import { Webcam } from "@/lib/segmenter/webcam.js";

export default {
  name: "App",
  components: {
    Error,
    BespokeFooter,
    Navbar,
    Processing,
    SegmenterMedia,
    SegmenterPlayer,
  },

  data: function() {
    return {
      has_error: false,
      error_message: null,
      error: null,

      webcam: null,
      webcam_ready: false,

      is_playing: false,
      is_recording: false,

      canvas: null,
      image_back: null
    };
  },

  mounted: function() {
    this.has_error = false;

    this.webcam = new Segmenter(new Webcam({audio: true, video: {facingMode: "environment"}}));
    this.webcam_ready = false;

    this.is_playing = false;
    this.is_recording = false;
  },

  methods: {
    /*
     * Retrieve canvas
     */
    get_canvas: function() {
      return document.getElementById('app-canvas');
    },

    /*
     * Handle image from the webcam
     */
    handle_segmented_images: function(s) {
      var c = this.get_canvas();
      var ctx = c.getContext('2d');
      if (this.image_back === null) {
        c.height = s.image.height;
        c.width = s.image.width;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(s.image, 0, 0, c.width, c.height);
      }
      ctx.drawImage(s.background, 0, 0, c.width, c.height);
      createImageBitmap(c, 0, 0, c.width, c.height)
      .then((img) => {this.image_back = img;})
      .catch((e) => {this.on_error("Error processing image", e);});
    },

    /*
     * Check if ready for starting video
     */
    is_ready: function() {
      return this.webcam_ready &&
             ! this.has_error;
    },

    /*
     * Start recording
     */
    record: function() {
      this.webcam.start();
      this.$refs.segmenter_player.record();
      this.is_playing = true;
      this.is_recording = true;
    },

    /*
     * Start
     */
    start: function() {
      this.webcam.start();
      this.$refs.segmenter_player.start();
      this.is_playing = true;
      this.is_recording = false;
    },

    stop: function() {
      this.is_recording = false;
      this.is_playing = false;
      this.$refs.segmenter_player.stop();
      this.webcam.stop();
    },

    /*
     * Handle error message
     */
    on_error: function(msg, e) {
      this.has_error = true;
      this.error_message = msg;
      this.error = e;
      this.stop();
    }
  }
};
</script>

