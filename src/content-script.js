const added = {};

const process = (videoId) => {
	chrome.storage.local.get(videoId, (res) => {
		const time = res[videoId];
		if (!time) {
			return;
		}
		console.log(time);

		// Select the video element on the YouTube page
		var videoElement = document.querySelector('video');

		if (typeof time.start !== 'undefined') {
			// Set the current time to 80 seconds
			videoElement.currentTime = time.start;
		}

		if (!time.start) {
			time.start = 0;
		}

		if (typeof time.end !== 'undefined') {
			const listener = (e) => {
				const curr = videoElement.currentTime;
				if (curr < time.end) {
					return;
				}
				if (time.loop) {
					videoElement.currentTime = time.start;
					return;
				}

				console.log('============== END ==============');
				videoElement.removeEventListener('timeupdate', listener);

				const isPlaylist = window.location.href.indexOf('list=') !== -1;

				console.log(isPlaylist ? 'NEXT' : 'PAUSE');
				const keyEvent = new KeyboardEvent('keydown', {
					key: isPlaylist ? 'n' : 'k',
					keyCode: isPlaylist ? 78 : 75,
					code: isPlaylist ? 'KeyN' : 'KeyK',
					which: isPlaylist ? 78 : 75,
					shiftKey: isPlaylist ? true : false,
					ctrlKey: false,
					metaKey: false,
				});

				document.dispatchEvent(keyEvent);
			};
			videoElement.addEventListener('timeupdate', listener);
		}
	});
};

function addLocationObserver(callback) {
	// Options for the observer (which mutations to observe)
	const config = { attributes: false, childList: true, subtree: false };

	// Create an observer instance linked to the callback function
	const observer = new MutationObserver(callback);

	// Start observing the target node for configured mutations
	observer.observe(document.body, config);
}

function observerCallback() {
	if (window.location.href.indexOf('youtube.com/watch') === -1) {
		console.log('not yt');
		return;
	}

	const regex = /[?&]v=([^&#]+)/;
	const match = window.location.href.match(regex);

	const videoId = match && match[1];
	if (!videoId || added[videoId]) {
		return;
	}
	added[videoId] = true;

	process(videoId);
}

addLocationObserver(observerCallback);
observerCallback();
