<template>
  <div> <!--  class="absolute inset-0" -->
     <div class="absolute inset-0">
       <canvas class="object-none mx-auto my-auto by-gray-500" id="segmenter-player-canvas-renderer"></canvas>
      </div>

    <!-- Controls -->
      <div class="absolute bottom-0 left-0 right-0 mx-auto bg-gray-400" v-if="controls">
        <div class="flex pb-1 pl-2 pr-2 justify-between">
          <div class="flex-none flex items-end">
            <!-- Record button -->
            <a href="#" @click="$emit('on_record')" :class="{'hidden': (is_playing || (! allow_recording))}"><IconRecord c="h-10 w-10" /></a>
            <!-- Play button -->
            <a href="#" @click="$emit('on_start')" :class="{'hidden': is_playing}"><IconPlay c="h-10 w-10" /></a>
            <!-- Stop button -->
            <a href="#" @click="$emit('on_stop')" :class="{'hidden': ! is_playing}"><IconStop c="h-10 w-10" /></a>
            <!-- Restart -->
            <a href="#" @click="$emit('on_restart')" :class="{'hidden': video_current_time < 1}"><IconRewind c="h-10 w-10" /></a>
          </div>
          <div class="flex-auto text-center">
            {{ to_mmss(video_current_time) }}/{{ to_mmss(video_duration) }}
          </div>
          <div class="flex-none flex">
            <!-- Annotation 
            <a href="#">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
            </a> -->
            <!-- Settings 
            <a href="#"><IconSettings c="h-10 w-10" /></a>
-->
            <!-- Instructions -->
            <a href="#" @click="show_instruction_modal = true;"><IconHelp c="h-10 w-10" /></a>
          </div>
        </div>
      </div>
    <!-- Controls ** End -->

    <!-- Instruction step -->
   <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="show_instruction_modal">
     <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
       <!--
         Background overlay, show/hide based on modal state.

         Entering: "ease-out duration-300"
           From: "opacity-0"
           To: "opacity-100"
         Leaving: "ease-in duration-200"
           From: "opacity-100"
           To: "opacity-0"
       -->
       <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

       <!-- This element is to trick the browser into centering the modal contents. -->
       <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

       <!--
         Modal panel, show/hide based on modal state.

         Entering: "ease-out duration-300"
           From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
           To: "opacity-100 translate-y-0 sm:scale-100"
         Leaving: "ease-in duration-200"
           From: "opacity-100 translate-y-0 sm:scale-100"
           To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
       -->
       <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
         <div>
           <div class="mt-3 text-center sm:mt-5">
             <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
               Instructions
             </h3>
             <div class="mt-2">
               <p class="text-sm text-gray-500">
                 This page allows you to present the weather forecast. Use the following command:
               </p>
               <div class="flex flex-col">
                 <div class="flex flex-row items-center" v-if="allow_recording">
                   <div class="flex-none">
                     <IconRecord c="h-10 w-10" />
                   </div>
                   <div class="text-sm text-gray-500 ml-3">Play and record the video.</div>
                 </div>

                 <div class="flex flex-row items-center">
                   <div class="flex-none">
                     <IconPlay c="h-10 w-10" />
                   </div>
                   <div class="text-sm text-gray-500 ml-3">Play without recording.</div>
                 </div>

                 <div class="flex flex-row items-center">
                   <div class="flex-none">
                     <IconStop c="h-10 w-10" />
                   </div>
                   <div class="text-sm text-gray-500 ml-3">Stop playing or recording.</div>
                 </div>

                 <div class="flex flex-row items-center">
                   <div class="flex-none">
                     <IconRewind c="h-10 w-10" />
                   </div>
                   <div class="text-sm text-gray-500 ml-3">Rewind to the start.</div>
                 </div>

<!--
                 <div class="flex flex-row items-center">
                   <div class="flex-none">
                     <IconSettings c="h-10 w-10" />
                   </div>
                   <div class="text-sm text-gray-500 ml-3">Show settings.</div>
                 </div>
-->

                 <div class="flex flex-row items-center">
                   <div class="flex-none">
                     <IconHelp c="h-10 w-10" />
                   </div>
                   <div class="text-sm text-gray-500 ml-3">Show instructions.</div>
                 </div>

               </div>
             </div>
           </div>
         </div>
         <div class="mt-5 sm:mt-6">
           <button type="button" class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
             @click="show_instruction_modal = false;"
             >
             Ok
           </button>
         </div>
       </div>
     </div>
   </div>
    <!-- Instruction step ** End -->

    <!-- Download recording -->
   <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" v-if="recording_url !== null">
     <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
       <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

       <!-- This element is to trick the browser into centering the modal contents. -->
       <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

       <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
         <div>
           <div class="mt-3 text-center sm:mt-5">
             <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
               Recording
             </h3>
             <div class="mt-2">
               <p class="text-sm text-gray-500">
                 <a :href="recording_url" download="video.webm">Download recording</a>
               </p>
             </div>
           </div>
         </div>
         <div class="mt-5 sm:mt-6">
           <button type="button" class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
             @click="close_recording();"
             >
             Close
           </button>
         </div>
       </div>
     </div>
   </div>
    <!-- Download recording ** End -->

  </div>
</template>

<script>
import IconRecord from "./icons/iconrecord";
import IconPlay from "./icons/iconplay";
import IconStop from "./icons/iconstop";
import IconRewind from "./icons/iconrewind";
// import IconSettings from "./icons/iconsettings";
import IconHelp from "./icons/iconhelp";

export default {
  name: "SegmenterPlayer",
  components: {
    IconRecord,
    IconPlay,
    IconStop,
    IconRewind,
    // IconSettings,
    IconHelp,
  },
  props: ['image_back', 'image_middle', 'image_front', 'audio_track',
          'controls', 'video_current_time', 'video_duration', 'allow_recording'], 

  data: function() {
    return {
      is_playing: false,
      has_error: false,
      media_recorder: null,
      show_instruction_modal: true,
      recording_url: null
    };
  },

  mounted: function() {
    this.is_playing = false;
    this.has_error = false;

    this.resize();
    window.onresize = this.resize;
  },

  methods: {
    /*
     * Convert number (seconds) to a formatted string mm:ss
     */
    to_mmss: function(seconds) {
      const ss = seconds % 60;
      const mm = Math.floor((seconds - ss) / 60);
      return mm.toFixed(0) + ":" + ss.toFixed(0).padStart(2, '0');
    },

    /*
     * Resize
     */
    resize: function() {
      console.log("SegmenterPlayer: resize");
      let c = this.renderer();
      c.width = c.parentNode.clientWidth;
      c.height = c.parentNode.clientHeight;
    },

    /*
     * close recording
     */
    close_recording: function() {
      URL.revokeObjectURL(this.recording_url);
      this.recording_url = null;
    },

    /*
     * Record
     */
    record: function() {
      var chunks = [];
      var stream = this.renderer().captureStream(30); // fps
      if (this.audio_track) { stream.addTrack(this.audio_track); }
      this.media_recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
      this.media_recorder.ondataavailable = (evt) => { chunks.push(evt.data); };
      this.media_recorder.onstop = () => {
            var blob = new Blob(chunks, {type: "video/webm" });
            this.recording_url = URL.createObjectURL(blob);
            this.media_recorder = null;
      };

      this.is_playing = true;
      this.render();
      this.media_recorder.start(1000);
    },

    /*
     * Play
     */
    start: function() {
      this.is_playing = true;
      this.render();
    },

    /*
     * Stop
     */
    stop: function() {
      this.is_playing = false;
      if (this.media_recorder) { this.media_recorder.stop(); }
    },

    renderer: function() {
      return document.getElementById("segmenter-player-canvas-renderer");
    },

    /*
     * Render
     */
    render: function() {
      if (this.is_playing && ! this.has_error && this.image_back) {
        var c = this.renderer();
        var ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);

        const ibf = this.fit_image(this.image_back, c);
        ctx.drawImage(this.image_back, 
                      0.5*(c.width - ibf.width), 
                      0.5*(c.height - ibf.height), 
                      ibf.width, ibf.height);

        for (const img of [this.image_middle, this.image_front]) {
          if (img) {
            const r = this.fit_image(img, ibf);
            ctx.drawImage(img,
                          0.5*(c.width - r.width), 
                          0.5*c.height + 0.5*ibf.height - r.height, 
                          r.width, r.height); 
          }
        }
      }
      window.requestAnimationFrame(this.render);
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
        return {height: target.height, width: w / h * target.height};
      } else {
        return {height: h / w * target.width, width: target.width};
      }
    },



    /*
     * on_error
     */
    on_error: function(msg, e) {
      this.has_error = true;
      this.$emit("error", {msg, e});
    } 
  }
}
</script>
