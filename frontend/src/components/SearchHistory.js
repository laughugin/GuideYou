import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

const SearchHistory = ({ history, clearHistory }) => {
  return (
    <div style={{ color: 'white', padding: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Search History
      </Typography>
      <List>
        {history.length > 0 ? (
          history.map((item, index) => (
            <ListItem key={index}>
              <ListItemText primary={item} />
            </ListItem>
          ))
        ) : (
          <Typography>No search history found.</Typography>
        )}
      </List>
      <button onClick={clearHistory} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#000', color: 'white' }}>
        Clear History
      </button>
    </div>
  );
};

export default SearchHistory;
