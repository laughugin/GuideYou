// App.js
import React, { Component } from "react";
import axios from "axios";
import DropzoneComponent from "./components/DropzoneComponent";
import WelcomeSection from "./components/WelcomeSection";
import { Card, CardContent, Typography, Grid, Box, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import HotelCard from './components/HotelCard';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coordinates: null,
      userLocation: null,
      directions: null,
      hotels: null,
      uploadedFile: null,
      loading: false,
      sortOption: 'distance',
      filterRating: [0, 5],
      filterDistance: [0, 5],
      filterVisible: false,
      dataFetched: false,
    };
    this.uploadRef = React.createRef();
  }

  componentDidMount() {
    this.getUserLocation();
  }

  getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.setState({ userLocation: { lat: latitude, lng: longitude } }, () => {
            this.sendUserLocationToBackend(this.state.userLocation);
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  sendUserLocationToBackend = (location) => {
    axios.post("http://127.0.0.1:8000/api/user-location/", location)
      .then(response => {
        console.log("User location sent to backend:", response.data);
      })
      .catch(error => console.error("Error sending user location:", error));
  };

  handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    const { userLocation } = this.state;
    if (userLocation) {
      formData.append("user_location", JSON.stringify(userLocation));
    } else {
      console.error("User location is not available");
    }

    this.setState({ loading: true });

    axios.post("http://127.0.0.1:8000/api/upload/", formData)
      .then(response => {
        const { coordinates, directions, hotels, location, guessed_location_name, guessed_coordinates } = response.data;
        this.setState({
          coordinates,
          directions,
          hotels,
          locationResponse: location,
          guessedLocationName: guessed_location_name,
          guessedCoordinates: guessed_coordinates,
          uploadedFile: URL.createObjectURL(file),
          loading: false,
          dataFetched: true,
        });
      })
      .catch(error => {
        console.error("Error uploading file:", error);
        this.setState({ loading: false });
      });
  };

  renewUpload = () => {
    this.setState({ coordinates: null, directions: null, hotels: null, uploadedFile: null, locationResponse: null, guessedLocationName: null, guessedCoordinates: null, dataFetched: false });
  };

  sortHotels = (hotels, sortOption) => {
    return hotels.sort((a, b) => {
      if (sortOption === 'distance') {
        return a.distance - b.distance;
      } else if (sortOption === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });
  };

  filterHotels = (hotels) => {
    return hotels.filter(hotel => {
      const withinRating = hotel.rating >= this.state.filterRating[0] && hotel.rating <= this.state.filterRating[1];
      const withinDistance = hotel.distance >= this.state.filterDistance[0] && hotel.distance <= this.state.filterDistance[1];
      return withinRating && withinDistance;
    });
  };

  handleRatingChange = (event, newValue) => {
    this.setState({ filterRating: newValue });
  };

  handleDistanceChange = (event, newValue) => {
    this.setState({ filterDistance: newValue });
  };

  scrollToUpload = () => {
    window.scrollTo({ top: this.uploadRef.current.offsetTop, behavior: 'smooth' });
  };

  render() {
    const { coordinates, directions, hotels, uploadedFile, loading, userLocation, sortOption, locationResponse, filterVisible, dataFetched } = this.state;
    let filteredHotels = this.filterHotels(hotels || []);
    let sortedHotels = this.sortHotels(filteredHotels, sortOption);

    return (
      <main className="container" style={{ backgroundColor: '#000000', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: '#333', padding: '10px', zIndex: 1000 }}>
          <h1 className="text text-uppercase text-left" style={{ color: '#ffffff', marginLeft: '20px' }}>TravelNavigator</h1>
        </header>

        <WelcomeSection onScrollDown={this.scrollToUpload} />

        <div ref={this.uploadRef} style={{ marginTop: '80px' }}>
          {uploadedFile && (
            <>
              <h1 style={{ color: '#ffffff', textAlign: 'center' }}>
                Detected Location: {locationResponse?.location_name || 'Unknown'}
              </h1>

              {/* Directions */}
              {dataFetched && Array.isArray(directions) && directions.length > 0 ? (
                <div style={{ marginTop: '20px' }}>
                  <Typography variant="h6">Directions:</Typography>
                  <ul>
                    {directions.map((step, index) => (
                      <li key={index} dangerouslySetInnerHTML={{ __html: step.html_instructions }} />
                    ))}
                  </ul>
                </div>
              ) : (
                dataFetched && <Typography variant="h6" style={{ color: '#ffffff' }}>No routes found. Please try again.</Typography>
              )}

              {/* Filter and Sort Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', marginTop: '20px' }}>
                <Button
                  variant="outlined"
                  color="default"
                  onClick={() => this.setState({ filterVisible: !filterVisible })}
                  style={{ backgroundColor: '#000', color: '#fff' }}
                  startIcon={<FilterListIcon />}
                >
                  {filterVisible ? "Hide Filters" : "Show Filters"}
                </Button>

                <FormControl variant="outlined" style={{ minWidth: 120 }}>
                  <InputLabel id="sort-label" style={{ color: '#ffffff' }}>Sort By</InputLabel>
                  <Select
                    labelId="sort-label"
                    value={this.state.sortOption}
                    onChange={(e) => this.setState({ sortOption: e.target.value })}
                    style={{ backgroundColor: '#000', color: '#fff', border: '1px solid white' }}
                  >
                    <MenuItem value="distance">Distance</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </>
          )}

          {/* Upload and Hotel Listings Section */}
          <h2 className="text text-uppercase text-center my-4" style={{ color: '#ffffff' }}>
            Drag and Drop File Upload
          </h2>
          
          <div className="row">
            <div className="col-md-10 mx-auto p-0">
              <Card variant="outlined" style={{ backgroundColor: '#333', color: '#fff' }}>
                <CardContent>
                  {userLocation && (
                    <Typography variant="h6" style={{ marginBottom: '20px', textAlign: 'center' }}>
                      Your Location: Latitude {userLocation.lat.toFixed(4)}, Longitude {userLocation.lng.toFixed(4)}
                    </Typography>
                  )}

                  {uploadedFile ? (
                    <div style={{ textAlign: 'center' }}>
                      <h3>Uploaded Image:</h3>
                      <img src={uploadedFile} alt="Uploaded" style={{ width: '100%', height: 'auto', borderRadius: '10px' }} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <IconButton onClick={this.renewUpload} style={{ color: '#6200ea' }}>
                          <RefreshIcon sx={{ fontSize: 96, color: '#000000', mb: 2 }} />
                        </IconButton>
                      </div>
                    </div>
                  ) : (
                    <DropzoneComponent onDrop={this.handleDrop}>
                      {loading && <CircularProgress style={{ marginTop: '20px' }} />}
                    </DropzoneComponent>
                  )}

                  {coordinates && (
                    <div style={{ marginTop: '20px' }}>
                      <Typography variant="h6">Coordinates:</Typography>
                      <p>
                        Latitude: {coordinates.lat ? coordinates.lat.toFixed(4) : 'N/A'},
                        Longitude: {coordinates.lng ? coordinates.lng.toFixed(4) : 'N/A'}
                      </p>
                    </div>
                  )}

                  {dataFetched && sortedHotels.length > 0 ? (
                    <div style={{ marginTop: '20px' }}>
                      <Typography variant="h6">Nearby Hotels:</Typography>
                      <Grid container spacing={2}>
                        {sortedHotels.map((hotel, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <HotelCard hotel={hotel} />
                          </Grid>
                        ))}
                      </Grid>
                    </div>
                  ) : (
                    dataFetched && <Typography variant="h6" style={{ color: '#ffffff' }}>No nearby hotels found. Please adjust your filters or try a different upload.</Typography>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

export default App;
