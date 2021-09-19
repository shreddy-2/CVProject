
export class Webcam {
	#options;
	#media_stream;
	#oncanplay;
	#onresult;
	#video;
	#canvas;
	#running;
	#userFacing;

	constructor(options = {audio: false, video: {facingMode: "environment"}}) {
		this.#options = options;
		this.#media_stream = null;
		this.#oncanplay = null;
		this.#onresult = null;
		this.#userFacing = false;

		this.#video = document.createElement('video');
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

	get width() {return this.#video.videoWidth;}
	get height() {return this.#video.videoHeight;}
	set oncanplay(f) { this.#oncanplay = f; }
	set on_result(f) { this.#onresult = f; }

	load() {
		return new Promise((resolve, reject) => {
		  navigator.mediaDevices.getUserMedia(this.#options)
		  .then((media_stream) => {
			  this.#media_stream = media_stream;
			  this.#userFacing = media_stream.getVideoTracks()[0].getCapabilities().facingMode.includes('user');
			  console.log(this.#userFacing ? "User facing" : "Environment facing");
			// console.log(this.#media_stream);
			  // console.log(this.#media_stream.getVideoTracks());
			  // console.log(this.#media_stream.getVideoTracks()[0]);
			  // console.log(this.#media_stream.getVideoTracks()[0].getCapabilities());
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
		/*
		if (this.#media_stream !== null) {
			// console.log(this.#media_stream);
			  // console.log(this.#media_stream.getVideoTracks()[0].getCapabilities());
			return this.#media_stream.getVideoTracks()[0].getCapabilities().facingMode.includes('user');
		}
		return false;
		*/
	}

	start() {
		this.#running = true;
		this.run();
	}

	stop() {
		this.#running = false;
	}

	run() {
		if (this.#media_stream === null) {throw Error("Webcam is not ready");}
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
				if (this.#onresult !== null) {this.#onresult(bmp);}
				setTimeout(() => {this.run();}, 0);
			})
			.catch((e) => {throw Error("Unable to extract bitmap from webcam", e);});
		}
	}

 
}
