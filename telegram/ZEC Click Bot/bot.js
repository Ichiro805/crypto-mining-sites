let visitedSites = 0;

let totalChannelsJoined = 0;

let waitingForTasksRetry = 0;

var joiningChannels = true;

var visitingSites = false;

let controlVisitedSites = 0;

var wasJoiningChannels = false;

let min = 0.00035;

var wasVisitingSites = false;

var wallet = "t1hCiqCwj2yBLEJkMV7GDxczeb4bNT9CYBG";

var currency = "ZEC";

// You must stay on the site for 10 seconds to get your reward.

var isBotRunning = true;

async function stopFarm() {
	isBotRunning = false;
}

async function startFarm() {
	do {
		await run_bot();
	} while (isBotRunning);
}
		
async function run_bot() {	
	/*if (totalChannelsJoined > 0 && visitedSites > 0 && ((totalChannelsJoined % 50 == 0 && joiningChannels) || (visitedSites % 50 == 0 && visitingSites))) {
		await getBalance();
	}*/
	if (joiningChannels) {
		console.error("Joining channels");
		await joinChannel();
	} else if (visitingSites) {
		console.error("Visiting sites");
		await visitSite();
	} else {
		await messageBot();
	}
}

async function joinChannel() {
	if (!wasJoiningChannels) {
		await joinChats();
		await sleep(4000);
		wasJoiningChannels = true;
	} 
	var validationResult = await validateJoinChannel();
	if (validationResult) {
		await sleep(2000);
		if (await goToChannelOrGroup()) {
			await sleep(5000);
		}
		if (await joinChannelOrGroup()) {
			await sleep(5000);
		}
		if (await channel()) {
			await sleep(5000);
		}
		if (await joined()) {
			await sleep(5000);
		}
		totalChannelsJoined++;
		console.error("Total channels joined: " + totalChannelsJoined);
		
		// every 10 joined channels start visiting sites
		if (totalChannelsJoined % 10 == 0) {
			joiningChannels = false;
			visitingSites = true;
			wasVisitingSites = false;
		}
	}
}

async function getBalance() {
	var balanceButton = findButtonByName("Balance");
	
	if (balanceButton) {
		balanceButton.click();
		await sleep(2000);
		var balance = parseFloat(getLastMessage().replace('<strong>', '').replace(" " + currency + "ZEC</strong>", '').replace("Available balance: ", ''));
		
		if (Math.floor(min / balance) == 3) {
			await sleep(2000);
			//withdrawal(min);
		}
	}
}

async function withdrawal(amount) {
	var withdraw = findButtonByName("Withdraw");
	if (withdraw) {
		withdraw.click();
		await sleep(1000);
		setWallet();
		await sleep(1000);
		clickSendButton();
	}
}

async function setWallet() {
	var textField = document.getElementsByClassName("composer_rich_textarea")[0];
	if (textField) {
		textField.innerHTML = wallet;
	}
}

async function clickSendButton() {
	var sendButton = findButtonByName("SEND");
	if (sendButton) {
		sendButton.click();
	}
}

async function visitSite() {
	if (!wasVisitingSites) {
		await startVisitingSites();
		await sleep(4000);
		wasVisitingSites = true;
	}
	var validationResult = await validateVisitSite();
	if (validationResult) {
		visitedSites++;
		console.error("Visited sites: " + visitedSites);
		
		// click go to website
		await goToWebsite();
		await sleep(2000);
		
		// open the website
		var timeToSleep = await openWebsite();
		
		if (timeToSleep != 0) {
			await sleep(timeToSleep);
			
			// close the tab
			await closeCurrentTab();
			
			// every 5 sites visited start joining channels
			if (visitedSites % 5 == 0) {
				visitingSites = false;
				joiningChannels = true;
				wasVisitingSites = false;
			}
			
			await sleep(2000);
		}
	}
}

async function messageBot() {
	
}

async function validateVisitSite() {
	var result = true;
	var message = getLastMessage();
	
	console.error("Validating message: " + message);

	if (message.includes("Sorry, there are no new ads available.")) {
		console.error("Waiting for new tasks");
		await sleep(5000);
		result = false;
		waitingForTasksRetry++;
		
		// every 5 waits try to refresh the content by calling startVisitingSites();
		if (waitingForTasksRetry % 2 == 0) {
			startVisitingSites();
			visitingSites = true;
			wasJoiningChannels = false; 
			joiningChannels = false;
		}
	}
	
	if (!result) {
		await sleep(5000);
		await channel();
	}
	
	console.error("Validation is: " + result);
	
	return result;
}

function getLastMessage() {
	var message = document.getElementsByClassName("im_message_text");
	return message[message.length - 1].innerHTML;
}

async function validateJoinChannel() {
	var result = true;
	var message = getLastMessage();
	
	console.error("Validating message: " + message);
	
	if (message.includes("We cannot find you") || message.includes("You already completed this task")){
		await skipChannel();
		await sleep(5000);
		result = false;
	}
	if (message.includes("There is a new chat for you to join") || message.includes("Sorry, that task is no longer valid")) {
		result = false;
		await joinChats();
	}
	
	if (message.includes("Sorry, there are no new ads available.") || message.includes("Join chats")) {
		console.error("Waiting for new tasks");
		await sleep(5000);
		result = false;
		waitingForTasksRetry++;
		
		// every 5 waits try to refresh the content by calling joinChats();
		if (waitingForTasksRetry % 2 == 0) {
			await joinChats();
			// TODO
			visitingSites = true;
			joiningChannels = false;
		}
	}
	
	if (!result) {
		await sleep(5000);
		await channel();
	}
	
	console.error("Validation is: " + result);
	
	return result;
}

function sleep(ms) {
	console.error("Sleeping");
	return new Promise(resolve => setTimeout(resolve, ms));
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
}

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
		console.error("Clicking on go to website");
		visitSiteButton.click();
	}
}

async function openWebsite() {
	var okButton = findButtonByName("OK");
	
	var timeToSleep = 0;
	if (okButton) {
		console.error("Opening the website");
		okButton.click();
		
		await sleep(1500);
		if (isDogeClickSite()) {
			timeToSleep = 10000;
		} else {
			timeToSleep = 71000;
		}
	}
	
	console.error("Time to sleep is: " + timeToSleep);
	
	return timeToSleep;
}

function isDogeClickSite() {
	var message = document.getElementsByClassName("im_message_text");
	
	for (var i = message.length - 4; i < message.length; i++) {
		if (message[i].innerHTML.includes("Please stay on the site for at least")) {
			return true;
		}
	}
	return false;
}

function closeCurrentTab() {
	// does not close the tab, but returns the user to the previous tab which has oppened the current tab
	// it is not possible to close tab which was not opened by script
	
	window.open('','_parent','');
	window.focus();
	
	console.error("Closing the tab");
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
		return true;
	}
	return false;
}

function joinChannelOrGroup() {
	// find join channel button and join the channel
	var joinButton = document.getElementsByClassName("btn btn-primary im_start_btn")[0];
	if (joinButton) {
		console.error("join channel/group");
		joinButton.click();
		return true;
	}
	return false;
}

function joinChats() {
	var joinChatsButton = findButtonByName(":mega: Join chats");

	// start joining chats
	if (joinChatsButton) {
		console.error("Clicking Join chats button");
		joinChatsButton.click();
		return true;
	}
	return false;
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
		return true;
	}
	
	return false;
}
	
function closeEmoji() {
	// find emoji button and trigger mouse click
	var emojiButton = document.getElementsByClassName("composer_keyboard_btn active");
	if (emojiButton[0]) {
		console.error("Clicking emoji button");
		triggerMouseEvent (emojiButton[0], "mousedown");
		return true;
	}
	return false;
}

function triggerMouseEvent (node, eventType) {
	var clickEvent = document.createEvent ('MouseEvents');
	clickEvent.initEvent (eventType, true, true);
	node.dispatchEvent (clickEvent);
}

function getCurrentDateTime() {
	var today = new Date();
	return today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + ':' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
}

function channel(){
	// go back to original channel
	var allChannels = document.getElementsByClassName("im_dialog");
	var channel;

	for (var i = 0; i < allChannels.length; i++) {
		if (allChannels[i].text.includes(currency + " Click Bot")) {
			channel = allChannels[i];
			break;
		}
	}

	// open bot channel
	if (channel) {
		console.error("open channel");
		triggerMouseEvent (channel, "mousedown");
		return true;
	}
	return false;
}

startFarm();