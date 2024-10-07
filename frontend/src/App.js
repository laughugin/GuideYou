import React, { Component } from "react";
import axios from "axios";
import DropzoneComponent from "./components/DropzoneComponent";
import WelcomeSection from "./components/WelcomeSection";
import Directions from "./components/Directions";
import HotelList from './components/HotelList';
import { Slider, Typography, Box, Button, FormControl,Select, MenuItem, CircularProgress, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import GoogleIcon from '@mui/icons-material/Google';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MapComponent from "./components/MapComponent";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
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
      directionsVisible: false,
      guessedCoordinates: null,
      credentialResponse: null,
      userPayload: null,
      userName: '',
      userProfilePic: '',
    };
    this.welcomeRef = React.createRef();
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
  
    const savedUserPayload = localStorage.getItem('userPayload');
    if (savedUserPayload) {
      const userPayload = JSON.parse(savedUserPayload);
  
      this.setState({
        userPayload,
        userName: userPayload.name,
        userProfilePic: userPayload.picture,
      });
    }
  }
  
  toggleDirectionsVisibility = () => {
    this.setState(prevState => ({ directionsVisible: !prevState.directionsVisible }));
  };

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

  decodeJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  };

  handleLoginSuccess = (credentialResponse) => {
    const idToken = credentialResponse.credential;
    const userPayload = this.decodeJwt(idToken);
  
    this.setState({
      userPayload, 
      userName: userPayload.name,
      userProfilePic: userPayload.picture,
    });
  
    localStorage.setItem('userPayload', JSON.stringify(userPayload));
  
    console.log('User Info:', userPayload);
  };
  
  handleLogout = () => {
    this.setState({
      userPayload: null, 
      userName: '',
      userProfilePic: '',
    });
  

    localStorage.removeItem('userPayload');
  
    console.log("User logged out");
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
        const { directions, hotels, location, guessed_location_name, guessed_coordinates } = response.data;
        console.log("Response data from server:", response.data);
        console.log("Directions:", directions);
        console.log("Hotels:", hotels);
        console.log("Location Response:", location);
        console.log("Guessed Location Name:", guessed_location_name);
        console.log("Guessed Coordinates:", guessed_coordinates);

        this.setState({
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
    this.setState({
      coordinates: null,
      directions: null,
      hotels: null,
      uploadedFile: null,
      locationResponse: null,
      guessedLocationName: null,
      guessedCoordinates: null,
      dataFetched: false
    });
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



  scrollToSection = (ref) => {
    if (ref.current) {
      window.scrollTo({ top: ref.current.offsetTop - 20, behavior: 'smooth' });
    }
  };

  
  render() {
    const {  directions, hotels, uploadedFile, loading, userLocation, sortOption, locationResponse, filterVisible,  directionsVisible, guessedCoordinates, userPayload, userName, userProfilePic } = this.state;
    let filteredHotels = this.filterHotels(hotels || []);
    let sortedHotels = this.sortHotels(filteredHotels, sortOption);
    const key = process.env.REACT_APP_GOOGLE_CLIENT_ID

    return (
      <GoogleOAuthProvider clientId={key}>
        <main className="container" style={{ backgroundColor: '#000000', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#000000',
            padding: '10px',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{
              color: '#ffffff',
              marginLeft: '20px',
              textTransform: 'uppercase'
            }}>
              TravelNavigator
            </h1>

            {userPayload ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'white' }}>Welcome, {userName}!</span>
                {userProfilePic && (
                  <img
                    src={userProfilePic}
                    alt="Profile"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginLeft: '8px', border: '2px solid white' }}
                  />
                )}
                <Button onClick={this.handleLogout} variant="outlined" color="inherit" startIcon={<LogoutIcon />} style={{ marginLeft: '10px', color: 'white' }}>
                  Logout
                </Button>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={this.handleLoginSuccess}
                onError={() => console.log('Login Failed')}
                size="large"
                theme="filled_black"
                text="signin"
                shape="square"
                render={renderProps => (
                  <Button variant="outlined" color="inherit" startIcon={<GoogleIcon />} onClick={renderProps.onClick} disabled={renderProps.disabled}>
                    Login with Google
                  </Button>
                )}
              />
            )}
          </header>



        
            <div ref={this.welcomeRef}>
              <WelcomeSection onScrollDown={() => this.scrollToSection(this.uploadRef)} />
            </div>
            
            <div ref={this.uploadRef} style={{ marginBottom: '80px', paddingBottom: '80%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <IconButton onClick={() => this.scrollToSection(this.welcomeRef)} sx={{ backgroundColor: '#000', color: '#fff' }}>
                  <ArrowDropUpIcon sx={{ fontSize: '48px' }} />
                </IconButton>
              </Box>
            
              {uploadedFile ? (
                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ color: '#ffffff' }}>Detected Location: {locationResponse?.location_name || 'Unknown'}</h1>
                  <h3>Uploaded Image:</h3>
                  <img src={uploadedFile} alt="Uploaded" style={{ width: '60%', height: '60%', borderRadius: '10px' }} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.renewUpload}
                      sx={{ fontSize: '16px', padding: '10px 20px', backgroundColor: '#000', color: '#fff', mt: 2, border: '3px solid white' }}
                    >
                      Try new image of a place
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 style={{ textAlign: 'center', color: 'white', marginTop: "2%", marginBottom: '10%' }}>Start by uploading image of your desired place...</h1>
                  <DropzoneComponent onDrop={this.handleDrop}>
                    {loading && <CircularProgress style={{ marginTop: '10%' }} />}
                  </DropzoneComponent>
                </div>
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
              <div ref={this.directionsRef} style={{ paddingBottom: '70%' }}> 
                <h1 style={{ color: 'white', textAlign: 'center' }}>How to get there?</h1>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  
                  <IconButton onClick={() => this.scrollToSection(this.uploadRef)} sx={{ backgroundColor: '#000', color: '#fff' }}>
                    <ArrowDropUpIcon sx={{ fontSize: '48px' }} />
                  </IconButton>
                </Box>
                <MapComponent 
                    origin={userLocation} 
                    destination={guessedCoordinates}  
                />
                <Button
                  onClick={this.toggleDirectionsVisibility}
                  variant="contained"
                  color="primary"
                  sx={{ display: 'block', backgroundColor: '#000', color: '#fff' }}
                  endIcon={<ExpandMoreIcon />}
                >
                  {directionsVisible ? "Hide Directions" : "Show Directions"}
                </Button>
            
                <Collapse in={directionsVisible}>
                  <Directions directions={directions} />
                </Collapse>
            
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <IconButton onClick={() => this.scrollToSection(this.accommodationRef)} sx={{ backgroundColor: '#000', color: '#fff' }}>
                    <ArrowDropDownIcon sx={{ fontSize: '48px' }} />
                  </IconButton>
                </Box>
              </div>
            )}
            
            {uploadedFile && (
              <div style={{ paddingTop: '70%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <IconButton onClick={() => this.scrollToSection(this.directionsRef)} sx={{ backgroundColor: '#000', color: '#fff' }}>
                    <ArrowDropUpIcon sx={{ fontSize: '48px' }} />
                  </IconButton>
                </Box>
                <h2 className="text text-uppercase text-center my-4" style={{ color: '#ffffff' }}>Accommodation</h2>
            
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div ref={this.accommodationRef}>
                    <Button
                      variant="outlined"
                      color="default"
                      onClick={this.handleFilterToggle}
                      sx={{ fontSize: '15px', padding: '5px 10px', backgroundColor: '#000', color: '#fff' }}
                      startIcon={<FilterListIcon />}
                    >
                      {filterVisible ? "Hide Filters" : "Show Filters"}
                    </Button>
                  </div>
            
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
                      onChange={(event, newValue) => this.setState({ filterDistance: newValue })}
                      valueLabelDisplay="auto"
                      min={0}
                      max={5}
                      step={0.1}
                      sx={{ color: '#ffffff' }}
                    />
                    <Typography style={{ color: '#ffffff' }}>Filter by Rating:</Typography>
                    <Slider
                      value={this.state.filterRating}
                      onChange={(event, newValue) => this.setState({ filterRating: newValue })}
                      valueLabelDisplay="auto"
                      min={0}
                      max={5}
                      step={0.1}
                      sx={{ color: '#ffffff' }}
                    />
                  </Box>
                )}
                
                <HotelList hotels={sortedHotels} />
              </div>
            )}
        
        </main>
      </GoogleOAuthProvider>
    );
  }
}

export default App;
