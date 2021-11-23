<template>
  <div id="app">
    <Navbar></Navbar>
    <div class="absolute top-16 bottom-0 left-0 right-0">
      <div class="mb-12" v-if="(! video_ready) && (! has_error)">
        <VideoSelection @error="on_error($event)"
                        @video-url="set_video($event)">
        </VideoSelection>
      </div>

      <div class="mb-12" v-if="(! is_ready()) && (video != null) && (! has_error)">
        <Processing></Processing>
      </div>

      <div class="absolute inset-0 bg-gray-800" v-if="is_ready()">
        <SegmenterPlayer
          :image_back="image_back"
          :image_middle="null"
          :image_front="image_front"
          :audio_track="video.media.audio_track"
          :controls="true"
          :allow_recording="true"
          :video_current_time="video.media.media.currentTime"
          :video_duration="video.media.media.duration"
          @on_record="record()"
          @on_start="start()"
          @on_stop="stop()"
          @on_restart="video.media.media.currentTime = 0;"
          @onerror="on_error('Error in segmenter player', $event)"
          ref="segmenter_player"
          >
        </SegmenterPlayer>
      </div>

      <div class="fixed top-1 right-1" v-if="is_recording && (! has_error)">
        <div class="animate-pulse text-red-600 text-lg font-bold">recording</div>
      </div>

<!--
      <div class="absolute top-0.5 right-0.5 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
           :class="{'hidden': (! is_ready()) || has_error }">
        <video controls id="video-feed"></video>
      </div>
-->
  
      <div class="mb-12" v-if="has_error">
        <Error :error="error" :error_message="error_message"></Error>
     </div>

      <BespokeFooter v-if="! is_ready()"></BespokeFooter>
    </div>

    <SegmenterMedia 
        :media="video"
        @onimage="image_front = $event.foreground;"
        @onready="video_ready = true; video_duration = video.media.duration;"
        @onerror="on_error('Error loading video', $event)"
        v-if="video != null"
        >
    </SegmenterMedia>
    <SegmenterMedia 
        :media="webcam"
        @onimage="image_back = $event.image;"
        @onready="webcam_ready = true;"
        @onerror="on_error('Error loading webcam', $event)"
        v-if="webcam != null"
        >
    </SegmenterMedia>
 
  </div>
</template>

<script>
import Error from "@/components/error";
import Navbar from "@/components/navbar";
import BespokeFooter from "@/components/bespokefooter";
import Processing from "@/components/processing";
import VideoSelection from "@/components/VideoSelection";
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
    VideoSelection,
    SegmenterMedia,
    SegmenterPlayer,
  },

  data: function() {
    return {
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
      image_front: null
    };
  },

  mounted: function() {
    try {
      this.has_error = false;

      this.video = null;
      this.webcam = new Segmenter(new Webcam({audio: false, video: {facingMode: "environment"}}));
      this.video_ready = false;
      this.webcam_ready = false;

      this.is_playing = false;
      this.is_recording = false;

      const url = new URL(window.location);
      if (url.searchParams.has("video")) {
        console.log("Load video " + url.searchParams.get("video"));
        this.set_video(url.searchParams.get("video"));
      }
    } catch (e) {
      this.on_error("Error in initialization", e);
    }
  },

  methods: {
    /*
     * Assign video url
     */
    set_video: function(url) {
      try {
        this.video = new Segmenter(new Video(url));
      } catch (e) {
        this.on_error("Error in set_video", e);
      }
    },

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
      try {
        this.webcam.start();
        this.video.start();
        this.$refs.segmenter_player.record();
        this.is_playing = true;
        this.is_recording = true;
      } catch (e) {
        this.on_error("Error in record", e);
      }
    },

    /*
     * Start
     */
    start: function() {
      try {
        this.webcam.start();
        this.video.start();
        this.$refs.segmenter_player.start();
        this.is_playing = true;
        this.is_recording = false;
      } catch (e) {
        this.on_error("Error in start", e);
      }
    },

    stop: function() {
      try {
        this.is_recording = false;
        this.is_playing = false;
        this.$refs.segmenter_player.stop();
        this.video.stop();
        this.webcam.stop();
      } catch (e) {
        this.on_error("Error in stop", e);
      }
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

