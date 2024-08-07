document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('roadTripForm');
    const tripSelector = document.getElementById('tripSelector');
    const loadButton = document.getElementById('loadButton');
    let selectedTripData = null; // Store the selected trip data
    const loadingOverlay = createLoadingOverlay();

    function createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner"></div><p>Image generation and route creation are loading...</p>';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);
        return overlay;
    }

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        showLoading(); // Show the loading overlay while fetching data
        const country = document.getElementById('country').value;
        const tripType = document.getElementById('tripType').value;

        // Hide form and show trip selection options
        form.style.display = 'none';
        tripSelector.style.display = 'block';
        loadButton.style.display = 'block';

        // Pre-fetch and store trip data for each trip
        window.tripData = {}; // Initialize an object to hold fetched data

        ['trip1', 'trip2', 'trip3'].forEach(trip => {
            axios.post(`/${trip}`, { country, tripType })
                .then(response => {
                    console.log(`Data: ${JSON.stringify(response.data)}`);
                    // Store each trip's data in a global object
                    window.tripData[trip] = response.data;
                    if (trip === tripSelector.value) {
                        hideLoading();
                    }
                })
                .catch(error => {
                    console.error('Error fetching itinerary for ' + trip + ':', error);
                });
        });
    });

    loadButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default form submission
        const selectedTrip = tripSelector.value;
        if (window.tripData && window.tripData[selectedTrip]) {
            // Use the stored data to create a map
            selectedTripData = window.tripData[selectedTrip];
            createMap(selectedTripData.coordinates, selectedTripData.itinerary);

            // Update the URL without reloading the page
            window.history.pushState({}, '', `/${selectedTrip}`);
        }
    });

    tripSelector.addEventListener('change', function(event) {
        event.preventDefault(); // Prevent the default form submission
        const selectedTrip = tripSelector.value;
        if (window.tripData && window.tripData[selectedTrip]) {
            // Use the stored data to update the map
            selectedTripData = window.tripData[selectedTrip];
            createMap(selectedTripData.coordinates, selectedTripData.itinerary);
            imageUrl = selectedTripData.imageUrl;
            console.log(`the image url is ${imageUrl}`);

            if (selectedTripData.imageUrl) {
                displayImage(selectedTripData.imageUrl);
            }

            // Update the URL without reloading the page
            window.history.pushState({}, '', `/${selectedTrip}`);
        }
    });

    // Handle the popstate event to load the map when manually navigating to a trip URL
    window.addEventListener('popstate', function(event) {
        console.log('popstate event fired');
        const path = window.location.pathname; // Get the path from the URL
        const selectedTrip = path.substring(1); // Remove the leading '/' character
        if (window.tripData && window.tripData[selectedTrip]) {
            // Use the stored data to load the map for the selected trip
            selectedTripData = window.tripData[selectedTrip];
            createMap(selectedTripData.coordinates, selectedTripData.itinerary);
        }
    });

    function createMap(coordinates, itinerary) {
        // Remove any existing map
        const existingMap = document.getElementById('map');
        if (existingMap) {
            existingMap.parentNode.removeChild(existingMap);
        }

        // Create a new map
        const mapDiv = document.createElement('div');
        mapDiv.id = 'map';
        mapDiv.style.height = '600px'; // Ensure map visibility
        mapDiv.style.width = '1100px'; // Ensure map visibility
        document.body.appendChild(mapDiv);

        // Initialize the map on the first coordinate
        const map = L.map('map').setView([coordinates[0].lat, coordinates[0].lng], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Variable to store polyline points
        let latlngs = [];
        coordinates.forEach((coord, index) => {
            if (coord.lat && coord.lng) {
                const marker = L.marker([coord.lat, coord.lng]).addTo(map).bindPopup(itinerary[index].place);
                marker.openPopup();
                latlngs.push([coord.lat, coord.lng]);
            }
        });

        // Draw polyline connecting all points
        const polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
        map.fitBounds(polyline.getBounds());
    }
});

function displayImage(imageUrl) {
    const imageContainer = document.getElementById('imageContainer');
    if (!imageContainer) {
        // If the image container does not exist, create it
        const container = document.createElement('div');
        container.id = 'imageContainer';
        container.style.width = '400px';
        container.style.height = '400px';
        container.style.float = 'left'; // Adjust layout as needed
        document.body.appendChild(container);
        imageContainer = container;
    }

    // Set the image inside the container
    imageContainer.innerHTML = `<img src="${imageUrl}" alt="Scenic View" style="width: 100%; height: 100%;">`;
}
