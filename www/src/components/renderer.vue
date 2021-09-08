<template>
  <div class="absolute inset-0">
    <canvas class="object-none object-center bg-gray-100" id="renderer-canvas"></canvas>
  </div>
</template>

<script>

export default {
  name: "Renderer",
  props: {
    background_bitmap: Object,
    foreground_bitmap: ImageBitmap,
    insert_bitmap: Object,
  },
  mounted: function() {
    this.resize_canvas();
    window.onresize = () => {this.resize_canvas();};
  },
  beforeUpdate: function() {
    console.log("beforeUpdate");
    this.draw();
  },
  methods: {
    resize_canvas: function() {
      var c = this.canvas();
      c.width = c.parentNode.clientWidth;
      c.height = c.parentNode.clientHeight;
    },
    canvas: function() {
      return document.getElementById("renderer-canvas");
    },
    draw: function() {
      var c = this.canvas();
      var ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);
      if (this.background_bitmap) {ctx.drawImage(this.background_bitmap, 0, 0, c.width, c.height);}
      if (this.insert_bitmap) {ctx.drawImage(this.insert_bitmap, 0, 0, c.width, c.height);}
      if (this.foreground_bitmap) {ctx.drawImage(this.foreground_bitmap, 0, 0, c.width, c.height);}
    }
  }
};
</script>

