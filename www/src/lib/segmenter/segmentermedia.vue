<template>
  <div>
  </div>
</template>

<script>
export default {
  name: "SegmenterMedia",
  props: {
    media: Object,
  },
  data: function() {
    return {};
  },
  mounted: function() {
    this.media.oncanplay = () => { this.$emit("onready"); };
    this.media.onimage = (r) => { this.$emit("onimage", r); };
    this.media.onerror = (e) => { this.on_error("Media error", e); };
    this.media.load()
    .catch((e) => {this.on_error("Unable to load media", e);});
  },
  methods: {
    on_error: function(msg, e) {
     this.$emit("onerror", {type: "SegmenterMedia error", msg, e});
    }
  }
};
</script>
