<template>
  <div id="app">
    <Navbar></Navbar>

    <div class="py-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-extrabold leading-6 text-gray-900">
        Video-Mash
      </h1>

      <div class="max-w-3xl mx-auto mt-12">
        <p class="mt-3 text-base text-gray-500">
          I have been working from home for a while and have used MS Teams' blurry background effect.
I got together with a friend of mine to look at how it was done and how the technique could be applied in other contexts.
        </p>
        <p class="mt-3 text-base text-gray-500">
This website uses the <a href="https://google.github.io/mediapipe/solutions/selfie_segmentation.html">selfie segmentation model from MediaPipe</a>, a model that "segment the prominent humans in the scene". It is used in different fashion to demonstrate how it can be combined for different effects.
        </p>
      </div>

      <div class="max-w-5xl mx-auto mt-12 grid gap-16 pt-12 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12">
        <div>
          <div>
            <a href="/weatherforecast.html" class="inline-block">
              <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Ghosting
              </span>
            </a>
          </div>
          <a href="/ghosting.html" class="block mt-4">
            <p class="text-xl font-semibold text-gray-900">
              Try video ghosting
            </p>
            <p class="mt-3 text-base text-gray-500">
              This makes for a strange and unsettling effect...<br/>
              People in the foreground of the video are removed and replaced what's available in the previous frame leaving a trail or an
              outline of there presence.
            </p>
          </a>
          <div class="mt-6 flex items-center text-gray-900">
            <a href="/ghosting.html">Open</a>
          </div>
        </div>

        <div>
          <div>
            <a href="/weatherforecast.html" class="inline-block">
              <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Weather Forecast
              </span>
            </a>
          </div>
          <!-- a href="#weatherforecast.html" class="block mt-4" -->
          <a href="#" class="block mt-4">
            <p class="text-xl font-semibold text-gray-900">
              <i>Work-in-progress</i> - Have you ever wanted to present the weather forecast?
            </p>
            <p class="mt-3 text-base text-gray-500">
              This is the opportunity to try out being a weather forecast presenter for today's UK weather.<br/>
              The segmentation model is used to superimpose you on today's UK <a href="https://www.metoffice.gov.uk/weather/videos">met office weather forecast video</a>. 
              The weather forecast script is provided
              alongside the vide to allow you to read it aloud whilst you are presenting it. Record yourself and share the result... and maybe,
              who knows, you might get spotted and offered the job one day.
            </p>
          </a>
          <div class="mt-6 flex items-center text-gray-900">
            <!-- a href="/weatherforecast.html">Load the page</a -->
            <a href="#">Coming soon (hopefully)</a>
          </div>
        </div>

        <!-- div>
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
          <div class="mt-6 flex items-center text-gray-900">
            <a href="/demo.html">Open</a>
          </div>
        </div -->

        <!-- div>
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
          <div class="mt-6 flex items-center text-gray-900">
            <a href="/insertme.html">Open</a>
          </div>
        </div -->

        <div>
          <div>
            <a href="/actionathome.html" class="inline-block">
              <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Action Transposing
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
          <div class="mt-6 flex items-center text-gray-900">
            <a href="/actionathome.html">Open</a>
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

