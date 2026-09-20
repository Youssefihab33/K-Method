import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Paper,
    Breadcrumbs,
    Link,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import PDFObject from 'pdfobject';

import { useTitle } from 'react-use';
import { courseService } from '../api/courseService';
import { useAuth } from '../context/AuthContext';

// Helper Component for Video.js Instance Management
function CustomVideoPlayer({ src }) {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // Ensure player is initialized only once
        if (!playerRef.current && videoRef.current) {
            const videoElement = document.createElement('video-js');
            videoElement.classList.add('vjs-big-play-centered');
            videoRef.current.appendChild(videoElement);

            const player = (playerRef.current = videojs(
                videoElement,
                {
                    controls: true,
                    autoplay: false,
                    preload: 'auto',
                    responsive: true,
                    fluid: true,
                    playbackRates: [0.5, 1, 1.25, 1.5, 2],
                    sources: [
                        {
                            src: src,
                            type: src.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4',
                        },
                    ],
                },
                () => {
                    videojs.log('player is ready');
                }
            ));
        } else if (playerRef.current) {
            // Update source if src prop changes
            const player = playerRef.current;
            player.src({
                src: src,
                type: src.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4',
            });
        }

    }, [src]);

    // Cleanup player instance on component unmount
    useEffect(() => {
        const player = playerRef.current;
        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, []);
    return (
        <div data-vjs-player style={{ width: '100%', height: '100%' }}>
            <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}

export default function Session() {
    const { course_id, chapter_number, session_number } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const PDFRef = useRef(null);

    const chapIdx = parseInt(chapter_number, 10) - 1;
    const sessIdx = parseInt(session_number, 10) - 1;

    // Fetch full course data with syllabus structure
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const data = await courseService.getCourseDetail(course_id);
                setCourse(data);
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to load session details.');
            } finally {
                setLoading(false);
            }
        };

        if (course_id) {
            fetchCourseData();
        }
    }, [course_id]);

    // Derive current chapter and current session objects
    const currentChapter = course?.chapters?.[chapIdx];
    const currentSession = currentChapter?.sessions?.[sessIdx];

    useTitle(
        currentSession
            ? `${currentSession.title || currentSession.name} - ${course?.name}`
            : 'Session - K-Method'
    );

    // Flatten all sessions across all chapters into a sequence for next/prev calculation
    const allSessionsSequence = useMemo(() => {
        if (!course?.chapters) return [];
        const list = [];
        course.chapters.forEach((chap, cIdx) => {
            if (chap.sessions) {
                chap.sessions.forEach((sess, sIdx) => {
                    list.push({
                        chapterNum: cIdx + 1,
                        sessionNum: sIdx + 1,
                        chapterTitle: chap.title || chap.name,
                        sessionTitle: sess.title || sess.name,
                        sessionData: sess,
                    });
                });
            }
        });
        return list;
    }, [course]);

    const videoSource = currentSession?.video_file || currentSession?.video_url;

    useEffect(() => {
        // Basic verification that both our file URL and DOM container exist
        if (currentSession?.document_file && PDFRef.current) {
            const options = {
                pdfOpenParams: {
                    view: 'FitV',
                    pagemode: 'thumbs',
                    page: 1
                },
                // Custom mobile-friendly fallback message
                fallbackLink: `
          <div style="padding: 20px; background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; text-align: center; border-radius: 4px; margin: 20px;">
            Your browser does not support inline PDFs. 
            <a href="[url]" target="_blank" rel="noopener noreferrer" style="color: #533f03; font-weight: bold; text-decoration: underline;">
              Click here to download and view the PDF
            </a>.
          </div>
        `
            };

            // Embed the PDF directly onto the DOM element referenced by the ref
            PDFObject.embed(currentSession.document_file, PDFRef.current, options);
        }
    }, [currentSession?.document_file]); // Automatically re-runs and swaps out the file if the 'url' prop changes


    // Find index of current session within the flattened list
    const currentIndex = allSessionsSequence.findIndex(
        (item) => item.chapterNum === parseInt(chapter_number, 10) && item.sessionNum === parseInt(session_number, 10)
    );

    const prevSessionItem = currentIndex > 0 ? allSessionsSequence[currentIndex - 1] : null;
    const nextSessionItem =
        currentIndex !== -1 && currentIndex < allSessionsSequence.length - 1
            ? allSessionsSequence[currentIndex + 1]
            : null;

    // Verify enrollment authorization
    const isEnrolled = user?.student_profile?.enrolled_courses?.some((enrolledCourse) => enrolledCourse?.id === course?.id) || false;

    // Prevent right-click context menu on video player
    const handleContextMenu = (e) => {
        e.preventDefault();
    };

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
                <Box sx={{ mt: 3 }}>
                    <Button variant="outlined" component={RouterLink} to="/" startIcon={<ArrowBackIcon />}>
                        Back to Home
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!isEnrolled) {
        return (
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <LockOutlinedIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Access Restricted
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        You must be enrolled in "{course.name}" to view video sessions.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        component={RouterLink}
                        to={`/enroll/${course.id}`}
                    >
                        Enroll Now
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (!currentSession) {
        return (
            <Container maxWidth="md" sx={{ mt: 6 }}>
                <Alert severity="warning">Requested session was not found in this course.</Alert>
                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="outlined"
                        component={RouterLink}
                        to={`/course/${course_id}`}
                        startIcon={<ArrowBackIcon />}
                    >
                        Back to Course Overview
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            {/* Breadcrumbs Navigation */}
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link component={RouterLink} to="/" underline="hover" color="inherit">
                    Home
                </Link>
                <Link component={RouterLink} to={`/course/${course.id}`} underline="hover" color="inherit">
                    {course.name}
                </Link>
                <Typography color="text.primary">
                    Chapter {chapter_number}: {currentChapter?.title || currentChapter?.name}
                </Typography>
            </Breadcrumbs>

            {/* Main Video Display Card */}
            <Card sx={{ mb: 4, backgroundColor: 'rgba(21, 24, 33, 0.95)', overflow: 'hidden' }}>
                {/* Video.js Player Container */}
                {currentSession.video_file &&
                    <Box
                        sx={{
                            width: '100%',
                            aspectRatio: '16/9',
                            backgroundColor: '#000',
                            position: 'relative',
                            userSelect: 'none',
                            display: 'block',
                            '& .video-js': {
                                width: '100%',
                                height: '100%',
                            },
                        }}
                        onContextMenu={handleContextMenu}
                    >
                        <CustomVideoPlayer key={videoSource} src={videoSource} />
                    </Box>
                }

                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" sx={{ color: 'primary.dark', fontWeight: 'bold', mb: 1 }}>
                        {session_number}. {currentSession.title || currentSession.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
                        Chapter {chapter_number}: {currentChapter?.title || currentChapter?.name}
                    </Typography>

                    {currentSession.notes && (
                        <>
                            <Typography variant="h5" sx={{ color: 'primary.main', marginTop: 4, marginBottom: 1 }}>
                                Note:
                            </Typography>
                            <Typography variant="body1" color="secondary">
                                {currentSession.notes}
                            </Typography>
                        </>
                    )}

                    {currentSession.document_file &&
                        <>
                            <Divider sx={{ my: 2 }} />
                            <div style={{ width: '100%', maxWidth: '1000px', margin: '20px auto' }}>
                                <div
                                    ref={PDFRef}
                                    style={{
                                        width: '100%',
                                        height: '750px',
                                        border: '1px solid #ccc',
                                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                            </div>
                        </>
                    }
                </CardContent>
            </Card>

            {/* Next / Previous Session Navigation Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    startIcon={<NavigateBeforeIcon />}
                    disabled={!prevSessionItem}
                    onClick={() =>
                        navigate(`/session/${course_id}/${prevSessionItem.chapterNum}/${prevSessionItem.sessionNum}`)
                    }
                >
                    {prevSessionItem ? `Previous: ${prevSessionItem.chapterTitle} - ${prevSessionItem.sessionTitle}` : 'Previous Session'}
                </Button>

                <Button
                    variant="outlined"
                    color="secondary"
                    component={RouterLink}
                    to={`/course/${course_id}`}
                >
                    Course Syllabus
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    endIcon={<NavigateNextIcon />}
                    disabled={!nextSessionItem}
                    onClick={() =>
                        navigate(`/session/${course_id}/${nextSessionItem.chapterNum}/${nextSessionItem.sessionNum}`)
                    }
                >
                    {nextSessionItem ? `Next: ${nextSessionItem.chapterTitle} - ${nextSessionItem.sessionTitle}` : 'Next Session'}
                </Button>
            </Box>
        </Container>
    );
}