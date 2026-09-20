import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTitle } from 'react-use';

import { Container, Typography, Grid, Button, Box, Alert, Paper } from '@mui/material';
import { Book, AssignmentTurnedIn } from '@mui/icons-material';

import { courseService } from '../api/courseService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './snippets/LoadingSpinner.jsx';
import CourseCard from './snippets/CourseCard.jsx';

export default function Homepage() {
    const { user, isAuthenticated } = useAuth();
    const [courses, setCourses] = useState([]);

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    useTitle('Home - K-Method');

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const data = await courseService.getCourses();
                setCourses(data);
            } catch (error) {
                setMessage({ 'type': 'error', 'text': error.response?.data?.detail || 'Failed to load courses.' });
                console.error(error)
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleEnroll = async (courseId) => {
        setLoading(true);
        try {
            const data = await courseService.enrollCourse(courseId);
            setMessage({ type: 'success', text: 'Enrollment request sent!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Enrollment failed' });
            console.error(error);
        } finally {
            setLoading(false);
        };
    };

    const analytics = {
        totalCourses: courses.length,
        enrollments: user?.student_profile?.enrolled_courses?.length,
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
            {isAuthenticated ? (
                <>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Welcome, {user.first_name}
                    </Typography>

                    {message && (
                        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                            {message.text}
                        </Alert>
                    )}

                    {/* Analytics Section */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid xs={12} sm={4}>
                            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)' }}>
                                <Book sx={{ mr: 2, color: 'primary.main' }} />
                                <Box>
                                    <Typography variant="h6">{analytics.totalCourses}</Typography>
                                    <Typography variant="body2" color="text.secondary">Total Courses</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                        {/* <Grid xs={12} sm={4}>
                            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)' }}>
                                <People sx={{ mr: 2, color: 'warning.main' }} />
                                <Box>
                                    <Typography variant="h6">{analytics.pendingRequests}</Typography>
                                    <Typography variant="body2" color="text.secondary">Pending Requests</Typography>
                                </Box>
                            </Paper>
                        </Grid> */}
                        <Grid xs={12} sm={4}>
                            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)' }}>
                                <AssignmentTurnedIn sx={{ mr: 2, color: 'success.main' }} />
                                <Box>
                                    <Typography variant="h6">{analytics.enrollments}</Typography>
                                    <Typography variant="body2" color="text.secondary">Enrollments</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                        My Courses:
                    </Typography>

                    <Grid container spacing={3}>
                        {user.student_profile?.enrolled_courses?.length > 0 ?
                            user.student_profile?.enrolled_courses?.map(course => (
                                <Grid xs={12} sm={6} md={4} key={course.id}>
                                    <CourseCard course={course} />
                                </Grid>
                            )):(
                                <Typography color="secondary">You are not enrolled to any courses yet!</Typography>
                            )
                        }
                    </Grid>

                    <Typography variant="h5" gutterBottom sx={{ mt: 5, mb: 4, fontWeight: 'bold' }}>
                        More Courses:
                    </Typography>

                    <Grid container spacing={3}>
                        {courses.filter(course =>
                            !user?.student_profile?.enrolled_courses?.some(enrolled => enrolled.id === course.id)
                        ).map(course => (
                            <Grid xs={12} sm={6} md={4} key={course.id}>
                                <CourseCard course={course} />
                            </Grid>
                        ))}
                    </Grid>
                </>
            ) : (
                <>
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Welcome to K-Method
                        </Typography>
                        <Typography variant="h5" color="text.secondary">
                            The way to modern learning...
                        </Typography>
                        <Box sx={{ mt: 4 }}>
                            <Button variant="contained" color="primary" size="large" component={RouterLink} to="/register" sx={{ mr: 2 }}>
                                Get Started
                            </Button>
                            <Button variant="outlined" color="primary" size="large" component={RouterLink} to="/login">
                                Sign In
                            </Button>
                        </Box>
                    </Box>

                    <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                        Available Courses
                    </Typography>
                    <Grid container spacing={4}>
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <Grid xs={12} sm={6} md={4} key={course.id}>
                                    <CourseCard course={course} />
                                </Grid>
                            ))
                        ) : (
                            <Grid xs={12}>
                                <Typography color="text.secondary">No courses available yet.</Typography>
                            </Grid>
                        )}
                    </Grid>
                </>
            )}
        </Container >

    );
}
