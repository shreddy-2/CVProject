
export class Webcam {
	#options;
	#media_stream;

	#oncanplay;
	#onimage;
	#onerror;

	#video;
	#canvas;
	#running;
	#userFacing;

	constructor(options = {audio: false, video: {facingMode: "environment"}}) {
		this.#options = options;
		this.#media_stream = null;
		this.#oncanplay = null;
		this.#onimage = null;
		this.#onerror = (e) => {console.log(e); throw Error("Error whilst running Webcam");};
		this.#userFacing = false;

		this.#video = document.createElement('video');
		this.#video.muted = true;
		this.#video.style.display = 'none';
		document.body.appendChild(this.#video);

		this.#canvas = document.createElement('canvas');
		this.#canvas.style.display = 'none';
		document.body.appendChild(this.#canvas);

		this.#running = false;
	}

	destroy() {
		this.#video.remove();
		this.#canvas.remove();
	}

	get audio_track() { 
		return (this.#media_stream ? this.#media_stream.getAudioTracks()[0] : null);
	}
	get width()      { return this.#video.videoWidth;}
	get height()     { return this.#video.videoHeight;}
	set oncanplay(f) { this.#oncanplay = f; }
	set on_result(f) { this.#onimage = f; }
	set onimage(f)   { this.#onimage = f; }
	set onerror(f)   { this.#onerror = f; }

	load() {
		return new Promise((resolve, reject) => {
		  navigator.mediaDevices.getUserMedia(this.#options)
		  .then((media_stream) => {
			  this.#media_stream = media_stream;
			  console.log("audio tracks:", media_stream.getAudioTracks());
			  // this.#userFacing = media_stream.getVideoTracks()[0].getSettings().facingMode.includes('user');
			  const settings = media_stream.getVideoTracks()[0].getSettings();
			  if (settings.facingMode === undefined) {
				  this.#userFacing = true; // This is an assumption
			  } else {
				  this.#userFacing = settings.facingMode.includes('user');
			  }

			  this.#video.srcObject = media_stream;
			  this.#video.oncanplay = () => {
				  if (this.#oncanplay !== null) {this.#oncanplay();}
				  this.#canvas.width = this.#video.videoWidth;
				  this.#canvas.height = this.#video.videoHeight;
			  };
			  this.#video.play();
			  resolve();
		  })
		  .catch(reject)
		});
	}

	isUserFacing() {
		return this.#userFacing;
	}

	start() {
		this.#running = true;
		this.run();
	}

	stop() {
		this.#running = false;
	}

	run() {
		if (this.#media_stream === null) {this.#onerror(Error("Webcam is not ready"));}
		if (this.#running) {
			let ctx = this.#canvas.getContext('2d');
			if (this.isUserFacing()) {
				ctx.save();
				ctx.translate(this.#canvas.width, 0);
				ctx.scale(-1, 1);
				ctx.drawImage(this.#video, 0, 0, this.#canvas.width, this.#canvas.height);
				ctx.restore();
			} else {
				ctx.drawImage(this.#video, 0, 0, this.#canvas.width, this.#canvas.height);
			}
			const data = ctx.getImageData(0, 0, this.#canvas.width, this.#canvas.height);
			createImageBitmap(data)
			.then((bmp) => {
				if (this.#onimage !== null) {this.#onimage({image: bmp});}
				setTimeout(() => {this.run();}, 0);
			})
			.catch(this.#onerror);
		}
	}
}
