// components/Directions.js
import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TurnLeftIcon from '@mui/icons-material/TurnLeft';
import TurnRightIcon from '@mui/icons-material/TurnRight';
import DestinationIcon from '@mui/icons-material/Place';
import StraightenIcon from '@mui/icons-material/Straighten';

const getDirectionIcon = (instruction) => {
  if (instruction.includes('left')) return <TurnLeftIcon />;
  if (instruction.includes('right')) return <TurnRightIcon />;
  if (instruction.includes('straight')) return <StraightenIcon />;
  if (instruction.includes('arrive')) return <DestinationIcon />;
  return <ArrowForwardIcon />;
};

const Directions = ({ directions }) => {
  if (!Array.isArray(directions) || directions.length === 0) {
    return <Typography variant="h6" style={{ color: '#ffffff' }}>No routes found. Please try again.</Typography>;
  }

  return (
    <Box sx={{ marginTop: '20px' }}>
      <Typography variant="h6" style={{ color: '#ffffff', marginBottom: '10px' }}>Directions:</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {directions.map((step, index) => (
          <Paper key={index} elevation={3} sx={{ display: 'flex', alignItems: 'center', padding: 2, backgroundColor: '#444', borderRadius: '8px' }}>
            <Box sx={{ marginRight: 1, color: '#ffffff' }}>
              {getDirectionIcon(step.instruction)} 
            </Box>
            <Typography variant="body1" dangerouslySetInnerHTML={{ __html: step.instruction }} style={{ color: '#ffffff', flex: 1 }} />
            <Typography variant="body2" style={{ color: '#ffffff', marginLeft: 'auto' }}>
              {`${step.distance} - ${step.duration}`}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Directions;
