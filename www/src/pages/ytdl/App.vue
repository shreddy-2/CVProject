<template>
  <div id="app">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
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

      <button type="button" class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" @click="load()">
          Load
      </button>
      
      <div :class="{hidden: ! has_video_url}">
        <video controls id="video"></video>
      </div>
      
    </div>
  </div>
</template>

<script>
import Video from "@/lib/video";


export default {
  name: "App",
  components: {
  },

  data: function() {
    return {
      youtube_url: null,
      has_video_url: false,
    };
  },

  mounted: function() {
  },
  
  methods: {
    load: function() {
      Video.from_YouTube(this.youtube_url)
      .then(video => {this.on_video(video);})
      .catch(e => {this.on_error("Unable to find youtube url", e);});
    },

    on_video: function(video) {
      console.log("handling video", video.info);
      var source = document.createElement('source');
      source.setAttribute('src', video.url);
      source.setAttribute('type', 'video/mp4');
      this.video().appendChild(source);
      this.has_video_url = true;
    },

    video: function() {
      return document.getElementById('video');
    },
    on_error: function(msg, e) {
      console.log("Error: ", msg, e);
    }
  }
};
</script>

