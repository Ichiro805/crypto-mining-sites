from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from enum import Enum
from datetime import datetime, timedelta
import time
from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import StaleElementReferenceException
import timeit
import re

# Time which the driver will wait to find component untill timeout exception is raised in seconds
DRIVER_WAIT_TIME = 10

SECOND = 1000

# Sleep time between searching from 1 component to another in milliseconds
SLEEP_TIME_BETWEEN_COMPONENTS = 5 * SECOND

# Waiting for new message limit before switching to different operation
RETRY_LIMIT = 2

# Time to run the bot until it pauses for SLEEP_BOT_TIME seconds
BOT_WAIT_TIME = 600

SLEEP_BOT_TIME = SECOND * 60 * 5

class wait_for_text_to_start_with(object):
    def __init__(self, locator, text_):
        self.locator = locator
        self.text = text_

    def __call__(self, driver):
        try:
            element_text = EC._find_element(driver, self.locator).text
            return element_text.startswith(self.text)
        except StaleElementReferenceException:
            return False

class Unbuffered(object):
   def __init__(self, stream):
       self.stream = stream
   def write(self, data):
       self.stream.write(data)
       self.stream.flush()
   def writelines(self, datas):
       self.stream.writelines(datas)
       self.stream.flush()
   def __getattr__(self, attr):
       return getattr(self.stream, attr)


# Class representing chat structure
class Chat():
	def __init__(self, name, hoursUntillReward):
		self.name = name
		self.joinDate = datetime.now()
		self.leaveDate = self.joinDate + datetime.timedelta(hours = hoursUntillReward)

# Enum defining all supported operations by the bot
class Operation(Enum):
	VISIT = 1
	JOIN = 2
	MESSAGE = 3

class Bot:
	def load_chats_from_last_run(self):
		joinedChats = []
		#chats_cache_file = open("chats.cache", "r")
		# TODO
		return joinedChats

	def __init__(self, driver, operation, currency):
		self.driver = driver
		self.operation = operation
		# Current currency for which the bot is running
		self.currency = currency
		# Current retry for operation
		self.waitingForTasksRetry = 0
		# Variable to check whether the bot has changed the operation
		self.isOperationInitialized = False
		# Limit of how many chats the bot can join in a row
		self.joinLimit = 20
		# Limit of how many sites the bot can visit in a row
		self.visitLimit = 10
		# Limit of how many runs the bot can wait until it switches the operation
		self.retryLimit = 5
		# Array indentifying which chats were joined by the bot
		self.joinedChats = self.load_chats_from_last_run()

	def sleep(self, ms):
		print("Sleeping for: ", ms, " ms")
		time.sleep(ms / 1000)

	def refresh(self):
		self.driver.get("https://web.telegram.org/#/im?p=@Zcash_click_bot")

	def get_last_message(self):
		messages = WebDriverWait(self.driver, DRIVER_WAIT_TIME).until(
			EC.presence_of_all_elements_located((By.XPATH, "//div[@class='im_message_text']"))
		)
		return messages[len(messages) - 1].text

	def change_operation(self, new_operation):
		self.operation = new_operation
		self.isOperationInitialized = False
		self.click_button_by_name("Menu")

	def click_ok_popup_button(self):
		ok_popup_btn = WebDriverWait(self.driver, DRIVER_WAIT_TIME).until(
			EC.presence_of_element_located((By.XPATH, "//button[@class='btn btn-md btn-md-primary']"))
		)
		ok_popup_btn.click()

	def is_button_available(self, name):
		buttons = WebDriverWait(self.driver, DRIVER_WAIT_TIME).until(
			EC.presence_of_all_elements_located((By.XPATH, "//button[@class='btn reply_markup_button']"))
		)
		print("Searching for button with text: " + name)
		for button in buttons:
			text = button.text
			if text.strip().find(name.strip()) != -1:
				print("Button with text: " + name + " found")
				return True
		return False

	def get_div_content(self, classes):
		content = WebDriverWait(self.driver, DRIVER_WAIT_TIME).until(
			EC.presence_of_all_elements_located((By.XPATH, "//div[@class=" + classes + "]"))
		)
		return content.text

	def click(self, component_type, names, classes = "btn reply_markup_button"):
		try:
			buttons = WebDriverWait(self.driver, DRIVER_WAIT_TIME).until(
				EC.presence_of_all_elements_located((By.XPATH, "//" + component_type + "[@class='" + classes + "']"))
			)
			for button in reversed(buttons):
				text = button.text
				for name in names:
					if text.strip().find(name.strip()) != -1:
						print("Clicking '", name.strip(), "' component")
						button.click()
						return True
		except TimeoutException:
			print("Component was not found on the page in the given timeout")
		return False

	def start_join_channel(self):
		return self.click_button_by_name(["Join chats"])

	def start_visit_sites(self):
		return self.click_button_by_name(["Visit sites"])

	def start_message_bots(self):
		return self.click_button_by_name(["Message bots"])

	def click_button_by_name(self, names):
		return self.click("button", names)

	def click_link_by_name(self, names):
		return self.click("a", names)

	def skip_channel(self):
		return self.click_link_by_name(["Skip"])

	def open_joining_channel(self):
		return self.click_link_by_name(["Go to channel", "Go to group"])

	def validate_join_chats(self):
		print("Validate joining chats")
		message = self.get_last_message().strip()
		print("Validating message: ", message.encode("utf-8"));
		result = True
		if message.find("We cannot find you") != -1 or message.find("You already completed this task") != -1 or message.find("There is a new chat for you to join") != -1 or message.find("Sorry, that task is no longer valid") != -1 or message.find("There is a new chat for you to join") != -1:
			self.skip_channel()
			self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
			self.join_channel()
			result = False
		elif message.find("Sorry, there are no new ads available.") != -1 or message.find("Join chats") != -1:
			print("Waiting for new tasks")
			self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
			result = False
			self.waitingForTasksRetry += 1
			print("RETRY: ", self.waitingForTasksRetry," from JOIN")
			if self.waitingForTasksRetry % RETRY_LIMIT == 0:
				self.change_operation(Operation.VISIT)
				self.waitingForTasksRetry = 0
		
		if result == False:
			self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
			self.open_channel("ZEC Click Bot")
		
		print("Validation is: ", result)
		
		return result

	def get_current_channel_name(self):
		content = WebDriverWait(self.driver, DRIVER_WAIT_TIME).until(
			EC.presence_of_all_elements_located((By.XPATH, "//span[@class='tg_head_peer_title']"))
		)
		print("Getting current channel name")
		return content[0].text

	def join_openned_channel(self):
		return self.click("a", ["JOIN"], "btn btn-primary im_start_btn")

	def open_channel(self, channel):
		all_chats = WebDriverWait(self.driver, DRIVER_WAIT_TIME).until(
			EC.presence_of_all_elements_located((By.CLASS_NAME, 'im_dialog'))
		)

		for chat in all_chats:
			if chat.text.strip().find(channel.strip()) != -1:
				print("Openning channel '", channel.encode("utf-8"), "'")
				chat.click()
				return True
		return False

	def get_hours_untill_reward(self):
		try:
			message = WebDriverWait(self.driver, DRIVER_WAIT_TIME / 2).until(
				wait_for_text_to_start_with((By.XPATH, "//div[@class='im_message_text']"), "You must stay in the channel for at least")
			)
		except TimeoutException:
			message = WebDriverWait(self.driver, DRIVER_WAIT_TIME / 2).until(
				wait_for_text_to_start_with((By.XPATH, "//div[@class='im_message_text']"), "You must stay in the group for at least")
			)
		print("Message is: ", message.encode("utf-8"))
		return int(re.search('for at least <strong>.*</strong> hour', message).group(1))

	def init_operation(self):
		if (self.operation == Operation.JOIN):
			self.start_join_channel()
		elif (self.operation == Operation.VISIT):
			self.start_visit_sites()
		else:
			self.start_message_bots()

	def join_chats(self):
		if self.validate_join_chats():
			self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
			if self.open_joining_channel():
				self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
				channelName = self.get_current_channel_name()
				if self.join_openned_channel():
					self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
				else:
					print("You already joined that channel or group")
			if self.open_channel("ZEC Click Bot"):
				self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
				if self.click_button_by_name(["Joined"]):
					self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
					hoursUntillReward = self.get_hours_untill_reward()
					chat = Chat(channelName, hoursUntillReward)
					print("Joined channel: ", channelName.encode("utf-8"))
					# TODO construct chat
		#// Push the joined chat into the collection of all joined chats
		#var hoursUntillReward = await getHoursUntillReward();
		#chatsJoined.push(new chat(channelName, getCurrentDate(), getEstimatedLeaveDate(hoursUntillReward)));
		#totalChannelsJoined++;
		#console.error("Total channels joined: " + totalChannelsJoined);

	def open_site(self):
		return self.click_link_by_name(["Go to website"])

	def validate_visit_sites(self):
		print("Validate visiting sites")
		message = self.get_last_message().strip()
		print("Validating message: ", message.encode("utf-8"));
		result = True
		if message.find("Sorry, there are no new ads available.") != -1:
			print("Waiting for new tasks")
			self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
			result = False
			self.waitingForTasksRetry += 1
			print("RETRY: ", self.waitingForTasksRetry," from VISIT")
			if self.waitingForTasksRetry % RETRY_LIMIT == 0:
				self.change_operation(Operation.JOIN)
				self.waitingForTasksRetry = 0
		
		if result == False:
			self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
			self.open_channel("ZEC Click Bot")
		
		print("Validation is: ", result)
		
		return result

	def visit_sites(self):
		if self.validate_visit_sites():
			self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
			if self.open_site():
				self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
				if self.click_ok_popup_button():
					self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
				else:
					print("You already joined that channel or group")
			#if self.open_channel("ZEC Click Bot"):
				#self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
				#if self.click_button_by_name(["Joined"]):
					#self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
					#print("Joined channel: ", channel_name.encode("utf-8"))

	def message_bots(self):
		print("Messaging bots")

	#def leave_channel(channel):

	def wait_for_login(self):
		WebDriverWait(self.driver, 5 * 60).until(
			EC.text_to_be_present_in_element((By.XPATH, "//div[@class='im_history_not_selected vertical-aligned']"), "Please select a chat to start messaging")
		)
		print("Login successfull")

	def login(self):
		# Set phone country input field
		phone_country = WebDriverWait(self.driver, DRIVER_WAIT_TIME).until(
		    EC.presence_of_element_located((By.NAME, "phone_country"))
		)
		phone_country.clear()
		phone_country.send_keys("+359")
		print("Set phone country number")
		self.sleep(2000)

		# Set phone number input field
		phone_number = WebDriverWait(self.driver, DRIVER_WAIT_TIME).until(
		    EC.presence_of_element_located((By.NAME, "phone_number"))
		)
		phone_number.send_keys("899205738")
		phone_number.send_keys(Keys.ENTER)
		print("Set phone number")
		self.sleep(2000)

		# Click OK confirm button
		self.click_ok_popup_button()
		print("Confirm the number")
		self.sleep(2000)

		# Wait for the user to enter the SMS code and confirm the login
		self.wait_for_login()
		# Open ZEC click bot
		self.refresh()

	def run_bot(self):
		# If menu button is displayed, click it
		if (self.click_button_by_name(["Menu"])):
			print("Clicking Menu button")
		# Process with the operation
		if self.isOperationInitialized == False:
			self.init_operation()
			self.isOperationInitialized = True
			self.sleep(SLEEP_TIME_BETWEEN_COMPONENTS)
			print("Initialized operation 'JOIN CHATS'")
		if (self.operation == Operation.JOIN):
			self.join_chats()
		elif (self.operation == Operation.VISIT):
			self.visit_sites()
		else:
			self.message_bots()

	def run(self):
		self.driver.get("https://web.telegram.org/#/login")

		try:
			self.login()
			runs = 0
			# Variable to define the starting time of the program
			start_time = timeit.default_timer()
			while True:
				self.run_bot()
				self.sleep(2 * SLEEP_TIME_BETWEEN_COMPONENTS)
				runs+=1
				time_upto_last_run = timeit.default_timer()
				print("Running for '", runs, "'' runs for '", (time_upto_last_run - start_time), "' seconds")
				# Sleep the bot every BOT_WAIT_TIME seconds for BOT_SLEEP_TIME seconds and then refresh
				if (time_upto_last_run - start_time) >= BOT_WAIT_TIME:
					self.sleep(BOT_SLEEP_TIME)
					start_time = timeit.default_timer()
					self.refresh()

		finally:
			print("Closing the driver")
			self.driver.close()

# Unbuffer the print in order to show the data during the executing of the program
# instead of when the program finishes
import sys
sys.stdout = Unbuffered(sys.stdout)
# Starting the bot
Bot(webdriver.Firefox(), Operation.JOIN, "ZEC").run()