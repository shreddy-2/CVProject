<template>
  <div id="app">
    <div class="absolute top-0 bottom-0 left-0 right-0">
      <!-- Player -->
      <div class="absolute inset-0 bg-gray-800 flex-col">
        <canvas class="border-gray-300 mx-auto" id="render-canvas"></canvas>
      </div>

      <div class="absolute top-0 left-0 right-0">
        <Navbar></Navbar>

        <div class="fixed bottom-16 left-2 right-2" v-if="(segmentor === null) && (! has_error)">
          <div class="animate-pulse text-green-600 text-lg font-bold text-center">Model loading...</div>
        </div>

        <div class="fixed top-1 right-1" v-if="(fps !== null) && (! has_error)">
          <div class="text-gray-600 text-lg font-bold">{{ fps }}fps</div>
        </div>

        <div class="fixed top-9 right-1" v-if="is_recording && (! has_error)">
          <div class="animate-pulse text-red-600 text-lg font-bold">recording</div>
        </div>

        <div class="fixed top-9 right-1" v-if="is_processing_recording && (! has_error)">
          <div class="animate-pulse text-green-600 text-lg font-bold">Processing recording...</div>
        </div>

        <div class="mb-12" v-if="has_error">
          <Error :error="error" :error_message="error_message"></Error>
        </div>
      </div>

      <div class="fixed top-14 bottom-10 left-0 right-0 overflow-y-scroll overflow-x-hidden" v-if="(! video_ready) && (! has_error)">
        <VideoSelection @error="on_error($event)"
                        @video-url="set_video($event)">
        </VideoSelection>
      </div>

      <div class="absolute bottom-0 left-0 right-0">
        <BespokeFooter v-if="! is_ready()"></BespokeFooter>
      </div>

      <ViewerPlayerControl 
         :controls="true" 
         :allow_recording="allow_recording" :allow_rewind="false" :allow_playing="true" 
         :is_playing="is_playing || is_recording" :is_recording="is_playing || is_recording" :video_current_time="0" 
         @on_record="record()"
         @on_stop="stop()"
         @on_play="play()"
         @error="on_error($event.msg, $event.e);"
         v-if="is_ready() && (! has_error)"  
         />

      <MediaRecorder
         @error="on_error($event.msg, $event.e);"
         @on_processing="is_processing_recording = $event;"
         ref="media_recorder"
         />
    </div>

    <video  class="hidden" id="app-video-video" autoplay playsinline @play="on_video_play()"></video>
    <canvas class="hidden" id="app-video-canvas"></canvas>

    <video  class="hidden" id="app-webcam-video" autoplay muted playsinline @play="webcam_ready = true;" ></video>
    <canvas class="hidden" id="app-webcam-canvas"></canvas>

    <canvas class="hidden" id="app-manipulation-canvas"></canvas>
    <canvas class="hidden" id="app-background-canvas"></canvas>
    <canvas class="hidden" width="100" height="100" id="check-createimagebitmap-canvas"></canvas>
    <CalculateFps
      @fps="fps = $event;"
      ref="calculate_fps"
      />
  </div>
</template>

<script>
import Error from "@/components/error";
import Navbar from "@/components/navbar";
import BespokeFooter from "@/components/bespokefooter";
// import Processing from "@/components/processing";
import MediaRecorder from "@/components/MediaRecorder";
import CalculateFps from "@/components/CalculateFps";
import VideoSelection from "@/components/VideoSelection";
import ViewerPlayerControl from "@/components/ViewerPlayerControl";

import "@/lib/animationframecheck.js";
import { makeSegmentationModel } from "@/lib/segmodel.js";
import { makeWebcam, fit } from "@/lib/utils.js";
import { drawVideo, resizeCanvasToFit } from "@/lib/canvasfunctions.js";


export default {
  name: "App",
  components: {
    Error,
    Navbar,
    BespokeFooter,
    // Processing,
    MediaRecorder,
    CalculateFps,
    VideoSelection,
    ViewerPlayerControl,
  },

  data: function() {
    return {
      has_error: false,
      error_message: null,
      error: null,

      segmentor: null,
      video_ready: false,
      webcam_ready: false,
      webcam_user_facing: false,

      is_playing: false,
      is_recording: false,
      is_processing_recording: false,
      fps: null,

      do_resize: true,
    };
  },

  mounted: function() {
    try {
      window.onresize = () => { this.do_resize = true; }
      this.init();
      this.render();

      const urlSearchParams = new URL(window.location.href).searchParams;
      makeSegmentationModel(urlSearchParams)
      .then((s) => { this.segmentor = s; this.allow_recording = true; })
      .catch((e) => { this.on_error("Error in mounted::makeSegmentationModel", e); });

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
    video_video: function() { return document.getElementById("app-video-video"); },
    video_canvas: function() { return document.getElementById("app-video-canvas"); },
    webcam_video: function() { return document.getElementById("app-webcam-video"); },
    webcam_canvas: function() { return document.getElementById("app-webcam-canvas"); },
    manipulation_canvas: function() { return document.getElementById("app-manipulation-canvas"); },
    render_canvas: function() { return document.getElementById("render-canvas"); },

    init: function() {
      try {
        makeWebcam({audio: true, video: {facingMode: "environment"}})
        .then((media_stream) => { 
           const settings = media_stream.getVideoTracks()[0].getSettings();
           this.webcam_user_facing = (settings.facingMode === undefined) || (settings.facingMode.includes('user'));
           this.webcam_video().srcObject = media_stream;
           this.webcam_video().play();
        })
        .catch((e) => {this.on_error("Error in init::makeWebcam", e);});

      } catch (e) {
        this.on_error("Error in init", e);
      }
    },

    /*
     * Assign video url
     */
    set_video: function(url) {
      try {
        let source = document.createElement('source');
        source.setAttribute('src', url);
        let video = this.video_video();
        video.crossOrigin = "anonymous";
        video.appendChild(source);
        video.play();
      } catch (e) {
        this.on_error("Error in set_video", e);
      }
    },

    on_video_play: function() {
      try {
        if (! this.video_ready) {
          this.video_ready = true;
        }
      } catch (e) {
        this.on_error("Error in on_video_play", e);
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

    render: async function() {
      try {
        if (this.is_ready()) {
          // Convert webcam to canvas
          var vc = drawVideo(this.webcam_video(), this.webcam_canvas(), this.webcam_user_facing);
          if (vc.width > 0 && vc.height > 0) {

            var canvas = this.render_canvas();
            if (this.do_resize) { canvas = resizeCanvasToFit(canvas, {width: vc.width, height: vc.height}); }
            var ctx = canvas.getContext('2d');

            let mc = null;

            const video = this.video_video();
            var vvc = drawVideo(this.video_video(), this.video_canvas(), false);
            if (vvc.width > 0 && vvc.height > 0 && this.segmentor !== null) {
              if (!this.is_playing && !this.is_recording && video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 0) { video.pause(); }
              const r = await this.segmentor.send(vvc);
              mc = this.manipulation_canvas();
              mc.width = vvc.width; mc.height = vvc.height;
              var mc_ctx = mc.getContext('2d');
              mc_ctx.save();
              mc_ctx.clearRect(0, 0, mc.width, mc.height);
              mc_ctx.drawImage(r.image, 0, 0, mc.width, mc.height);
              mc_ctx.globalCompositeOperation = 'destination-in';
              mc_ctx.drawImage(r.segmentationMask, 0, 0, mc.width, mc.height);
              mc_ctx.restore();
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(vc, 0, 0, canvas.width, canvas.height);
            if (mc !== null) {
              const f = fit({width: mc.width, height: mc.height}, {width: canvas.width, height: canvas.height});
              ctx.drawImage(mc, f.margin_left, f.margin_top, f.width, f.height);
            }

            ctx.font = 'bold 12px sans-serif';
            ctx.fillText("Made at video-mash.com", 2, 12);

            this.do_resize = false;
            this.$refs.calculate_fps.tick();
            if (this.is_recording) {this.$refs.media_recorder.capture(canvas); }
          }
          window.requestAnimationFrame(this.render);

        } else {
          window.requestAnimationFrame(this.render);
        }

      } catch (e) {
        this.on_error("Error in render", e);
      }
    },
 
    /*
     * Start recording
     */
    record: function() {
      try {
        this.is_recording = true;
        var stream = this.render_canvas().captureStream(30); // fps
        var video_stream = this.video_video().captureStream(30);
        const video_audio_tracks = video_stream.getAudioTracks();
        if (video_audio_tracks.length > 0) { stream.addTrack(video_audio_tracks[0]); } 
        this.video_video().play();
        this.$refs.media_recorder.record(stream);
      } catch (e) {
        this.on_error("Error in record", e);
      }
    },

    play: function() {
      try {
        this.is_playing = true;
        this.video_video().play();
      } catch (e) {
        this.on_error("Error in play", e);
      }
    },

    stop: function() {
      try {
        this.is_playing = false;
        this.is_recording = false;
        this.video_video().pause();
        this.$refs.media_recorder.stop();
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
    }
  }
};
</script>

