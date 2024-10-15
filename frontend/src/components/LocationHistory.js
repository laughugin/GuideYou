import React, { Component } from 'react';

class LocationHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchHistory: []
    };
  }

  componentDidMount() {
    // Fetch the search history from localStorage or from the server (if implemented)
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      this.setState({ searchHistory: JSON.parse(savedHistory) });
    }
  }

  render() {
    const { searchHistory } = this.state;

    return (
      <div style={{ padding: '20px', color: 'white' }}>
        <h1>My Location Search History</h1>
        {searchHistory.length === 0 ? (
          <p>No history available.</p>
        ) : (
          <ul>
            {searchHistory.map((location, index) => (
              <li key={index}>{location}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default LocationHistory;
