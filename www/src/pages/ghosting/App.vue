<template>
  <div id="app">
    <div class="absolute top-0 bottom-0 left-0 right-0">

      <!-- Player -->
      <div class="absolute inset-0 bg-gray-800 flex-col">
        <canvas class="border-gray-300 mx-auto" id="render-canvas"></canvas>
      </div>

      <div class="absolute top-0 left-0 right-0">
        <Navbar></Navbar>

        <div class="mb-12" v-if="(! is_ready()) && (! has_error)">
          <Processing></Processing>
        </div>

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

      <div class="absolute bottom-0 left-0 right-0">
        <BespokeFooter v-if="! is_ready()"></BespokeFooter>
      </div>

      <ViewerPlayerControl 
         :controls="true" 
         :allow_recording="allow_recording" :allow_rewind="false" :allow_playing="false" 
         :is_playing="false" :is_recording="is_recording" :video_current_time="0" 
         @on_record="record()"
         @on_stop="stop()"
         @error="on_error($event.msg, $event.e);"
         v-if="is_ready() && (! has_error)"  
         />

      <MediaRecorder
         @error="on_error($event.msg, $event.e);"
         @on_processing="is_processing_recording = $event;"
         ref="media_recorder"
         />
    </div>

    <video class="hidden" id="app-webcam-video" autoplay muted playsinline @play="webcam_ready = true;" ></video>
    <canvas class="hidden" id="app-webcam-canvas"></canvas>
    <canvas class="hidden" id="app-manipulation-canvas"></canvas>
    <canvas class="hidden" id="app-background-canvas"></canvas>
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
import Processing from "@/components/processing";
import ViewerPlayerControl from "@/components/ViewerPlayerControl";
import MediaRecorder from "@/components/MediaRecorder";
import CalculateFps from "@/components/CalculateFps";

import "@/lib/animationframecheck.js";
import { makeSegModel } from "@/lib/segmodel.js";
import { makeWebcam } from "@/lib/utils.js";
import { drawVideo, copyCanvas, resizeCanvasToFit } from "@/lib/canvasfunctions.js";

export default {
  name: "App",
  components: {
    Error,
    BespokeFooter,
    Navbar,
    Processing,
    ViewerPlayerControl,
    MediaRecorder,
    CalculateFps,
  },

  data: function() {
    return {
      full_frame_rendered: false,

      has_error: false,
      error_message: null,
      error: null,

      webcam_ready: false,
      webcam_user_facing: false,
      webcam_audio_track: null,

      segmentor: null,

      do_resize: true,
      allow_recording: true,
      is_recording: false,
      is_processing_recording: false,
      fps: null,
    };
  },

  mounted: function() {
    try {
      window.onresize = () => { this.do_resize = true; }
      this.init();
      this.render();

      const urlSearchParams = new URL(window.location.href).searchParams;
      var use_selfie = true; var use_bodypix = true;
      if (urlSearchParams.has("selfie")) {
        use_selfie = true; use_bodypix = false;
      } else if (urlSearchParams.has("bodypix")) {
        use_selfie = false; use_bodypix = true;
      }
      makeSegModel(use_selfie, use_bodypix)
      .then((segmodel) => { 
        this.segmentor = segmodel; 
        this.allow_recording = (this.segmentor.model === "Selfie")
                            || (this.segmentor.model === "bodypix");
      })
      .catch((e) => { this.on_error("Error in mounted:makeSegModel", e);});

    } catch (e) {
      this.on_error("Error in mounted", e);
    }
  },

  methods: {
    video: function() { return document.getElementById("app-webcam-video"); },
    video_canvas: function() { return document.getElementById("app-webcam-canvas"); },
    manipulation_canvas: function() { return document.getElementById("app-manipulation-canvas"); },
    render_canvas: function() { return document.getElementById("render-canvas"); },
    background_canvas: function() { return document.getElementById("app-background-canvas"); },

    is_ready: function() {
      return (this.webcam_ready && (! this.has_error));
    },

    init: function() {
      try {
        makeWebcam({audio: true, video: {facingMode: "environment"}})
        .then((media_stream) => { 
           this.webcam_audio_track = media_stream.getAudioTracks()[0];
           const settings = media_stream.getVideoTracks()[0].getSettings();
           this.webcam_user_facing = (settings.facingMode === undefined) || (settings.facingMode.includes('user'));
           this.video().srcObject = media_stream;
           this.video().play();
        })
        .catch((e) => {this.on_error("Error in init::this.webcam()", e);});

      } catch (e) {
        this.on_error("Error in init", e);
      }
    },

    render: async function() {
      try {
        if (this.is_ready()) {
          // Convert video to canvas
          var vc = drawVideo(this.video(), this.video_canvas(), this.webcam_user_facing);

          if (vc.width > 0 && vc.height > 0) {

            var canvas = this.render_canvas();
            if (this.do_resize) { canvas = resizeCanvasToFit(canvas, {width: vc.width, height: vc.height}); }
            var ctx = canvas.getContext('2d');

            var to_draw = null
            if ((this.segmentor !== null) && this.full_frame_rendered) {
              // Render segmented frame
              const r = await this.segmentor.send(vc);
              var mc = this.manipulation_canvas();
              mc.width = vc.width; mc.height = vc.height;
              var mc_ctx = mc.getContext('2d');
              mc_ctx.save();
              mc_ctx.clearRect(0, 0, mc.width, mc.height);
              mc_ctx.drawImage(r.image, 0, 0, mc.width, mc.height);
              mc_ctx.globalCompositeOperation = 'destination-out';
              mc_ctx.drawImage(r.segmentationMask, 0, 0, mc.width, mc.height);
              mc_ctx.globalCompositeOperation = 'destination-over';
              mc_ctx.drawImage(this.background_canvas(), 0, 0, mc.width, mc.height);
              mc_ctx.restore();
              
              to_draw = mc;

            } else {
              // Render normal frame
              this.full_frame_rendered = true;
              to_draw = vc;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(to_draw, 0, 0, canvas.width, canvas.height);
            copyCanvas(canvas, this.background_canvas());
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText("Made at video-mash.com", 2, 12);

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
     * Record
     */
    record: function() {
      try {
        this.is_recording = true;
        var stream = this.render_canvas().captureStream(30); // fps
        if (this.webcam_audio_track) { stream.addTrack(this.webcam_audio_track); }
        this.$refs.media_recorder.record(stream);

      } catch(e) {
        this.on_error("Error in record", e);
      }
    },

    /*
     * stop recording
     */
    stop: function() {
      try {
        this.is_recording = false;
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

