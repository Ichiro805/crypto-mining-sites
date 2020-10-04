(function(){
	joinChats();
	run_bot();
})();

var NEXT_OPERATION_READY = true;

let totalChannelsJoined = 0;
	
let calledOperations = 0;

var startTime = performance.now();

const earningType = {VISIT_SITE: 0, JOIN_CHANNEL: 1, MESSAGE_BOT: 2};

Object.freeze(earningType);

var controlEarningsType = earningType.JOIN_CHANNEL;
		
function run_bot() {
	window.setInterval(function(){
		switch (controlEarningsType) {
			case earningType.JOIN_CHANNEL:
				joinChannel();
			case earningType.VISIT_SITE:
				visitSite();
			case earningType.MESSAGE_BOT:
				messageBot();
		}
		var timeNow = performance.now();
		console.error("Total execution time of the farm is: " + (timeNow - startTime) / 1000 + " seconds");
	}, 2000);
}

function joinChannel() {
	console.error("Start time: " + getCurrentDateTime());
	console.error("Value of flag is: " + NEXT_OPERATION_READY);
	if (NEXT_OPERATION_READY && validate()) {
		calledOperations++;
		console.error("Called operations: " + calledOperations);
		if (calledOperations % 4 == 0) {
			totalChannelsJoined++;
			console.error("Total channels joined: " + totalChannelsJoined);
			calledOperations = 0;
		}
		callNextOperation();
	}
	console.error("End time: " + getCurrentDateTime());
}

function visitSite() {
	
}

function messageBot() {
	
}

function validate() {
	var result = true;
	var message = document.getElementsByClassName("im_message_text");
	if (message[message.length - 1].innerText.includes("If this message persists, try rejoining the group.") || message[message.length - 1].innerText.includes("If this message persists, try rejoining the channel.") || message[message.length - 1].innerText.includes("You already completed this task.")) {
		skipChannel();
		sleep();
		result = false;
	}
	if (message[message.length - 1].innerText.includes("There is a new chat for you to join!")) {
		joinChats();
		result = false;
	}
	
	if (message[message.length - 1].innerText.includes("Sorry, there are no new ads available.")) {
		console.error("Waiting for new tasks");
		sleep();
		joinChats();
		result = false;
	}
	
	if (!result) {
		zecChannel();
	}
	
	return result;
}

function sleep() {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://localhost:8080/sleep', false);
	request.send(null);
	if (request.status == 200) {
		console.error("Sleeping");
	}
}

function skipChannel() {
	var buttons = document.getElementsByTagName("button");
	var searchText = ":fast_forward: Skip";
	var skipButton;

	// for each button find the button with proper name
	for (var i = 0; i < buttons.length; i++) {
	  if (buttons[i].textContent == searchText) {
		skipButton = buttons[i];
		break;
	  }
	}

	// skip channel
	if (skipButton) {
		console.error("Skipping channel");
		skipButton.click();
	}
	NEXT_OPERATION_READY = true;
}

// Sorry, that task is no longer valid. :worried:
// You already completed this task.
// CHANNEL_INVALID

// FLOOD_WAIT_52915

function joined() {	
	// find joined button and click it
	var afterJoinButtons = document.getElementsByTagName("button");
	var searchText = ":white_check_mark: Joined";
	var joinedButton;

	// for each button find the button with proper name
	for (var i = afterJoinButtons.length - 1; i >= 0; i--) {
	  if (afterJoinButtons[i].textContent == searchText) {
		joinedButton = afterJoinButtons[i];
		break;
	  }
	}

	if (joinedButton) {
		console.error("Clicking joined button");
		joinedButton.click();
	}
	NEXT_OPERATION_READY = true;
}

function zecChannel(){
	// go back to original channel
	var allChannels = document.getElementsByClassName("im_dialog");
	var zecBotChannel;

	for (var i = 0; i < allChannels.length; i++) {
		if (allChannels[i].text.includes("ZEC Click Bot")) {
			zecBotChannel = allChannels[i];
			break;
		}
	}

	// open zec bot channel
	if (zecBotChannel) {
		console.error("open zec channel");
		triggerMouseEvent (zecBotChannel, "mousedown");
	}
	NEXT_OPERATION_READY = true;
}

function joinChannelOrGroup() {
	// find join channel button and join the channel
	var joinButton = document.getElementsByClassName("btn btn-primary im_start_btn")[0];
	if (joinButton) {
		console.error("join channel/group");
		joinButton.click();
	}
	NEXT_OPERATION_READY = true;
}

function joinChats() {
	var buttons = document.getElementsByTagName("button");
	var searchText = ":mega: Join chats";
	var joinChatsButton;

	// for each button find the button with proper name
	for (var i = 0; i < buttons.length; i++) {
	  if (buttons[i].textContent == searchText) {
		joinChatsButton = buttons[i];
		break;
	  }
	}

	// start joining chats
	if (joinChatsButton) {
		console.error("Clicking Join chats button");
		joinChatsButton.click();
	}
	NEXT_OPERATION_READY = true;
}

function goToChannelOrGroup() {
	// find last go to group or join channel button
	var markupButtons = document.getElementsByClassName("btn reply_markup_button");

	var channelButton;

	for (var i = markupButtons.length - 1; i >= 0; i--) {
		if (markupButtons[i].tagName == "A") {
			channelButton = markupButtons[i];
			break;
		}
	}

	// join the group or the channel
	if (channelButton) {
		console.error("Opening channel/group");
		channelButton.click();
	}
	NEXT_OPERATION_READY = true;
}
	
function closeEmoji() {
	// find emoji button and trigger mouse click
	var emojiButton = document.getElementsByClassName("composer_keyboard_btn active");
	if (emojiButton[0]) {
		console.error("Clicking emoji button");
		triggerMouseEvent (emojiButton[0], "mousedown");
	}
	NEXT_OPERATION_READY = true;
}

function triggerMouseEvent (node, eventType) {
	var clickEvent = document.createEvent ('MouseEvents');
	clickEvent.initEvent (eventType, true, true);
	node.dispatchEvent (clickEvent);
}

function callNextOperation(){
	console.error("Requesting next operation..!");
	var request = new XMLHttpRequest();
	request.open('GET', 'https://localhost:8080/zecbot/', false);
	request.send(null);
	if (request.status == 200) {
		var operation = request.responseText;
		console.error("Calling operation: " + operation);
		window[operation]();
	}
}	

function getCurrentDateTime() {
	var today = new Date();
	return today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + ':' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
}

// https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf

// https://addons.mozilla.org/bg/firefox/addon/access-control-allow-origin/
// add certificate in the trusted CA in the browser
//  F:/Installations/Java/1.8.jre/bin/keytool -genkeypair -keyalg RSA -alias selfsigned -keystore zecbot.jks -storepass 14eiuqhwdyeuq* -validity 360 -keysize 2048 -deststoretype pkcs12