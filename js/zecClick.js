(function(){
	joinChats();
	run_bot();
})();

var NEXT_OPERATION_READY = true;

function run_bot() {
	window.setInterval(function(){
		console.error("Start time: " + getCurrentDateTime());
		console.error("Value of flag is: " + NEXT_OPERATION_READY);
		if (NEXT_OPERATION_READY) {
			callNextOperation();
		}
		console.error("End time: " + getCurrentDateTime());
	}, 10000);
}

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

function sleep(ms) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < ms);
}

function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    displayContents(contents);
  };
  reader.readAsText(file);
}

function callNextOperation(){
	console.error("Requesting next operation..!");
    // read text from URL location
    var request = new XMLHttpRequest();
    request.open('GET', 'https://localhost:8080/', false);
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