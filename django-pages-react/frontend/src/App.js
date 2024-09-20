import React, { Component } from "react";
import axios from "axios";
import DropzoneComponent from "./components/DropzoneComponent";
import CircularProgress from '@mui/material/CircularProgress';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import HotelCard from './components/HotelCard'; // Make sure to create this component
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
    };
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
          const { coordinates, directions, hotels } = response.data;
          console.log(hotels); // Check the structure here
          this.setState({
              coordinates,
              directions,
              hotels,
              uploadedFile: URL.createObjectURL(file),
              loading: false
          });
      })
      .catch(error => {
        console.error("Error uploading file:", error);
        this.setState({ loading: false });
      });
  };

  renewUpload = () => {
    this.setState({ coordinates: null, directions: null, hotels: null, uploadedFile: null });
  };

  render() {
    const { coordinates, directions, hotels, uploadedFile, loading, userLocation } = this.state;

    return (
      <main className="container" style={{ backgroundColor: '#000000', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: '#333', padding: '10px', zIndex: 1000 }}>
          <h1 className="text text-uppercase text-left" style={{ color: '#ffffff', marginLeft: '20px' }}>
            TravelNavigator
          </h1>
        </header>

        {/* Main Content */}
        <div style={{ marginTop: '80px' }}>
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
                      <p>Latitude: {coordinates.lat.toFixed(4)}</p>
                      <p>Longitude: {coordinates.lng.toFixed(4)}</p>
                    </div>
                  )}
                  {directions && (
                    <div style={{ marginTop: '20px' }}>
                      <Typography variant="h6">Directions:</Typography>
                      <ul>
                        {directions.map((step, index) => (
                          <li key={index} dangerouslySetInnerHTML={{ __html: step.html_instructions }} />
                        ))}
                      </ul>
                    </div>
                  )}
                  {hotels && (
                    <div style={{ marginTop: '20px' }}>
                      <Typography variant="h6">Nearby Hotels:</Typography>
                      <Grid container spacing={2}>
                        {hotels.map((hotel, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <HotelCard hotel={hotel} />
                          </Grid>
                        ))}
                      </Grid>
                    </div>
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
