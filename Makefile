setup:
	@echo "Setting up the Node.js environment..."
	nvm use v20.5.0
	npm install

install_deps:
	@echo "Installing dependencies..."
	npm install cors mongoose express axios dotenv

start_server:
	@echo "Starting server..."
	node server.js

.PHONY: setup install_deps start_server

# Using the Makefile
# 	To use this Makefile, navigate to your project directory in the terminal and run the make commands:
# 		Setup the environment and install all dependencies:
# 			make setup
# 			make install_deps
# 		Start the server:
# 			make start_server


