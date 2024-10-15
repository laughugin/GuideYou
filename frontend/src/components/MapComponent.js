import React, { useEffect, useState, useMemo } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { useJsApiLoader } from '@react-google-maps/api'; 

const MapComponent = ({ origin, destination }) => {
    const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    const { isLoaded } = useJsApiLoader(
        useMemo(() => ({
            id: 'google-map-script',
            googleMapsApiKey: googleMapsApiKey,
            libraries: ['geometry', 'drawing'],
        }), [])
    );

    const [directions, setDirections] = useState(null);

    const mapStyles = {
        height: "400px",
        width: "100%"
    };

    const fetchDirections = async () => {
        if (origin && destination) {
            console.log("Fetching directions from", origin, "to", destination);
            try {
                const directionsService = new window.google.maps.DirectionsService();
                const result = await directionsService.route({
                    origin: new window.google.maps.LatLng(origin.lat, origin.lng),
                    destination: new window.google.maps.LatLng(destination.lat, destination.lng),
                    travelMode: window.google.maps.TravelMode.DRIVING,
                });
                
                console.log("Directions Result:", result);
                
                // Check if routes are available
                if (result.routes && result.routes.length > 0) {
                    setDirections(result);
                } else {
                    console.error("No routes found:", result);
                }
            } catch (error) {
                console.error("Error fetching directions:", error);
            }
        } else {
            console.log("Origin or destination not provided", { origin, destination });
        }
    };

    useEffect(() => {
        if (isLoaded) {
            fetchDirections();
        }
    }, [origin, destination, isLoaded]);

    return (
        <div>
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={mapStyles}
                    zoom={14}
                    center={origin || { lat: 0, lng: 0 }} 
                >
                    {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
            ) : (
                <div>Loading...</div> 
            )}
        </div>
    );
};

export default MapComponent;
