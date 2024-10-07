// HotelList.js
import React from 'react';
import { Grid, Typography, Button, Box } from '@mui/material';
import HotelCard from './HotelCard';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

const HotelList = ({ hotels, scrollToUpload }) => {
  return (
    <div style={{ marginTop: '20px' }}> {/* Reduced margin top */}

      {hotels.length > 0 ? (
        <div>
          <Typography variant="h6" style={{ color: '#ffffff', textAlign: 'center', marginBottom: '20px' }}>
            Nearby Hotels:
          </Typography>
          <Grid container spacing={2} style={{ margin: 0 }}> {/* Removed default margins */}
            {hotels.map((hotel, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <HotelCard hotel={hotel} />
              </Grid>
            ))}
          </Grid>
        </div>
      ) : (
        <Typography variant="h6" style={{ color: '#ffffff', textAlign: 'center' }}>
          No nearby hotels found. Please adjust your filters or try a different upload.
        </Typography>
      )}
    </div>
  );
};

export default HotelList;
