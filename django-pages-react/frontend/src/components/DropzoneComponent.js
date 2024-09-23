import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, Typography, CardContent, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; 

const DropzoneComponent = ({ onDrop, children }) => {
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Card {...getRootProps()} sx={{ border: '6px dashed #ccc', padding: '20px', textAlign: 'center' }}>
      <input {...getInputProps()} />
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <CloudUploadIcon sx={{ fontSize: 118, color: '#000000', mb: 2 }} /> 
          <Typography variant="h6" component="div">
            Drag 'n' drop some files here, or click to select files
          </Typography>
          {children} 
        </Box>
      </CardContent>
    </Card>
  );
};

export default DropzoneComponent;
