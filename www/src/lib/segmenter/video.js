
export class Video {
	#video;
	#canvas;
	#mediaStream;

	#onimage;
	#onerror;

	#running;

	constructor(url) {
		this.#onerror = (e) => {console.log(e); throw Error("Error whilst running Video");};
		try {
			this.#mediaStream = null;
			this.#video = document.createElement('video');
			this.#video.style.display = 'none';
			let source = document.createElement('source');
			source.setAttribute('src', url);
			this.#video.crossOrigin = "anonymous";
			this.#video.appendChild(source);
			document.body.appendChild(this.#video);

			this.#canvas = document.createElement('canvas');
			this.#canvas.style.display = 'none';
			document.body.appendChild(this.#canvas);

			this.#onimage = null;

			this.#running = false;
		} catch (e) {
			this.#onerror(e);
		}
	}

	destroy() {
		this.#video.remove();
		this.#canvas.remove();
	}

	get media()      { return this.#video; }
	get media_stream() { if (this.#mediaStream === null) {this.#mediaStream = this.#video.captureStream();} return this.#mediaStream; }
	get audio_track() { return (this.media_stream ? this.media_stream.getAudioTracks()[0] : null); }
	// get duration()   { return this.#video.duration; }
	// get currentTime()   { return this.#video.currentTime; }

	get width()      { return this.#video.videoWidth; }
	get height()     { return this.#video.videoHeight; }
	set oncanplay(f) { this.#video.oncanplay = f; }
	set onimage(f)   { this.#onimage = f; }
	set onerror(f)   { this.#onerror = f; }

	mute() { this.#video.muted = true; return this; }
	unmute() { this.#video.muted = false; return this; }

	load() {
		return new Promise((resolve) => {
			this.#video.load();
			resolve();
		});
	}

	start() {
		try {
			this.#running = true;
			this.#canvas.width = this.#video.videoWidth;
			this.#canvas.height = this.#video.videoHeight;
			this.run();
			this.#video.play();
		} catch (e) {
			this.#onerror(e);
		}
	}

	stop() {
		try {
			this.#running = false;
			this.#video.pause();
		} catch (e) {
			this.#onerror(e);
		}
	}

	run() {
		try {
			if (this.#running) {
				const ctx = this.#canvas.getContext('2d');
				ctx.drawImage(this.#video, 0, 0, this.#canvas.width, this.#canvas.height);
				const data = ctx.getImageData(0, 0, this.#canvas.width, this.#canvas.height);
				createImageBitmap(data)
				.then((bmp) => {
					if (this.#onimage !== null) {this.#onimage({image: bmp});}
					setTimeout(() => {this.run();}, 0);
				})
				.catch(this.#onerror);

			}
		} catch (e) {
			this.#onerror(e);
		}
	}
}

