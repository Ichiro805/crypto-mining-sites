(function(){
	joinChats();
    setInterval(run_bot, 25000);
})();

function run_bot() {
	setTimeout(closeEmoji, 5000);
	setTimeout(goToChannelOrGroup, 5000);
	setTimeout(joinChannelOrGroup, 5000);
	setTimeout(zecChannel, 5000);
	setTimeout(joined, 5000);
}

function unmute() {
	
}

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
		console.log("Clicking joined button");
		joinedButton.click();
	}
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
		console.log("open zec channel");
		triggerMouseEvent (zecBotChannel, "mousedown");
	}
}

function joinChannelOrGroup() {
	// find join channel button and join the channel
	var joinButton = document.getElementsByClassName("btn btn-primary im_start_btn")[0];
	if (joinButton) {
		console.log("join channel/group");
		joinButton.click();
	}
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
		console.log("Clicking Join chats button");
		joinChatsButton.click();
	}
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
		console.log("Opening channel/group");
		channelButton.click();
	}
}
	
function closeEmoji() {
	// find emoji button and trigger mouse click
	var emojiButton = document.getElementsByClassName("composer_keyboard_btn active");
	if (emojiButton[0]) {
		console.log("Clicking emoji button");
		triggerMouseEvent (emojiButton[0], "mousedown");
	}
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