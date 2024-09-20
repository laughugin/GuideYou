import React, { Component } from "react";
import axios from "axios";
import DropzoneComponent from "./components/DropzoneComponent";  // Import the Dropzone component

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coordinates: null
    };
  }

  handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    axios.post("http://127.0.0.1:8000/api/upload/", formData)
      .then(response => {
        const { coordinates } = response.data;
        this.setState({ coordinates });
      })
      .catch(error => console.error(error));
  };

  render() {
    const { coordinates } = this.state;
    return (
      <main className="container" style={{ backgroundColor: '#000000' }}>
        <h1 className="text text-uppercase text-center my-4" style={{ color: '#a10b97' }}>
          Drag and Drop File Upload
        </h1>
        <div className="row">
          <div className="col-md-6 col-sm-10 mx-auto p-0">
            <div className="card p-3">
              <div>
                <DropzoneComponent onDrop={this.handleDrop} />
                {coordinates && (
                  <div>
                    <h3>Coordinates:</h3>
                    <p>Latitude: {coordinates.lat}</p>
                    <p>Longitude: {coordinates.lng}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

export default App;
