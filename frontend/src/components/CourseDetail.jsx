import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useTitle } from 'react-use';
import { Container, Typography, Box, Card, CardContent, Button, Chip, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText, Divider, Alert, Paper } from '@mui/material';

import { ExpandMore, PlayCircleOutlined, Check, CheckCircleOutlined, LockOutlined, PersonOutlined, MenuBook } from '@mui/icons-material';

import { courseService } from '../api/courseService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './snippets/LoadingSpinner';

export default function CourseDetail() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useTitle(course ? `${course.name} - K-Method` : 'Course Details - K-Method');

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const data = await courseService.getCourseDetail(id);
            setCourse(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load course details.');
            console.error(err)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCourse();
        }
    }, [id]);

    // Check if current user is enrolled in this course
    const enrolled = user?.student_profile?.enrolled_courses?.some((enrolledCourse) => enrolledCourse?.id === course?.id) || false

    if (loading) return <LoadingSpinner />

    if (error && !course) {
        return (
            <Container maxWidth="md" sx={{ mt: 6 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
            {/* Course Banner Card */}
            <Card sx={{
                height: '100%', display: 'flex', flexDirection: 'column', marginBottom: 5, padding: 3, position: 'relative',
                overflow: 'hidden', // Keeps the blurred pseudo-element inside the card boundaries
                background: 'rgba(0, 0, 0, 0.7)', // Semi-transparent overlay so text stands out
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${course.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(3px)', // Adjust the blur intensity here
                    zIndex: -1, // Places the background behind your card content
                    transform: 'scale(1.1)', // Prevents white edges caused by the blur filter
                }
            }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ maxWidth: '750px' }}>
                            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {course?.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                {course?.description}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Chip
                                    icon={<PersonOutlined />}
                                    label={`Tutor: ${course?.tutor_name || 'Instructor'}`}
                                    color="secondary"
                                    variant="outlined"
                                />
                                <Chip
                                    icon={<MenuBook />}
                                    label={`${course?.chapters?.length || 0} Chapters`}
                                    variant="outlined"
                                />
                                {enrolled && (
                                    <Chip
                                        icon={<CheckCircleOutlined />}
                                        label="Enrolled"
                                        color="success"
                                    />
                                )}
                            </Box>
                        </Box>

                        {/* Actions / Enrollment Button */}
                        <Box sx={{ minWidth: '200px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {!isAuthenticated ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    component={RouterLink}
                                    to="/login"
                                >
                                    Sign In to Enroll
                                </Button>
                            ) : enrolled ? (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        backgroundColor: 'rgba(175, 145, 59, 0.1)',
                                        border: '1px solid rgba(175, 145, 59, 0.3)',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Check />
                                    <Typography variant="subtitle2" color="primary.light" >
                                         You have active access to this course.
                                    </Typography>
                                </Paper>
                            ) : (
                                <Button variant="contained" color="primary" size="large" component={RouterLink} to={`/enroll/${course.id}`}>
                                    Enroll
                                </Button>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Notifications */}
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Course Curriculum Section */}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Course Content
            </Typography>

            {course?.chapters && course.chapters.length > 0 ? (
                course.chapters.map((chapter, index) => (
                    <Accordion key={chapter.id || index} defaultExpanded={index === 0} sx={{ mb: 2 }}>
                        <AccordionSummary expand={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Chapter {index + 1}: {chapter.title || chapter.name}
                                </Typography>
                                {chapter.sessions?.length > 0 && (
                                    <Chip
                                        label={`${chapter.sessions.length} Lessons`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem' }}
                                    />
                                )}
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            <Divider />
                            <List disablePadding>
                                {chapter.sessions && chapter.sessions.length > 0 ? (
                                    chapter.sessions.map((session) => (
                                        <ListItem
                                            key={session.id}
                                            sx={{
                                                px: 3,
                                                py: 2,
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                                '&:last-child': { borderBottom: 'none' },
                                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
                                            }}
                                            secondaryAction={
                                                enrolled ? (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        color="primary"
                                                        component={RouterLink}
                                                        to={`/sessions/${session.id}`}
                                                        startIcon={<PlayCircleOutlined />}
                                                    >
                                                        Watch
                                                    </Button>
                                                ) : (
                                                    <Chip
                                                        icon={<LockOutlined />}
                                                        label="Locked"
                                                        size="small"
                                                        variant="outlined"
                                                        color="default"
                                                    />
                                                )
                                            }
                                        >
                                            <ListItemIcon>
                                                <PlayCircleOutlined color={enrolled ? 'primary' : 'disabled'} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={session.title || session.name}
                                                secondary={session.duration ? `${session.duration} mins` : null}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem sx={{ px: 3, py: 2 }}>
                                        <ListItemText primary="No video sessions uploaded for this chapter yet." />
                                    </ListItem>
                                )}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No curriculum chapters have been published for this course yet.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
}