import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTitle } from 'react-use';

export default function NotFound() {
  useTitle('404 Page Not Found - K-Method');
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 8 },
          textAlign: 'center',
          backgroundColor: 'rgba(21, 24, 33, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
        }}
      >
        {/* Large 404 Accent Text */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', sm: '9rem' },
            fontWeight: 800,
            background: 'linear-gradient(180deg, #AF913B 0%, rgba(175, 145, 59, 0.2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            mb: 2,
            letterSpacing: '-2px',
          }}
        >
          404
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: '500px', mx: 'auto', mb: 5 }}
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>

        {/* Navigation Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
          >
            Return Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}