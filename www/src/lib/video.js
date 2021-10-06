import axios from 'axios';
/*
import ytdl from 'ytdl-core';
import toBlobUrl from 'stream-to-blob-url';
*/

class Video {
  #id;
  #title;
  #quality;
  #height;
  #width;
  #durationInSeconds;
  #playerUrl;
  #fileUrl;
	#hasVideo;
	#hasAudio;
	#mimeType;

  constructor(h) {
    this.#id = h.id;
    this.#title = h.title;
    this.#quality = h.quality;
    this.#height = h.height;
    this.#width = h.width;
    this.#durationInSeconds = h.durationInSeconds;
    this.#playerUrl = h.playerUrl;
    this.#fileUrl = h.fileUrl;
	  this.#hasVideo = h.hasVideo;
	  this.#hasAudio = h.hasAudio;
	  this.#mimeType = h.mimeType;
  }

  get title()             {return this.#title;}
  get durationInSeconds() {return this.#durationInSeconds;}
  get info()              {return {title: this.#title, duration: this.#durationInSeconds};}
  get url()               {return this.#fileUrl;}
  get quality()           {return this.#quality;}
	get hasVideo() { return this.#hasVideo;}
	get hasAudio() { return this.#hasAudio;}
	get mimeType() { return this.#mimeType;}


	/*
  as_blob_url() {
    return toBlobUrl(ytdl(this.#playerUrl));
  }

  fetch_as_blob() {
    return axios.get(this.#fileUrl, {responseType: 'blob'})
    .then(r => r.data);
  }
  */
	/*
  fetch_as_blob() {
    return fetch(this.#fileUrl)
	  .then(r => r.blob());
  }
  */
  
}

	
function from_YouTube(videoId) {
  return new Promise((resolve, reject) => {
    axios.get(`https://yt2html5.com/?id=${videoId}`) 
    .then((data) => {
      console.log("Data from yt2html5: ", data);
      const details = data.data.data.videoDetails;

      let videos = data.data.data.formats
	    .map((f) => {
	      console.log("f -> ", f);
	      return new Video({
	    id: videoId,
	    title: details.title,
	    quality: f.qualityLabel,
	    width: f.width,
	    height: f.height,
	    durationInSeconds: details.lengthSeconds,
	    playerUrl: details.video_url,
	    fileUrl: f.url,
		hasVideo: f.hasVideo,
		hasAudio: f.hasAudio,
		mimeType: f.mimeType
        });});
	    /*
      const f = data.data.data.formats.find((f) => (f.qualityLabel === "720p") && f.hasVideo && f.hasAudio);
      if (f === undefined) {reject(`Unable to retrieve 720p video for video id ${videoId}.`);}
      */
      resolve(videos);
   })
   .catch(reject);
  });
}

export default {
	Video,
	from_YouTube,
}
