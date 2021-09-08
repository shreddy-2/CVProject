import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

class ExtractionResult {
  image;
  mask;

  constructor(result) {
    this.image = result.image;
    this.mask = result.segmentationMask;
  }
};

var segmentation = null;

async function extract(img) {
  if (segmentation === null) {
    segmentation = new SelfieSegmentation({locateFile: (file) => {return `/assets/mediapipe/selfie_segmentation/${file}`;}});
    segmentation.setOptions({ modelSelection: 1 });
  }
  var res = null;
  segmentation.onResults((results) => { res = new ExtractionResult(results); });
  await segmentation.send({image: img});
  if (res === null) { throw Error("Unable to perform extraction on the image provided", img); }
  return res;
}

export default {
	extract,
};
