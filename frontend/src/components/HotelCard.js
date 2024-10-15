import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import Rating from '@mui/material/Rating';
import './HotelCard.css';

const HotelCard = ({ hotel }) => {
  return (
    <div className="hotel-card-container">
      <Card className="card" variant="outlined">
        <CardMedia
          component="img"
          alt={hotel.name}
          style={{ height: '140px', objectFit: 'cover' }} 
          image={hotel.image_url || 'https://via.placeholder.com/140'}
        />
        <div className="gradient-overlay"></div>
        <CardContent className="card-content">
          <Typography variant="h6" gutterBottom>
            {hotel.name}
          </Typography>
          <Typography variant="body2" className="card-text">
            Address: {hotel.address || 'No address available.'}
          </Typography>
          <Typography variant="body2" className="card-text">
            Distance: {hotel.distance?.toFixed(2) || 'Distance not available.'} km
          </Typography>
          <Rating name="read-only" value={hotel.rating || 0} readOnly precision={0.1} />
          <Typography variant="body2" className="card-text">
            Rating: {hotel.rating?.toFixed(1) || 'No rating available.'}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelCard;
