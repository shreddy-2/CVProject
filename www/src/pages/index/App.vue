<template>
  <div id="app">
    <Navbar></Navbar>

    <div class="py-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-extrabold leading-6 text-gray-900">
        CV Project
      </h1>

      <div class="relative max-w-3xl mx-auto mt-12 lg:mt-24 lg:mr-60 text-left">
        <h2 class="text-xl leading-8 font-bold tracking-tight text-gray-900 sm:text-lg">
          <a href="/demo.html">Demo</a>
        </h2>
        <p class="mt-4 mx-auto text-xl text-gray-500">
          This demonstration loads a video and shows how the video and webcam 
          feeds are treated to insert the webcam person(s) into the video background.
        </p>
        <a href="/demo.html">View</a>
      </div>

      <div class="relative max-w-3xl mx-auto mt-12 lg:mt-24 lg:ml-60 text-right">
        <h2 class="text-xl leading-8 font-bold tracking-tight text-gray-900 sm:text-lg">
            <a href="/insertme.html">Insert me in a video</a>
        </h2>
        <p class="mt-4 mx-auto text-xl text-gray-500">
            Description...
        </p>
        <a href="/insertme.html">View</a>
      </div>

      <div class="relative max-w-3xl mx-auto mt-12 lg:mt-24 lg:mr-60 text-left">
        <h2 class="text-xl leading-8 font-bold tracking-tight text-gray-900 sm:text-lg">
          <a href="/actionathome.html">View the action at home</a>
        </h2>
        <p class="mt-4 mx-auto text-xl text-gray-500">
          Description...
        </p>
        <a href="/actionathome.html">View</a>
      </div>

    </div>
  </div>
</template>

<script>
import Navbar from "@/components/navbar";

export default {
  name: "App",
  components: {
    Navbar,
  },
};
</script>

