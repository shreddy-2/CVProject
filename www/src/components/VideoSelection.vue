<template>
  <div class="bg-white pt-2 lg:pt-6 pb-2 lg:pb-4">
    <div class="relative max-w-3xl mx-auto text-center">
      <h2 class="text-lg leading-8 font-bold tracking-tight text-gray-900 sm:text-xl">
        Select a video from the list below
      </h2>
    </div>

    <div class="relative max-w-3xl mx-auto mt-2">
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
      </ul>
    </div>


    <div class="relative max-w-3xl mx-auto mt-2 lg:mt-4 text-center">
      <h2 class="text-lg leading-8 font-bold tracking-tight text-gray-900 sm:text-xl">
        Or use your own
      </h2>
    </div>

    <div class="relative max-w-xl mx-auto mt-2">
      <div class="relative text-center mt-2">
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
              <!-- <p class="pl-1">or drag and drop</p> -->
            </div>
            <p class="text-xs text-gray-500">
              MP4 (1 file up to 50MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

const samples = [
  {description: "Demonstration video used in tutorial on manipulating video using canvas - how to perform chroma-keying using JavaScript code.",
   source_url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas",
   video_url: "/assets/videos/video.mp4",
   thumbnail_url: "/assets/videos/thumbnail.png" },
  {description: "John Bishop - We have to trust Boris, John Bishop shares his thoughts on Corona Virus and the UK government",
   source_url: "https://www.youtube.com/watch?v=OOSyTiFRgYU",
   video_url: "https://cdn.video-mash.com/001_JohnBishop-WeHaveToTrustBoris/video.mp4",
   thumbnail_url: "https://cdn.video-mash.com/001_JohnBishop-WeHaveToTrustBoris/thumbnail.png"},
  {description: "Charlie Chaplin - Final Speech from The Great Dictator",
   source_url: "https://www.youtube.com/watch?v=J7GY1Xg6X20",
   video_url: "https://cdn.video-mash.com/002_CharlieChaplin-FinalSpeechfromTheGreatDictator/video.mp4",
   thumbnail_url: "https://cdn.video-mash.com/002_CharlieChaplin-FinalSpeechfromTheGreatDictator/thumbnail.png"},
  {description: "Jonathan Pie - A Fake News Annoucement",
   source_url: "https://www.youtube.com/watch?v=0ciHqupvElM",
   video_url: "https://cdn.video-mash.com/003_JonathanPie-AFakeNewsAnnouncement/video.mp4",
   thumbnail_url: "https://cdn.video-mash.com/003_JonathanPie-AFakeNewsAnnouncement/thumbnail.png"}
];


export default {
  name: "VideoSelection",
  data: function() {
    return {
      samples
    };
  },
  methods: {
    set_video: function(url) {
        this.$emit('video-url', url);
    },

    on_file: function(evt) {
      const files = evt.target.files;
      if (files.length > 1) {
        this.$emit('error', "Multiple files have been selected");
      } else if (! (files[0].type.match(/video\/mp4/))) {
        this.$emit('error', `Selected file is of type ${files[0].type} which is not a supported file type. Supported file types are video/mp4`);
      } else {
        this.$emit('video-url', URL.createObjectURL(files[0]));
      }
    }
    
  }
};
</script>
