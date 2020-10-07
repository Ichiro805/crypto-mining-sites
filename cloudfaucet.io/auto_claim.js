let claimMinutes = 45;

let minute = 60 * 1000;

let claimSleepTime = claimMinutes * minute;

async function run() {
	do {
		await startClaiming();
	} while (true);
}

async function startClaiming() {
	// do not let the monitor to go and sleep
	sleepMonitor.prevent();
	
	// select the currency
	var btcButton = findButtonByClassName("bitcoin-faucet-button tipso_style");
	if (btcButton) {
		btcButton.click();
	}
	
	// let the page load its stuff
	await sleep(2000);
	
	// collect the amount
	var collectButton = findLinkByName("Collect");
	if (collectButton) {
		collectButton.click();
	}
	
	// let the page show the captcha solver
	await sleep(2000);
	
	// solve the I am not a robot captcha
	var captchaDiv = document.getElementsByClassName("recaptcha-checkbox-border")[0];
	if (captchaDiv){
		captchaDiv.click();
	}
	
	// sleep for 45 minutes since this is next time we are allowed to claim
	await sleep(claimSleepTime);
}

function findLinkByName(name) {
	var markupButtons = document.getElementsByTagName("a");

	var linkButton;

	for (var i = markupButtons.length - 1; i >= 0; i--) {
		if (markupButtons[i].innerHTML.includes(name)) {
			linkButton = markupButtons[i];
			break;
		}
	}
	
	return linkButton;
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

function findButtonByClassName(classes) {
	var buttons = document.getElementsByClassName(classes);
	
	return result[0];
}

function sleep(ms) {
	console.error("Sleeping");
	return new Promise(resolve => setTimeout(resolve, ms));
}

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
