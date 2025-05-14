import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      textAlign="center"
      p={3}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Sidan hittades inte
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Sidan du letar efter existerar inte eller har flyttats.
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 2 }}
      >
        Gå till Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage;