(function(){
	run_bot();
})();

var NEXT_OPERATION_READY = true;

let visitedSites = 0;

let totalChannelsJoined = 0;
	
let calledOperations = 0;

let waitingForTasksRetry = 0;

var startTime = performance.now();

var joiningChannels = false;

var visitingSites = true;

let controlVisitedSites = 0;

var wasJoiningChannels = false;

var wasVisitingSites = false;
		
function run_bot() {
	window.name="myMainWindow";
	
	window.setInterval(function(){
		console.error("--------------------------========================------------------------");
		if (joiningChannels) {
				console.error("Joining channels");
				joinChannel();
		} else if (visitingSites) {
				console.error("Visiting sites");
				visitSite();
				
				// TODO
				controlEarningsType = "JOIN";
				joinChats();
		} else {
				messageBot();
		}
		var timeNow = performance.now();
		console.error("Total execution time of the farm is: " + (timeNow - startTime) / 1000 + " seconds");
	}, 2000);
}

function joinChannel() {
	
	if (!wasJoiningChannels) {
		joinChannel();
		sleep(5000);
	} else {
		console.error("Value of flag is: " + NEXT_OPERATION_READY);
		if (NEXT_OPERATION_READY && validateJoinChannel()) {
			calledOperations++;
			console.error("Called operations: " + calledOperations);
			if (calledOperations % 4 == 0) {
				totalChannelsJoined++;
				console.error("Total channels joined: " + totalChannelsJoined);
				calledOperations = 0;
				
				// every 10 joined channels start visiting sites
				if (totalChannelsJoined % 10 == 0) {
					joiningChannels = false;
					visitingSites = true;
					wasVisitingSites = false;
				}
			}
			callNextOperation();
		}
		if (joiningChannels) {
			wasJoiningChannels = true;
		}
	}
}

function visitSite() {
	if (!wasVisitingSites) {
		startVisitingSites();
		sleep(5000);
	} else {
		if (validateVisitSite()) {
			visitedSites++;
			console.error("Visited sites: " + visitedSites);
			
			// click go to website
			goToWebsite();
			sleep(5000);
			
			// open the website
			var timeToSleep = openWebsite();
			
			sleep(5000);
			
			// close the tab
			closeCurrentTab();
			
			sleep(timeToSleep);
			
			// every 10 sites visited start joining channels
			if (visitedSites % 10 == 0) {
				visitingSites = false;
				joiningChannels = true;
				wasJoiningChannels = false;
			}
		}
		if (visitingSites) {
			wasVisitingSites = true;
		}
	}
}

function messageBot() {
	
}

function validateVisitSite() {
	return true;
}

function validateJoinChannel() {
	var result = true;
	var message = document.getElementsByClassName("im_message_text");
	
	console.error("Validating message: " + message[message.length - 1].innerHTML);
	
	if (message[message.length - 1].innerHTML.includes("We cannot find you") || message[message.length - 1].innerHTML.includes("You already completed this task")){
		skipChannel();
		sleep(5000);
		joinChats();
		result = false;
	}
	if (message[message.length - 1].innerHTML.includes("There is a new chat for you to join")) {
		result = false;
		joinChats();
	}
	
	if (message[message.length - 1].innerHTML.includes("Sorry, there are no new ads available.") || message[message.length - 1].innerHTML.includes("Join chats")) {
		console.error("Waiting for new tasks");
		sleep(5000);
		result = false;
		waitingForTasksRetry++;
		
		// every 5 waits try to refresh the content by calling joinChats();
		if (waitingForTasksRetry % 2 == 0) {
			joinChats();
			// TODO
			visitingSites = true;
			joiningChannels = false;
		}
	}
	
	if (!result) {
		zecChannel();
	}
	
	console.error("Validation is: " + result);
	
	return result;
}

function sleep(ms) {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://localhost:8080/sleep', false);
	request.setRequestHeader("Sleep-Time", ms);
	request.send(null);
	if (request.status == 200) {
		console.error("Sleeping was finished");
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

function startVisitingSites() {
	var visitSitesButton = findButtonByName("Visit sites");
	
	if (visitSitesButton) {
		console.error("Clicking Visit sites button");
		visitSitesButton.click();
	}
}

function goToWebsite() {
	var visitSiteButton = findLinkByName("Go to website");
	if (visitSiteButton) {
		visitSiteButton.click();
	}
}

function openWebsite() {
	var okButton = findButtonByName("OK");
	
	var timeToSleep = 11000;
	if (okButton) {
		// get the url and check wheter it is doge.click and if so wait a little bit more
		// TODO try to find exactly how much time we have to wait
		//var url = document.getElementsByTagName("my-i18n-param")[0].innerText;
		
		//if (url.includes("doge.click")) {
		//	timeToSleep = 61000;
		//}
		okButton.click();
	}
	
	return timeToSleep;
}

function closeCurrentTab() {
	// does not close the tab, but returns the user to the previous tab which has oppened the current tab
	// it is not possible to close tab which was not opened by script
	
	if (window.name!='myMainWindow') {
	  window.open(location.href,"myMainWindow")
	  window.close();
	}

	//window.open('','_parent','');
	//window.focus();
}

function findParamByName(name) {
	return ;
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
	var joinChatsButton = findButtonByName(":mega: Join chats");

	// start joining chats
	if (joinChatsButton) {
		console.error("Clicking Join chats button");
		joinChatsButton.click();
	}
	NEXT_OPERATION_READY = true;
}

function findButtonByName(name) {
	var buttons = document.getElementsByTagName("button");
	var searchText = ":mega: Join chats";
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

function findLinkByName(name) {
	// find last go to group or join channel button
	var markupButtons = document.getElementsByClassName("btn reply_markup_button");

	var linkButton;

	for (var i = markupButtons.length - 1; i >= 0; i--) {
		if (markupButtons[i].tagName == "A" && markupButtons[i].innerHTML.includes(name)) {
			linkButton = markupButtons[i];
			break;
		}
	}
	
	return linkButton;
}

function goToChannelOrGroup() {	
	var channelButton = findLinkByName("Go to channel");
	if (!channelButton) {
		channelButton = findLinkByName("Go to group");
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