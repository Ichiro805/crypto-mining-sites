from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from enum import Enum
import time

# Enum defining all supported operations by the bot
class Operation(Enum):
	VISIT = 1
	JOIN = 2
	MESSAGE = 3

class Bot:
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

	def sleep(self, ms):
		print("Sleeping for: ", ms, " ms")
		time.sleep(ms / 1000)

	def refresh(self):
		self.driver.get("https://web.telegram.org/#/im?p=@Zcash_click_bot")

	def get_last_message(self):
		messages = WebDriverWait(self.driver, 10).until(
			EC.presence_of_all_elements_located((By.XPATH, "//div[@class='im_message_text']"))
		)
		return messages[len(messages) - 1].text

	def change_operation(self, new_operation):
		self.operation = new_operation
		self.isOperationInitialized = False
		self.click_button_by_name("Menu")

	def click_ok_popup_button(self):
		ok_popup_btn = WebDriverWait(self.driver, 10).until(
			EC.presence_of_element_located((By.XPATH, "//button[@class='btn btn-md btn-md-primary']"))
		)
		ok_popup_btn.click()

	def is_button_available(self, name):
		buttons = WebDriverWait(self.driver, 10).until(
			EC.presence_of_all_elements_located((By.XPATH, "//button[@class='btn reply_markup_button']"))
		)
		print("Searching for button with text: " + name)
		for button in buttons:
			text = button.text
			if text.strip().find(name.strip()) != -1:
				print("Button with text: " + name + " found")
				return True
		return False

	def click(self, component_type, names):
		buttons = WebDriverWait(self.driver, 10).until(
			EC.presence_of_all_elements_located((By.XPATH, "//" + component_type + "[@class='btn reply_markup_button']"))
		)
		for button in buttons:
			text = button.text
			for name in names:
				print("Searching for ", name)
				if text.strip().find(name.strip()) != -1:
					print("Button with text: ", name, " found")
					button.click()
					return True
		return False

	def join_channel(self):
		return self.click_button_by_name("Join chats")

	def click_button_by_name(self, names):
		return self.click("button", names)

	def click_link_by_name(self, names):
		return self.click("a", names)

	def skip_channel(self):
		return self.click_link_by_name(["Skip"])

	def open_joining_channel(self):
		return self.click_link_by_name(["Go to channel", "Go to group"])

	def open_channel(self, channel_name):
		print("Opening channel: ", channel_name)

	def validate_join_chats(self):
		print("Validate joining chats")
		message = self.get_last_message().strip()
		print("Validating message: " + message);
		result = True
		if message.find("We cannot find you") != -1 or message.find("You already completed this task") != -1 or message.find("There is a new chat for you to join") != -1 or message.find("Sorry, that task is no longer valid") != -1 or message.find("There is a new chat for you to join") != -1:
			self.skip_channel()
			self.sleep(5000)
			self.join_channel()
			result = False
		elif message.find("Sorry, there are no new ads available.") != -1 or message.find("Join chats") != -1:
			print("Waiting for new tasks")
			self.sleep(5000)
			result = False
			self.waitingForTasksRetry += 1
			print("RETRY: ", waitingForTasksRetry," from JOIN")
			if waitingForTasksRetry % RETRY_LIMIT == 0:
				self.changeOperation(Operation.VISIT)
				self.waitingForTasksRetry = 0
		
		if result == False:
			self.sleep(5000)
			self.open_channel(currency + " Click Bot")
		
		print("Validation is: ", result)
		
		return result

	def join_chats(self):
		if self.isOperationInitialized == False:
			self.join_channel()
			self.isOperationInitialized = True
			self.sleep(5000)
		if self.validate_join_chats():
			self.sleep(5000)
			if self.open_joining_channel():
				self.sleep(5000)
				channel_name = self.get_current_channel_name()
				if self.join_openned_channel():
					self.sleep(5000)
			if self.open_channel("ZEC Click Bot"):
				self.sleep(5000)
				if self.click_link_by_name(["Joined"]):
					print("Joined channel: ", channel_name)
					# TODO construct chat
		#// Push the joined chat into the collection of all joined chats
		#var hoursUntillReward = await getHoursUntillReward();
		#chatsJoined.push(new chat(channelName, getCurrentDate(), getEstimatedLeaveDate(hoursUntillReward)));
		#totalChannelsJoined++;
		#console.error("Total channels joined: " + totalChannelsJoined);
		
		#// every 10 joined channels start visiting sites
		#if (totalChannelsJoined % JOIN_LIMIT == 0) {
	#		await changeOperation(farmOperations.VISIT);
	#	}

	def visit_sites(self):
		print("Visiting sites")

	def message_bots(self):
		print("Messaging bots")

	#def leave_channel(channel):

	#def open_channel(channel):


	def validate_visit_sites(self):
		print("Validating visit sites")

	def wait_for_login(self):
		WebDriverWait(self.driver, 5 * 60).until(
			EC.text_to_be_present_in_element((By.XPATH, "//div[@class='im_history_not_selected vertical-aligned']"), "Please select a chat to start messaging")
		)
		print("Login successfull")

	def login(self):
		# Set phone country input field
		phone_country = WebDriverWait(self.driver, 10).until(
		    EC.presence_of_element_located((By.NAME, "phone_country"))
		)
		phone_country.clear()
		phone_country.send_keys("+359")
		print("Set phone country number")

		# Set phone number input field
		phone_number = WebDriverWait(self.driver, 10).until(
		    EC.presence_of_element_located((By.NAME, "phone_number"))
		)
		phone_number.send_keys("899205738")
		phone_number.send_keys(Keys.ENTER)
		print("Set phone number")

		# Click OK confirm button
		self.click_ok_popup_button()
		print("Confirm the number")

		# Wait for the user to enter the SMS code and confirm the login
		self.wait_for_login()
		# Open ZEC click bot
		self.refresh()

	def run_bot(self):
		if (self.click_button_by_name(["Menu"])):
			print("Clicking Menu button")
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
			while True:
				self.run_bot()
				self.sleep(5000)
				print("Running for: ", runs, " runs")
				runs+=1

		finally:
			print("Closing the driver")
			#driver.close()
		   # driver.quit()

Bot(webdriver.Firefox(), Operation.JOIN, "ZEC").run()