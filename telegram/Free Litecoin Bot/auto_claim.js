let claimMinutes = 1;

let minute = 60 * 1000;

let claimSleepTime = claimMinutes * minute;

// variable for simply allowing or disallowing the monitor to go and sleep
var sleepMonitor = {
    prevent: function() {
        if (!this._video) {
            this._init();
        }

        this._video.setAttribute('loop', 'loop');
        this._video.play();
    },
    allow: function() {
        if (!this._video) {
            return;
        }

        this._video.removeAttribute('loop');
        this._video.pause();
    },
    _init: function() {
        this._video = document.createElement('video');
        this._video.setAttribute('width', '10');
        this._video.setAttribute('height', '10');
        this._video.style.position = 'absolute';
        this._video.style.top = '-10px';
        this._video.style.left = '-10px';

        var source_mp4 = document.createElement('source');
        source_mp4.setAttribute('src', 'https://github.com/ivanmaeder/computer-sleep/raw/master/resources/muted-blank.mp4');
        source_mp4.setAttribute('type', 'video/mp4');
        this._video.appendChild(source_mp4);

        var source_ogg = document.createElement('source');
        source_ogg.setAttribute('src', 'https://github.com/ivanmaeder/computer-sleep/raw/master/resources/muted-blank.ogv');
        source_ogg.setAttribute('type', 'video/ogg');
        this._video.appendChild(source_ogg);

        document.body.appendChild(this._video);
    },
    _video: null
}

run();

async function run() {
	console.error("Preventing monitor to go to sleep");
	// do not let the monitor to go and sleep
	sleepMonitor.prevent();
	do {
		await startClaiming();
	} while (true);
}

async function startClaiming() {
	var claimButton = findButtonByName("litecoin Bonus");
	if (claimButton) {
		console.error("Claiming");
		claimButton.click();
	}
	
	await sleep(claimSleepTime);
}

function findButtonByName(name) {
	var buttons = document.getElementsByTagName("button");
	var result;

	// for each button find the button with proper name
	for (var i = 0; i < buttons.length; i++) {
	  if (buttons[i].textContent.includes(name)) {
		result = buttons[i];
		break;
	  }
	}
	
	return result;
}


function sleep(ms) {
	console.error("Sleeping");
	return new Promise(resolve => setTimeout(resolve, ms));
}