import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import { useTitle } from 'react-use';
import { courseService } from '../api/courseService';

export default function Enroll() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useTitle(course ? `Enroll in ${course.name} - K-Method` : 'Enroll - K-Method');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseDetail(id);
        setCourse(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load course enrollment details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Alert severity="error">{error || 'Course not found.'}</Alert>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button variant="outlined" component={RouterLink} to="/" startIcon={<ArrowBackIcon />}>
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  // Sanitize tutor phone number for direct WhatsApp API link (remove spaces, plus, or special chars)
  const formattedPhone = course.tutor_phone_number
    ? course.tutor_phone_number.replace(/[^\d]/g, '')
    : '';

  const whatsappMessage = encodeURIComponent(
    `Hello Dr. ${course.tutor_name || ''}, I would like to enroll in the course "${course.name}". Here is my payment confirmation.`
  );

  const whatsappUrl = formattedPhone
    ? `https://wa.me/${formattedPhone}?text=${whatsappMessage}`
    : '#';

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <Card
        sx={{
          p: { xs: 2, md: 4 },
          backgroundColor: 'rgba(21, 24, 33, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Button
              component={RouterLink}
              to={`/course/${id}`}
              startIcon={<ArrowBackIcon />}
              color="secondary"
              sx={{ mb: 2 }}
            >
              Back to Course
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Course Enrollment Instructions
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Main Instruction Display */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(175, 145, 59, 0.2)',
              borderRadius: 3,
              mb: 4,
            }}
          >
            <Typography variant="h6" sx={{ lineHeight: 1.8, fontWeight: 500 }}>
              To enroll in the course{' '}
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                {course.name}
              </Box>
              , please contact{' '}
              <Box component="span" sx={{ fontWeight: 700 }}>
                Dr. {course.tutor_name || 'Instructor'}
              </Box>{' '}
              {course.tutor_phone_number && `(${course.tutor_phone_number}) `}
              and pay{' '}
              <Box component="span" sx={{ color: 'success.main', fontWeight: 700 }}>
                {course.price ?? '0'} EGP
              </Box>{' '}
              and send the confirmation picture on WhatsApp.
            </Typography>
          </Paper>

          {/* Breakdown Details */}
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonIcon color="primary" />
              <Typography variant="body1">
                <strong>Tutor Name:</strong> Dr. {course.tutor_name || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PaymentIcon color="primary" />
              <Typography variant="body1">
                <strong>Course Fee:</strong> {course.price ?? '0'} EGP
              </Typography>
            </Box>
          </Stack>

          {/* WhatsApp Direct Action Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component="a"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              disabled={!formattedPhone}
              startIcon={<WhatsAppIcon />}
              sx={{
                backgroundColor: '#25D366',
                color: '#fff',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#128C7E',
                },
              }}
            >
              Contact on WhatsApp
            </Button>
            {!formattedPhone && (
              <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                Tutor WhatsApp contact is not available for this course.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}