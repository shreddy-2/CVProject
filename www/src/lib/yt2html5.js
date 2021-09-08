import axios from 'axios';

function data(videoId) {
  return new Promise((resolve, reject) => {
    axios.get(`https://yt2html5.com/?id=${videoId}`)
	  .then(resolve)
	  .catch(reject);
  });
}

function url_720p(videoId) {
  return new Promise((resolve, reject) => {
    data(videoId)
	  .then((data) => {
		  console.log("url: ", data);
		  const f = data.data.data.formats.find((f) => (f.qualityLabel === "720p") && f.hasVideo && f.hasAudio);
		  if (f === undefined) {reject(`Unable to retrieve 720p video for video id ${videoId}.`);}
		  console.log(f);
		  resolve(f.url);
	  })
	  .catch(reject);
  });
}


export default {
	data,
	url_720p,
}
