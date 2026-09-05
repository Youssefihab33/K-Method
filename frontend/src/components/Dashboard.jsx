import { useState, useEffect, useContext } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, Alert, Tabs, Tab, Paper, Stack } from '@mui/material';
import axiosInstance from './APIs/Axios.jsx';
import { UserContext } from './APIs/Context.jsx';
import LoadingSpinner from './snippets/LoadingSpinner.jsx';
import { useTitle } from 'react-use';
import { Book, People, AssignmentTurnedIn } from '@mui/icons-material';

export default function Dashboard() {
    const { user } = useContext(UserContext);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [message, setMessage] = useState(null);

    useTitle('Dashboard - K-Method');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, enrollRes] = await Promise.all([
                axiosInstance.get('/courses/'),
                axiosInstance.get('/enrollments/')
            ]);
            setCourses(coursesRes.data);
            setEnrollments(enrollRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            await axiosInstance.post(`/courses/${courseId}/enroll/`);
            setMessage({ type: 'success', text: 'Enrollment request sent!' });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Enrollment failed' });
        }
    };

    const handleAction = async (id, action) => {
        try {
            await axiosInstance.post(`/enrollments/${id}/${action}/`);
            setMessage({ type: 'success', text: `Request ${action}ed` });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: `Failed to ${action}` });
        }
    };

    const analytics = {
        totalCourses: courses.length,
        pendingRequests: enrollments.filter(e => e.status === 'pending').length,
        approvedEnrollments: enrollments.filter(e => e.status === 'approved').length,
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container sx={{ mt: 4 }}>
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
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)' }}>
                        <Book sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h6">{analytics.totalCourses}</Typography>
                            <Typography variant="body2" color="text.secondary">Total Courses</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)' }}>
                        <People sx={{ mr: 2, color: 'warning.main' }} />
                        <Box>
                            <Typography variant="h6">{analytics.pendingRequests}</Typography>
                            <Typography variant="body2" color="text.secondary">Pending Requests</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)' }}>
                        <AssignmentTurnedIn sx={{ mr: 2, color: 'success.main' }} />
                        <Box>
                            <Typography variant="h6">{analytics.approvedEnrollments}</Typography>
                            <Typography variant="body2" color="text.secondary">Approved Enrollments</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label={user.is_tutor ? "My Courses" : "Available Courses"} />
                    <Tab label="Enrollment Requests" />
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <Grid container spacing={3}>
                    {courses.map(course => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{course.name}</Typography>
                                    <Typography color="text.secondary">{course.tutor_name}</Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>{course.description}</Typography>
                                    {!user.is_tutor && !course.is_enrolled && (
                                        <Button 
                                            variant="contained" 
                                            sx={{ mt: 2 }} 
                                            fullWidth
                                            onClick={() => handleEnroll(course.id)}
                                            disabled={course.enrollment_status === 'pending'}
                                        >
                                            {course.enrollment_status === 'pending' ? 'Pending Approval' : 'Enroll Now'}
                                        </Button>
                                    )}
                                    {course.is_enrolled && (
                                        <Button variant="outlined" color="success" sx={{ mt: 2 }} fullWidth disabled>
                                            Enrolled
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {tabValue === 1 && (
                <Grid container spacing={3}>
                    {enrollments.length === 0 && (
                        <Grid item xs={12}>
                            <Typography color="text.secondary">No requests found.</Typography>
                        </Grid>
                    )}
                    {enrollments.map(req => (
                        <Grid item xs={12} key={req.id}>
                            <Card variant="outlined">
                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            {req.student_details?.user?.first_name} {req.student_details?.user?.last_name}
                                        </Typography>
                                        <Typography variant="body2">{req.course_name}</Typography>
                                        <Typography variant="caption" color="text.secondary">Status: {req.status}</Typography>
                                    </Box>
                                    {user.is_tutor && req.status === 'pending' && (
                                        <Box>
                                            <Button color="success" onClick={() => handleAction(req.id, 'approve')}>Approve</Button>
                                            <Button color="error" onClick={() => handleAction(req.id, 'reject')}>Reject</Button>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
