
export class Video {
	#video;
	#canvas;

	#onimage;
	#onerror;

	#running;

	constructor(video) {
		this.#video = video;
		this.#canvas = document.createElement('canvas');
		this.#canvas.style.display = 'none';
		document.body.appendChild(this.#canvas);

		this.#onimage = null;
		this.#onerror = (e) => {console.log(e); throw Error("Error whilst running Video");};

		this.#running = false;
	}

	destroy() {
		this.#canvas.remove();
	}

	get width() { return this.#video.videoWidth; }
	get height() { return this.#video.videoHeight; }
	set oncanplay(f) { this.#video.oncanplay = f; }
	set onimage(f)   { this.#onimage = f; }
	set onerror(f)   { this.#onerror = f; }

	load() {
		return new Promise((resolve) => {
			this.#video.load();
			resolve();
		});
	}

	start() {
		this.#running = true;
		this.#canvas.width = this.#video.videoWidth;
		this.#canvas.height = this.#video.videoHeight;
		this.run();
		this.#video.play();
	}

	stop() {
		this.#running = false;
		this.#video.pause();
	}

	run() {
		if (this.#running) {
			const ctx = this.#canvas.getContext('2d');
			ctx.drawImage(this.#video, 0, 0, this.#canvas.width, this.#canvas.height);
			const data = ctx.getImageData(0, 0, this.#canvas.width, this.#canvas.height);
			createImageBitmap(data)
			.then((bmp) => {
				if (this.#onimage !== null) {this.#onimage(bmp);}
				setTimeout(() => {this.run();}, 0);
			})
			.catch(this.#onerror);

		}
	}
}

