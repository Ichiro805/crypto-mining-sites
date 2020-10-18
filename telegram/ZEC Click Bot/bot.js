//https://web.telegram.org/#/im?p=@Zcash_click_bot

// TODO
// check for connection
// close window on opening website

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

// Variable to represent chat object
var chat = function(name, dateOfJoin, getEstimatedLeaveDate) {
	this.name = name;
	this.dateOfJoin = dateOfJoin;
	this.getEstimatedLeaveDate = getEstimatedLeaveDate;
}

// Array of Chats which identifies which chat the user joined
var chatsJoined = [];

let visitedSites = 0;

let totalChannelsJoined = 0;

let waitingForTasksRetry = 0;

let controlVisitedSites = 0;

let min = 0.00035;

var wallet = "t1hCiqCwj2yBLEJkMV7GDxczeb4bNT9CYBG";

var currency = "ZEC";

let JOIN_LIMIT = 10;

let VISIT_LIMIT = 10;

let RETRY_LIMIT = 5;

var farmOperations = { VISIT: '0', JOIN: '1', MESSAGE: '2' };

let operation;

var isOperationInitialized = false;

async function startFarm() {
	sleepMonitor.prevent();
	changeOperation(farmOperations.JOIN);

	var nextWaitDate = getCurrentDate();
	nextWaitDate.setTime(nextWaitDate.getTime() + 10 * 60 * 1000);
	do {
		await run_bot();
		if (getCurrentDate().getTime() >= nextWaitDate.getTime()) {
			await sleep(5 * 60 * 1000);
			nextWaitDate.setTime(nextWaitDate.getTime() + 10 * 60 * 1000);
		}
	} while (true);
}
		
async function run_bot() {	
	if (!isOperationInitialized) {
		await initOperation(operation);
	}
	switch (operation) {
		case farmOperations.JOIN:
			await joinChannel();
			break;
		case farmOperations.VISIT:
			await visitSite();
			break;
		case farmOperations.MESSAGE:
			break;
	}

	await leaveChannelsAfterReward(chatsJoined);
}

async function initOperation(operation) {
	switch (operation) {
		case farmOperations.JOIN:
			await joinChats();
			break;
		case farmOperations.VISIT:
			await startVisitingSites();
			break;
		case farmOperations.MESSAGE:
			break;
	}
	isOperationInitialized = true;
}

async function joinChannel() {
	var validationResult = await validateJoinChannel();
	if (validationResult) {
		await sleep(2000);
		if (await goToChannelOrGroup()) {
			await sleep(5000);
		}
		var channelName = await getCurrentChannelName();
		if (await joinChannelOrGroup()) {
			await sleep(5000);
		}
		if (await openChannel(currency + " Click Bot")) {
			await sleep(5000);
		}
		if (await joined()) {
			await sleep(5000);
		}
		// Push the joined chat into the collection of all joined chats
		var hoursUntillReward = await getHoursUntillReward();
		chatsJoined.push(new chat(channelName, getCurrentDate(), getEstimatedLeaveDate(hoursUntillReward)));
		totalChannelsJoined++;
		console.error("Total channels joined: " + totalChannelsJoined);
		
		// every 10 joined channels start visiting sites
		if (totalChannelsJoined % JOIN_LIMIT == 0) {
			await changeOperation(farmOperations.VISIT);
		}
	}
}

function refresh() {
	// $( ".im_history_selected_wrap" ).load(window.location.href + " .im_history_selected_wrap" );
	 var x = document.getElementsByClassName('im_history_selected_wrap')[0].innerHTML;
     document.getElementsByClassName('im_history_selected_wrap')[0].innerHTML = x;
}

function openMenu() {
	var menu = findButtonByName("Menu");
	if (menu) {
		console.error("Opening menu");
		menu.click();
	}
}

async function getBalance() {
	var balanceButton = findButtonByName("Balance");
	
	if (balanceButton) {
		balanceButton.click();
		await sleep(3000);
		var balance = parseFloat(getLastMessage().replace('<strong>', '').replace(" " + currency + "ZEC</strong>", '').replace("Available balance: ", ''));
		
		if (Math.floor(min / balance) == 3) {
			await sleep(3000);
			//withdrawal(min);
		}
	}
}

async function withdrawal(amount) {
	var withdraw = findButtonByName("Withdraw");
	if (withdraw) {
		withdraw.click();
		await sleep(3000);
		setWallet();
		await sleep(3000);
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
	var validationResult = await validateVisitSite();
	if (validationResult) {
		console.error("Try to open website");
		if (await goToWebsite()) {
			await sleep(3000);

			var timeToSleep = await openWebsite();
			
			if (timeToSleep != 0) {
				await sleep(timeToSleep);
				await closeCurrentTab();
			}

			visitedSites++;
			console.error("Visited sites: " + visitedSites);
			
			if (visitedSites % VISIT_LIMIT == 0) {
				await changeOperation(farmOperations.JOIN);
			}
		}
		await sleep(3000);
	}
}

async function changeOperation(op) {
	operation = op;
	isOperationInitialized = false;
	await openMenu();
}

async function messageBot() {
	
}

async function validateVisitSite() {
	var result = true;
	var message = await getLastMessage();
	
	console.error("Validating message: " + message);

	if (message.includes("Sorry, there are no new ads available.")) {
		console.error("Waiting for new tasks");
		await sleep(6000);
		result = false;
		waitingForTasksRetry++;
		// TODO: fix this
		console.error("RETRY: " + waitingForTasksRetry + " from VISIT");
		if (waitingForTasksRetry % RETRY_LIMIT == 0) {
			await changeOperation(farmOperations.JOIN);
			waitingForTasksRetry = 0;
		}
	}
	
	if (!result) {
		await sleep(6000);
		await openChannel(currency + " Click Bot");
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
		await sleep(6000);
		await joinChats();
		result = false;
	}
	if (message.includes("There is a new chat for you to join") || message.includes("Sorry, that task is no longer valid")) {
		result = false;
		await joinChats();
	}
	if (message.includes("There is a new chat for you to join")) {
		await sleep(6000);
		await joinChats();
		result = false;
	}
	
	if (message.includes("Sorry, there are no new ads available.") || message.includes("Join chats")) {
		console.error("Waiting for new tasks");
		await sleep(6000);
		result = false;
		waitingForTasksRetry++;
		console.error("RETRY: " + waitingForTasksRetry + " from JOIN");
		if (waitingForTasksRetry % RETRY_LIMIT == 0) {
			await changeOperation(farmOperations.VISIT);
			waitingForTasksRetry = 0;
		}
	}
	
	if (!result) {
		await sleep(6000);
		await openChannel(currency + " Click Bot");
	}
	
	console.error("Validation is: " + result);
	
	return result;
}

function sleep(ms) {
	var sleepUntil = getCurrentDate();
	sleepUntil.setTime(sleepUntil.getTime() + ms);
	console.error("Sleeping until " + sleepUntil);
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
		return true;
	}
	return false;
}

async function openWebsite() {
	var okButton = findButtonByName("OK");
	
	var timeToSleep = 0;
	if (okButton) {
		console.error("Opening the website");
		okButton.click();
		
		await sleep(2500);
		if (isDogeClickSite()) {
			timeToSleep = 20000;
		} else {
			timeToSleep = 72000;
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

function findLinkByNames(name1, name2) {
	// find last go to group or join channel button
	var markupButtons = document.getElementsByClassName("btn reply_markup_button");

	var linkButton;

	for (var i = markupButtons.length - 1; i >= 0; i--) {
		if (markupButtons[i].tagName == "A" && (markupButtons[i].innerHTML.includes(name1) || markupButtons[i].innerHTML.includes(name2))) {
			linkButton = markupButtons[i];
			break;
		}
	}
	
	return linkButton;
}

function findLinkByName(name) {
	console.error("Calling with classes");
	return findLinkByNameClasses("btn reply_markup_button", name);
}

function findLinkByNameClasses(classes, name) {
	// find last go to group or join channel button
	var markupButtons = document.getElementsByClassName(classes);
	console.error("Link buttons to check: " + markupButtons.length);
	var linkButton;

	for (var i = markupButtons.length - 1; i >= 0; i--) {
		console.error("Checking link with name: " + markupButtons[i].innerHTML);
		if (markupButtons[i].tagName == "A" && markupButtons[i].innerHTML.includes(name)) {
			linkButton = markupButtons[i];
			break;
		}
	}
	
	return linkButton;
}

function goToChannelOrGroup() {	
	var channelButton = findLinkByNames("Go to channel", "Go to group");

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

async function leaveChannelsAfterReward(chats) {
	console.error("Checking " + chats.length + " chats to leave");
	for (var i = chats.length - 1; i >= 0; i--) {
		var chat = chats[i];
		console.error("Checking if chat: " + chat.name + " is expired");
		var chatLeaveDate = chat.getEstimatedLeaveDate;
		if (getCurrentDate().getTime() >= chatLeaveDate.getTime()) {
			console.error("Leaving channel: " + chat.name);
			await leaveChannel(chat.name);
			await sleep(2000);
			// remove the chat from the collection
			chats.splice(i, 1);
		}
	}
}

async function leaveAllChannels() {
	var allChannels = document.getElementsByClassName("im_dialog_peer");

	console.error("Channels number to leave is: " + allChannels.length);

	if (allChannels.length < 15) {
		return;
	}

	for (var i = 0; i < allChannels.length; i++) {
		await leaveChannel(allChannels[i].textContent.trim());
		await sleep(2000);
	}
}

async function leaveChannel(name) {
	if (await openChannel(name)) {
		await sleep(2500);
	}
	if (await openCurrentChannelOptions()) {
		await sleep(2500);
	}
	if (await leaveCurrentChannel()) {
		await sleep(2500);
	}
	if (await confirmLeaveCurrentChannel()) {
		await sleep(2500);
	}
}

function openChannel(name) {
	var allChannels = document.getElementsByClassName("im_dialog");
	var channelToOpen;

	for (var i = 0; i < allChannels.length; i++) {
		if (allChannels[i].text.includes(name)) {
			channel = allChannels[i];
			break;
		}
	}

	if (channel) {
		console.error("open " + name + " channel");
		triggerMouseEvent (channel, "mousedown");
		return true;
	}

	return false;
}

function openCurrentChannelOptions() {
	var allPeersInfo = document.getElementsByClassName("tg_head_btn");
	var currentChannelPeerInfoBtn = allPeersInfo[allPeersInfo.length - 1];
	if (currentChannelPeerInfoBtn) {
		console.error("Opening current channel options");
		currentChannelPeerInfoBtn.click();
		return true;
	}

	return false;
}

function leaveCurrentChannel() {
	var leaveButton = document.getElementsByClassName("md_modal_list_peer_action pull-right")[0];
	var clicked = false;
	if (leaveButton) {
		leaveButton.click();
		clicked = true;
	} 
	if (!clicked) {
		var leaveChannelButton = findLinkByNameClasses("md_modal_section_link", "Leave channel");
		if (leaveChannelButton) {
			console.error("Leaving current openned channel");
			leaveChannelButton.click();
			return true;
		}
	}

	return false;
}

function confirmLeaveCurrentChannel() {
	var confirmLeaveCurrentChannel = document.getElementsByClassName("btn btn-md btn-md-primary")[0];
	if (confirmLeaveCurrentChannel) {
		console.error("Confirming to leave the current channel");
		confirmLeaveCurrentChannel.click();
		return true;
	}
	return false;
}

function getCurrentChannelName() {
	console.error("Getting current channel name");
	return document.getElementsByClassName("tg_head_peer_title")[0].textContent.trim();
}

function getCurrentDate() {
	return new Date();
}

function getEstimatedLeaveDate(hoursUntillReward) {
	var currentDate = new Date();
	// Add 1 minute bonus to wait for reward time just in case
	currentDate.setTime(currentDate.getTime() + hoursUntillReward*60*60*1000 + 60_000);
	return currentDate;
}

function getHoursUntillRewardFromMessages(depth) {
	var messages = document.getElementsByClassName("im_message_text");
	console.error("Searching from: " + depth + " messages total");
	for (var i = messages.length - 1; i > messages.length - depth - 1; i--) {
		var msg = messages[i].innerHTML.trim();
		console.error("MESSAGE[" + (messages.length - i) + "]: " + msg);
		// You must stay in the channel for at least 168 hours to earn your reward.
		var startIdxLength = "You must stay in the channel for at least <strong>".length;
		var startIdx = msg.indexOf("You must stay in the channel for at least <strong>");
		if (startIdx == -1) {
			startIdx = msg.indexOf("You must stay in the group for at least <strong>");
			startIdxLength = "You must stay in the group for at least <strong>".length;
		}
		if (startIdx != -1) {
			var endIdx = msg.indexOf("</strong> hours to earn your reward.");
			if (endIdx == -1) {
				endIdx = msg.indexOf("</strong> hour to earn your reward.");
			}
			return msg.substring(startIdx + startIdxLength, endIdx).trim();
		}
	}

	return "";
}

async function getHoursUntillReward() {
	console.error("Getting hours untill reward");
	var foundHours = false;
	var hoursUntillReward = "";
	do {
		var hoursUntillReward = getHoursUntillRewardFromMessages(2);
		foundHours = hoursUntillReward != "";
		console.error("Trying to get hours untill reward");
		await sleep(500);
	} while (!foundHours);
	console.error("Hours untill reward: " + hoursUntillReward);

	return parseInt(hoursUntillReward);
}

startFarm();