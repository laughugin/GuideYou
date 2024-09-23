import React, { Component } from "react";
import axios from "axios";
import DropzoneComponent from "./components/DropzoneComponent";
import WelcomeSection from "./components/WelcomeSection";
import Directions from "./components/Directions";
import HotelList from './components/HotelList';
import { Card, Slider, CardContent, Typography, Box, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
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
    this.directionsRef = React.createRef();
    this.accommodationRef = React.createRef();
    

  }
  
  handleFilterToggle = () => {
    this.setState(prevState => ({ filterVisible: !prevState.filterVisible }));
  };

  handleRatingChange = (event, newValue) => {
    this.setState({ filterRating: newValue });
  };

  handleDistanceChange = (event, newValue) => {
    this.setState({ filterDistance: newValue });
  };
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

  scrollToSection = (ref) => {
    if (ref.current) {
      window.scrollTo({ top: ref.current.offsetTop - 20, behavior: 'smooth' }); // Adjusted for better view
    }
  };

  render() {
    const { coordinates, directions, hotels, uploadedFile, loading, userLocation, sortOption, locationResponse, filterVisible, dataFetched } = this.state;
    let filteredHotels = this.filterHotels(hotels || []);
    let sortedHotels = this.sortHotels(filteredHotels, sortOption);

    return (
      <main className="container" style={{ backgroundColor: '#000000', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: '#000000', padding: '10px', zIndex: 1000 }}>
          <h1 className="text text-uppercase text-left" style={{ color: '#ffffff', marginLeft: '20px' }}>TravelNavigator</h1>
        </header>

        <WelcomeSection onScrollDown={() => this.scrollToSection(this.uploadRef)} />

        <div ref={this.uploadRef} style={{ marginBottom: '80px', paddingBottom: '80%' }}> {/* Added paddingTop for fixed header */}
          <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <IconButton onClick={() => this.scrollToSection(this.uploadRef)} sx={{ backgroundColor: '#000', color: '#fff' }}>
              <ArrowDropUpIcon sx={{ fontSize: '48px' }} />
            </IconButton>
          </Box>

          {uploadedFile ? (
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ color: '#ffffff' }}>Detected Location: {locationResponse?.location_name || 'Unknown'}</h1>
              <h3>Uploaded Image:</h3>
              <img src={uploadedFile} alt="Uploaded" style={{ width: '50%', height: '50%', borderRadius: '10px' }} />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.renewUpload}
                  sx={{ fontSize: '16px', padding: '10px 20px', backgroundColor: '#000', color: '#fff', mt: 2, border: '3px solid white', }}
                >
                  Try new image of a place
                </Button>
              </div>
              
            </div>
          ) : (
            <DropzoneComponent onDrop={this.handleDrop}>
              {loading && <CircularProgress style={{ marginTop: '20px' }} />}
            </DropzoneComponent>
          )}
          {uploadedFile && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <IconButton onClick={() => this.scrollToSection(this.directionsRef)} sx={{ backgroundColor: '#000', color: '#fff' }}>
                <ArrowDropDownIcon sx={{ fontSize: '48px' }} />
              </IconButton>
            </Box>
          )}
        </div>
        {uploadedFile && (  
          <div ref={this.directionsRef} style={{ paddingBottom: '70%' }}> {/* Added paddingTop for fixed header */}


            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <IconButton onClick={() => this.scrollToSection(this.uploadRef)} sx={{ backgroundColor: '#000', color: '#fff' }}>
                <ArrowDropUpIcon sx={{ fontSize: '48px' }} />
              </IconButton>
            </Box>

            <Directions directions={directions} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <IconButton onClick={() => this.scrollToSection(this.accommodationRef)} sx={{ backgroundColor: '#000', color: '#fff' }}>
                <ArrowDropDownIcon sx={{ fontSize: '48px' }} />
              </IconButton>
            </Box>





          </div>
        )}
        {uploadedFile && (
          <div ref={this.accommodationRef} style={{ paddingTop: '70%' }}>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <IconButton onClick={() => this.scrollToSection(this.directionsRef)} sx={{ backgroundColor: '#000', color: '#fff' }}>
                <ArrowDropUpIcon sx={{ fontSize: '48px' }} />
              </IconButton>
            </Box>
            <h2 className="text text-uppercase text-center my-4" style={{ color: '#ffffff' }}>Accommodation</h2>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <Button
                variant="outlined"
                color="default"
                onClick={this.handleFilterToggle}
                sx={{ fontSize: '15px', padding: '5px 10px', backgroundColor: '#000', color: '#fff' }}
                startIcon={<FilterListIcon />}
              >
                {filterVisible ? "Hide Filters" : "Show Filters"}
              </Button>

              {/* Sorting Options in a Flex Row */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ color: '#ffffff', fontSize: '20px', marginRight: '8px' }}>Sort By</Typography>
                <FormControl sx={{ minWidth: 100, minHeight: 50 }}>
                  <Select
                    value={this.state.sortOption}
                    onChange={(e) => this.setState({ sortOption: e.target.value })}
                    sx={{
                      fontSize: '15px',
                      padding: '1px',
                      backgroundColor: '#000',
                      color: '#fff',
                      border: '1px solid white',
                    }}
                  >
                    <MenuItem value="distance">Distance</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>


            {filterVisible && (
              <Box sx={{ marginBottom: '20px' }}>
                <Typography style={{ color: '#ffffff' }}>Filter by Distance:</Typography>
                <Slider
                  value={this.state.filterDistance}
                  onChange={this.handleDistanceChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={5}
                  step={0.1}
                />
                <Typography style={{ color: '#ffffff' }}>Filter by Rating:</Typography>
                <Slider
                  value={this.state.filterRating}
                  onChange={this.handleRatingChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={5}
                  step={0.1}
                />
              </Box>
            )}

            <Card variant="outlined" style={{ backgroundColor: '#000', color: '#fff' }}>
              <CardContent>
                {coordinates && (
                  <div style={{ marginTop: '20px' }}>
                    <Typography variant="h6">Coordinates:</Typography>
                    <p>
                      Latitude: {coordinates.lat ? coordinates.lat.toFixed(4) : 'N/A'},
                      Longitude: {coordinates.lng ? coordinates.lng.toFixed(4) : 'N/A'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <HotelList hotels={sortedHotels} />
          </div>
        )}
      </main>
    );
  }
}

export default App;
