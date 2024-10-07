// components/WelcomeSection.js
import React, { useState } from 'react';
import { Typography, IconButton, Box } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const WelcomeSection = ({ onScrollDown }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '500vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '0%',
        margin: '10%',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '120%',
        }}
      >
        <Box sx={{ zIndex: 1, textAlign: 'left', width: '100%', margin: '5%' }}>
          <Typography variant="h3" gutterBottom>
            Welcome to TravelNavigator!
          </Typography>
          <Typography variant="h5" paragraph>
            Easily upload images of landmarks to discover their locations. Get step-by-step directions from your current location and explore nearby hotels with ratings and photos. Filter and sort hotel options to find the perfect stay.
          </Typography>
          <Typography variant="h5" paragraph>
            Start your adventure! Try now!
          </Typography>
        </Box>

        <Box
          sx={{
            width: '140%',
            height: '70%',
            border: '5px solid #ffffff',
            borderRadius: '15px',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 0,
          }}
        >
          <Box
            component="img"
            src={`${process.env.PUBLIC_URL}/waterfall.jpg`}
            alt="Waterfall"
            onLoad={() => setImageLoaded(true)}
            onError={() => console.error('Image failed to load.')}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: imageLoaded ? 'block' : 'none',
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <IconButton
          onClick={onScrollDown}
          sx={{
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '20%',
            fontSize: '5px',
            borderRadius: '50%',
          }}
        >
          <ArrowDropDownIcon sx={{ fontSize: '64px' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default WelcomeSection;
