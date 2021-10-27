<template>
  <div id="app">
    <Navbar></Navbar>

    <div class="py-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-extrabold leading-6 text-gray-900">
        Video-Mash
      </h1>

      <div class="max-w-3xl mx-auto mt-12">
        <p class="mt-3 text-base text-gray-500">
          Similarly to a lot of people, I have been working from home for the best part of the last 18 months. During that time I noticed that during video calls one would point to the screen to show the point they are trying to make. This works great in face to face, but not so much in a video call.
        </p>
        <p class="mt-3 text-base text-gray-500">
I got together with a friend of mine to look at how to overlap someone's image over the screen sharing as a way of allowing for such interaction to take place. The brief included "the setup should be easy so that a dad could install and use it". We looked into it.  The largest hurdle was to create a virtual webcam feed to broadcast the manipulated screen share and webcam feed.
        </p>
        <p class="mt-3 text-base text-gray-500">
MS Teams released the presenter mode feature - see <a href="https://www.theverge.com/2021/3/2/22308927/microsoft-teams-presenter-mode-powerpoint-live-features">this article for example</a>...
        </p>
        <p class="mt-3 text-base text-gray-500">
So we went for something a little more fun and less practical using the <a href="https://google.github.io/mediapipe/solutions/selfie_segmentation.html">selfie segmentation model from MediaPipe</a>, a model that "segment the prominent humans in the scene". It is used in different fashion to demonstrate how it can be combined for different effects.
        </p>
        <p class="mt-3 text-base text-gray-500">
        </p>
      </div>

      <div class="max-w-5xl mx-auto mt-12 grid gap-16 pt-12 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12">
        <div>
          <div>
            <a href="/weatherforecast.html" class="inline-block">
              <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                Weather Forecast
              </span>
            </a>
          </div>
          <a href="/weatherforecast.html" class="block mt-4">
            <p class="text-xl font-semibold text-gray-900">
              Have you ever wanted to present the weather forecast?
            </p>
            <p class="mt-3 text-base text-gray-500">
              This is the opportunity to try out being a weather forecast presenter for today's UK weather.<br/>
              The segmentation model is used to superimpose you on today's UK <a href="https://www.metoffice.gov.uk/weather/videos">met office weather forecast video</a>. 
              The weather forecast script is provided
              alongside the vide to allow you to read it aloud whilst you are presenting it. Record yourself and share the result... and maybe,
              who knows, you might get spotted and offered the job one day.
            </p>
          </a>
          <div class="mt-6 flex items-center">
            <a href="/weatherforecast.html">Load the page</a>
          </div>
        </div>

        <div>
          <div>
            <a href="/demo.html" class="inline-block">
              <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                Demo
              </span>
            </a>
          </div>
          <a href="/demo.html" class="block mt-4">
            <p class="text-xl font-semibold text-gray-900">
              Demonstration of segmentation model
            </p>
            <p class="mt-3 text-base text-gray-500">
              This page demonstrate how the <a href="https://google.github.io/mediapipe/solutions/selfie_segmentation.html">MediaPipe selfie segmentation model</a> works.<br/>
              The selfie segmentation model allows the identification and segmentation of prominent human(s) in the scene. It reports a mask highlighting the areas representing significant humans. A similar technique is likely to be used in MS Teams's background effects.<br/>
              This model is used throughout this website to extract prominent human(s) in webcam and video feeds. The prominent human(s) are referred to as foreground - ie the action taking place - and the remaining of the images as background - the setting of the action.
            </p>
          </a>
          <div class="mt-6 flex items-center">
            <a href="/demo.html">Load the page</a>
          </div>
        </div>

        <div>
          <div>
            <a href="/insertme.html" class="inline-block">
              <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                Video bombing
              </span>
            </a>
          </div>
          <a href="/insertme.html" class="block mt-4">
            <p class="text-xl font-semibold text-gray-900">
              Bomb an existing video
            </p>
            <p class="mt-3 text-base text-gray-500">
              This application uses the selfie segmentation model in two separate ways.<br/>
              Select a video from the very small selection of videos or select one of your own - the video stays on your computer or smartphone. There is no upload, everything is processed locally. The video will be treated by the selfie segmentation model to extract the foreground/prominent character(s) from the background.<br/>
              Your webcam feed is used in a similar process to extract the prominent character(s).<br/>
              During the rendering, the two video feeds are mixed in so that the prominent characters from the webcam feed are inserted in the background of the video - as a layer between the video background and foreground.<br/>
              This way you become part of the scene.<br/>
              It works best with reasonably static scene.
            </p>
          </a>
          <div class="mt-6 flex items-center">
            <a href="/insertme.html">Load the page</a>
          </div>
        </div>

        <div>
          <div>
            <a href="/actionathome.html" class="inline-block">
              <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Action transposing
              </span>
            </a>
          </div>
          <a href="/actionathome.html" class="block mt-4">
            <p class="text-xl font-semibold text-gray-900">
              Transpose the action in your surrounding
            </p>
            <p class="mt-3 text-base text-gray-500">
              This is a slightly simpler use of the selfie segmentation model that works best using the back camera on a smartphone.<br/>
              Select a video from the selection or select on of your own - all processing happens locally, the video is not uploaded anywhere. The video is processed to extract the foreground/prominent characters.<br/>
              The treated foreground is then superposed on the webcam feed giving the opportunity for the video action to happens in a settings of your own choosing!<br/>
              There is a future plan to set the video location to give it a bit more of an AR feel - but that's for the future...
            </p>
          </a>
          <div class="mt-6 flex items-center">
            <a href="/actionathome.html">Load the page</a>
          </div>
        </div>
      </div>
    </div>

    <BespokeFooter></BespokeFooter>
  </div>
</template>

<script>
import Navbar from "@/components/navbar";
import BespokeFooter from "@/components/bespokefooter";

export default {
  name: "App",
  components: {
    Navbar,
    BespokeFooter,
  },
};
</script>

