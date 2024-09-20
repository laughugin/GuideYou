import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import Rating from '@mui/material/Rating';
import './HotelCard.css';

const HotelCard = ({ hotel }) => {
  return (
    <div className="hotel-card-container">
      <Card className="card" variant="outlined" style={{ backgroundColor: '#444', color: '#fff' }}>
        <CardMedia
          component="img"
          alt={hotel.name}
          style={{ height: '140px', objectFit: 'cover' }} // Ensure image covers area
          image={hotel.image || 'https://via.placeholder.com/140'}
        />
        <CardContent style={{ height: 'calc(100% - 140px)', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            {hotel.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Address: {hotel.address || 'No address available.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Price: {hotel.price || 'Price not available.'}
          </Typography>
          <Rating name="read-only" value={hotel.rating || 0} readOnly precision={0.5} />
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelCard;
