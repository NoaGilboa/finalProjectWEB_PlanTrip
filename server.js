const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const Image = require('./Image');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// API keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY1;
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
const API_KEY = process.env.API_KEY;

const ongoingRequests = new Map();


// for the http request from the client to server
app.use(express.json());
// Serve static files from the current directory
app.use(express.static(__dirname));

app.use(cors());
console.log(`the openai key is ${OPENAI_API_KEY}, the opencage key is ${OPENCAGE_API_KEY} and the api key is ${API_KEY}`);

const CLIENT_AGENT = 'unknown:0:unknown';
let REQUEST_ID = '-3ce8-40f1-a1dcaafcf371-f8079deca57b';

const payload =
    {
        "prompt": "",
        "params": {
          "cfg_scale": 7.5,
          "denoising_strength": 0.75,
          "seed": "312912",
          "height": 512,
          "width": 512,
          "seed_variation": 1,
          "steps":10
      }

    };

const headers = {
  'apikey': API_KEY,
  'Client-Agent': CLIENT_AGENT,
};


// Serve the index.html file when the root URL is accessed
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

['/trip1', '/trip2', '/trip3'].forEach(route => {
  app.get(route, (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
  });
});

for(let i = 1; i <= 3; i++) {
  app.post(`/trip${i}`, async (req, res) => {             

      const { country, tripType } = req.body;

      const prompt = `"Suggest routes for ${tripType} travel in ${country}."Please write the information in the following format for each place: "Time: {time}, Place: {place name}, Activity: {what to do there}", I'm using it with API.`;
      console.log(`from server side the country and the trip type are : ${country} and ${tripType}`);
      let passed = true;
      do {
        passed = true;
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
              model: "gpt-3.5-turbo",
              messages: [
                  {"role": "system", "content": "You are a helpful assistant."},
                  {"role": "user", "content": `${prompt}`}
              ],
            }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
              });

              console.log(`Full response is ${JSON.stringify(response.data)}`);
              const itineraries = response.data.choices[0].message.content.trim().split('\n').map(item => {
                const parts = item.split(', ').map(i => i.split(': ')[1]);
                return { time: parts[0], place: parts[1], activity: parts[2] };
            });

              console.log(`the itineraries is ${JSON.stringify(itineraries)}`);
              const coordinates = [];

              // Geocoding places to get coordinates
              for (const itinerary of itineraries) {
                const place = itinerary.place;
                console.log(`the place is ${place}`);
                const geoResponse = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
                  params: {
                    q: place,
                    key: OPENCAGE_API_KEY,
                    pretty: 1
                  }
                });

                if (geoResponse.data.results.length > 0) {
                  const { lat, lng } = geoResponse.data.results[0].geometry;
                  coordinates.push({ place, lat, lng });
                } else {
                  coordinates.push({ place, lat: null, lng: null, error: "Coordinates not found" });
                }
              }

              console.log(`the coordinates is ${JSON.stringify(coordinates)}`);

               // Initiate the image generation process
               imageUrl = await initiateImageGeneration(itineraries[i-1].place);
               console.log(`the image url from 1 is ${imageUrl}\n\n\n\n`);

              // Sending itinerary and coordinates to the client
              res.json({ itinerary: itineraries, coordinates, imageUrl });

        } catch (error) {
            passed = false;
            console.log('Failed! Retrying...');
            console.error('Error generating HTML:', error);
        }
      } while(!passed);
  });
}

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Images', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Function to initiate the image generation process
function initiateImageGeneration(country) {
  payload.prompt = country;
  if (ongoingRequests.has(country)) {
      return ongoingRequests.get(country);
  }
  let promise = axios.post('https://stablehorde.net/api/v2/generate/async', payload, { headers })
      .then(response => {
          REQUEST_ID = Object.entries(response.data)[0][1];
          console.log('Image generation initiated with ID:', REQUEST_ID);
          return checkStatus(REQUEST_ID, 0);  // Adding retry count
      })
      .catch(error => {
          console.error('Error initiating request:', error);
          throw error;
      })
      .finally(() => {
          ongoingRequests.delete(country);  // Clean up after completion
      });

  ongoingRequests.set(country, promise);
  return promise;
}

// Function to check the status and return the image URL when ready
async function checkStatus(requestId, retryCount) {
  if (retryCount > 30) {  // Maximum of 30 retries
      throw new Error("Maximum retries exceeded");
  }
  const response = await axios.get(`https://stablehorde.net/api/v2/generate/status/${requestId}`, { headers });
  if (response.data.finished === 1) {
      console.log('Image generation is complete.');
      const imgUrl = response.data.generations[0].img;
      const image = new Image({ img: imgUrl });
      await image.save();
      return imgUrl;
  } else {
      console.log('Image generation is still in progress. Next check after waiting...');
      let waitTime = response.headers['retry-after'] ? parseInt(response.headers['retry-after']) * 1000 : 5000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return checkStatus(requestId, retryCount + 1);
  }
}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


