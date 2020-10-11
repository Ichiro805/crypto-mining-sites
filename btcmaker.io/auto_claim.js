let claimMinutes = 60;

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
	// do not let the monitor to go and sleep
	sleepMonitor.prevent();
	console.error("Preventing monitor to go to sleep");
	do {
		await startClaiming();
	} while (true);
}

async function startClaiming() {
	
	// YOU HAVE TO FILL THE CAPCHA ONLY ONCE AND RUN THE SCRIPT AFTER FILLING THE CAPTCHA
	// THE WEBSITE IS NOT REFRESHING THE CAPTCHA 
	var claimBtn = findButtonByClassName("process_btn");
	if (claimBtn) {
		console.error("Clicking faucet button");
		claimBtn.click();
	}
	
	await sleep(claimSleepTime);
	
	await sleep(5000);
}

function findButtonByClassName(classes) {
	return document.getElementsByClassName(classes)[0];
}

function sleep(ms) {
	console.error("Sleeping");
	return new Promise(resolve => setTimeout(resolve, ms));
}

function process_claim_hourly_faucet() {
	console.error("Called from custom function");
				$("#process_claim_hourly_faucet").attr("disabled", !0);
				var btn_label = $("#process_claim_hourly_faucet").text();
				$("#process_claim_hourly_faucet").text("PLEASE WAIT");
				var captcha = $('#captcha').val();
				$.ajax({
					url: "https://btcmaker.io/process.php",
					type: "POST",
					data: "action=claim_hourly_faucet&captcha="+captcha,
					error: function(){
						$.toast({
							heading: 'Error!',
							text: "Request timed out. Please try again!",
							showHideTransition: 'slide',
							position: 'top-right',
							icon: 'error'
						});
						$("#process_claim_hourly_faucet").attr("disabled", false);
						$("#process_claim_hourly_faucet").text(btn_label);
					},
					success: function(out){
						obj = JSON.parse(out);
						if(obj.ret == 0) {
							$("#process_claim_hourly_faucet").attr("disabled", false);
							$("#process_claim_hourly_faucet").text(btn_label);
							$.toast({
								heading: 'Error!',
								text: obj.mes,
								showHideTransition: 'slide',
								position: 'top-right',
								icon: 'error'
							});
							// Disable refreshing of captcha
							//refresh_captcha();
						} else {	
							setTimeout(function() {
								$("#process_claim_hourly_faucet").attr("disabled", false);
								$("#process_claim_hourly_faucet").text(btn_label);
								$('#faucet_claim').hide();
								$('#faucet_countdown_clock').show();
								clock = new FlipClock($('.clock'), 3600, {
									clockFace: 'MinuteCounter',
									autoStart: true,
									countdown: true,
									callbacks: {
										stop: function() {
											$('#faucet_claim').show();
											$('#faucet_countdown_clock').hide();
										}
									}
								});
								$('.user_balance').text(parseFloat((parseInt(obj.balance)) / 100000000).toFixed(8));
								$.toast({
									heading: 'Success!',
									text: obj.mes,
									showHideTransition: 'slide',
									position: 'top-right',
									icon: 'success'
								});
							}, 100);	
						}
					}
				});
			}
			
