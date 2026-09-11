import { Link as RouterLink } from 'react-router-dom';
import { Typography, Card, CardContent, Button, CardActions, Chip } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

export default function CourseCard({ course }) {
    const { user, isAuthenticated } = useAuth();
    const enrolled = user?.student_profile?.enrolled_courses?.some((enrolledCourse) => enrolledCourse.id === course.id) || false;

    return (
        <Card sx={{
            height: '100%', display: 'flex', flexDirection: 'column', padding: 4, position: 'relative',
            overflow: 'hidden', // Keeps the blurred pseudo-element inside the card boundaries
            background: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay so text stands out
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${course.image || 'https://placeholder.com'})`, // Replace with your image source
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(3px)', // Adjust the blur intensity here
                zIndex: -1, // Places the background behind your card content
                transform: 'scale(1.1)', // Prevents white edges caused by the blur filter
            }
        }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                    {course.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.about?.substring(0, 100)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.year}
                </Typography>
                {!enrolled && (<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <s>{course.price + 300} EGP</s>   {course.price} EGP
                </Typography>)}
                <Chip label={`Dr. ${course.tutor_name}` || 'Tutor'} size="small" variant="outlined" />
            </CardContent>
            <CardActions>
                <Button variant='contained' component={RouterLink} to={`/course/${course.id}`}>
                    Course Details
                </Button>
                {isAuthenticated ?
                    !enrolled &&
                    <Button variant='contained' color='secondary' component={RouterLink} to={`/enroll/${course.id}`}>
                        Enroll!
                    </Button>
                    :
                    <Button variant='contained' color='secondary' component={RouterLink} to={`/register`}>
                        Join Now!
                    </Button>
                }
            </CardActions>
        </Card>
    )
};