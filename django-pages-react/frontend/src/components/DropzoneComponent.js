import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, Typography, CardContent } from '@mui/material';

const DropzoneComponent = ({ onDrop }) => {
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Card {...getRootProps()} sx={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
      <input {...getInputProps()} />
      <CardContent>
        <Typography variant="h6" component="div">
          Drag 'n' drop some files here, or click to select files
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DropzoneComponent;
