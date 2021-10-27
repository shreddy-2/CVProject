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
            :image_front="image_front"
            :audio_track="webcam.media.audio_track"
            :controls="true"
            :allow_recording="true"
            :video_current_time="video_current_time"
            :video_duration="video_duration"
            @on_record="record()"
            @on_start="start()"
            @on_stop="stop()"
            @on_restart="video.media.currentTime = 0; video_current_time = 0;"
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

      <BespokeFooter></BespokeFooter>
    </div>

    <SegmenterMedia 
        :media="video"
        @onimage="image_back = $event.image; video_current_time = video.media.currentTime;"
        @onready="video_ready = true; video_duration = video.media.duration;"
        @onerror="on_error('Error loading video', $event)"
        v-if="video != null"
        >
    </SegmenterMedia>
    <SegmenterMedia 
        :media="webcam"
        @onimage="image_front = $event.foreground;"
        @onready="webcam_ready = true;"
        @onerror="on_error('Error loading webcam', $event)"
        v-if="webcam != null"
        >
    </SegmenterMedia>
  </div>
</template>

<script>
import Error from "@/components/error";
import BespokeFooter from "@/components/bespokefooter";
import Navbar from "@/components/navbar";
import Processing from "@/components/processing";
import SegmenterMedia from "@/lib/segmenter/segmentermedia";
import SegmenterPlayer from "@/lib/segmenter/segmenterplayer";
import { Segmenter } from "@/lib/segmenter/segmenter.js";
import { Video } from "@/lib/segmenter/video.js";
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
     show_instruction_modal: true,

      has_error: false,
      error_message: null,
      error: null,

      video: null,
      video_ready: false,
      webcam: null,
      webcam_ready: false,

      is_playing: false,
      is_recording: false,

      image_back: null,
      image_front: null,

      video_duration: 0,
      video_current_time: 0
    };
  },

  mounted: function() {
    this.has_error = false;

    this.video = new Video("https://cdn.video-mash.com/weatherforecast/video.mp4").mute();
    this.webcam = new Segmenter(new Webcam({audio: true, video: {facingMode: "user"}}));
    this.video_ready = false;
    this.webcam_ready = false;

    this.is_playing = false;
    this.is_recording = false;
   },
  
  methods: {
    /*
     * Check if ready for starting video
     */
    is_ready: function() {
      return this.video_ready &&
             this.webcam_ready &&
             ! this.has_error;
    },

    /*
     * Start recording
     */
    record: function() {
      this.webcam.start();
      this.video.start();
      this.$refs.segmenter_player.record();
      this.is_playing = true;
      this.is_recording = true;
    },

    /*
     * Start
     */
    start: function() {
      this.webcam.start();
      this.video.start();
      this.$refs.segmenter_player.start();
      this.is_playing = true;
      this.is_recording = false;
    },

    stop: function() {
      this.is_recording = false;
      this.is_playing = false;
      this.$refs.segmenter_player.stop();
      this.video.stop();
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

