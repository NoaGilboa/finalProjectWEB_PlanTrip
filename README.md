# Final Project: AI Route Creation with Image Generation

## Introduction

This project aims to help users plan multi-day trips in various countries using different modes of transportation. The main goal is to provide users with customized travel itineraries and visual maps for trips.

## Features

- Interactive map generation
- Dynamic trip planning based on user inputs (country and transportation type)
- Real-time itinerary updates and image generation of destinations

## Technology Stack

- **Node.js**: Server-side JavaScript runtime
- **Express**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Leaflet.js**: Library for interactive maps
- **Axios**: Promise-based HTTP client
- **OpenAI API**: For generating trip itineraries
- **OpenCage API**: For geocoding locations

## Project Structure

```
project/
├── Image.js
├── index.html
├── Makefile
├── script.js
├── server.js
├── style.css
```

### `Image.js`

Defines the schema and model for storing images in MongoDB.

### `index.html`

Main HTML file containing the structure and layout of the application.

### `Makefile`

Makefile for automating tasks like setting up the project and running the server.

### `script.js`

Client-side JavaScript for handling form submissions, fetching trip data, and displaying maps and images.

### `server.js`

Server-side JavaScript for handling API requests, generating trip itineraries, and integrating with external APIs.

### `style.css`

CSS file for styling the application.

## Setup and Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/NoaGilboa/finalProjectWEB_PlanTrip.git
   ```

2. **Navigate to the project directory:**

   ```sh
   cd finalProjectWEB_PlanTrip
   ```

3. **Install dependencies:**

   ```sh
   npm install
   ```

4. **Set up environment variables:**

   Create a `.env` file in the root directory with the following content:

   ```
   OPENAI_API_KEY=<Your_OpenAI_API_Key>
   OPENCAGE_API_KEY=<Your_OpenCage_API_Key>
   ```

5. **Run the server:**

   ```sh
   node server.js
   ```

6. **Open the application in your browser:**

   Navigate to `http://localhost:3000` to use the application.

## Usage

1. **Plan a Trip:**

   - Enter the country and select the transportation type (Car, Bike, Foot).
   - Click on "Generate trip" to create a customized trip itinerary.

2. **View Trip Options:**

   - Select a trip from the trip selector dropdown.
   - Click "Load Trip" to view the trip details on the map.

3. **View Images:**

   - The application will generate and display images of the destinations.

## How It Works

### Client-Side

- **HTML Structure**: Defines the layout and structure of the application.
- **CSS Styling**: Adds styling and animations for a better user experience.
- **JavaScript**: Manages UI elements, fetches trip data, and updates the map and images dynamically.

### Server-Side

- **Express Server**: Handles API requests and serves static files.
- **API Integration**: Communicates with OpenAI and OpenCage APIs for trip generation and geocoding.
- **MongoDB**: Stores generated images and trip data.

### Map and Image Generation

- **Leaflet.js**: Displays interactive maps with markers for each destination.
- **Axios**: Fetches trip data and images from the server.
- **OpenAI API**: Generates trip itineraries based on user inputs.
- **OpenCage API**: Geocodes destinations to get latitude and longitude coordinates.

## Project Presentation

For more detailed information, refer to the project presentation: [finalProjectWEB.pptx](path/to/finalProjectWEB.pptx).
