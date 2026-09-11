import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Theme1 from './components/themes/Theme1';
import './App.css';

import { AuthProvider } from './context/AuthContext';
// import { UserProvider, UserContext } from './components/APIs/Context';
// import { ProtectedRoute } from './components/ProtectedRoute';

import NotFound from './components/NotFound'
import Navbar from './components/Navbar';
import LoadingSpinner from './components/snippets/LoadingSpinner';

import Homepage from './components/Homepage';
import Login from './components/Login';
import Register from './components/Register';
// import Dashboard from './components/Dashboard';
import Profile from './components/Profile';


const CourseDetail = lazy(() => import('./components/CourseDetail'));

const PageLoader = () => (
    <LoadingSpinner />
);

export default function App() {
    return (
        <ThemeProvider theme={Theme1}>
            <CssBaseline />
            <AuthProvider>
                <Navbar />
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path='/' element={<Homepage />} />
                        <Route path='/login/' element={<Login />} />
                        <Route path='/register/' element={<Register />} />
                        <Route path='/course/:id' element={<CourseDetail />} />

                        {/* Protected Routes */}
                        {/* <ProtectedRoute> */}
                            <Route path='/profile' element={<Profile />} />
                        {/* </ProtectedRoute> */}
                        {/* Fallback */}
                        <Route path="*" element={<NotFound to="/notfound" replace />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </ThemeProvider>
    );
}
