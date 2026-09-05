import axiosClient from './axiosClient';

export const courseService = {
  // --- COURSES ---
  
  // Get list of courses
  getCourses: async (params = {}) => {
    const response = await axiosClient.get('/courses/', { params });
    return response.data;
  },

  // Get detailed course view (includes chapters & sessions)
  getCourseDetail: async (id) => {
    const response = await axiosClient.get(`/courses/${id}/`);
    return response.data;
  },

  // Create a new course (Tutors only)
  createCourse: async (courseData) => {
    const response = await axiosClient.post('/courses/', courseData);
    return response.data;
  },

  // Update course details
  updateCourse: async (id, courseData) => {
    const response = await axiosClient.patch(`/courses/${id}/`, courseData);
    return response.data;
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await axiosClient.delete(`/courses/${id}/`);
    return response.data;
  },

  // Enroll student into course
  enrollCourse: async (courseId) => {
    const response = await axiosClient.post(`/courses/${courseId}/enroll/`);
    return response.data;
  },

  // --- CHAPTERS ---

  // Get all chapters
  getChapters: async () => {
    const response = await axiosClient.get('/courses/chapters/');
    return response.data;
  },

  // Add chapter to a course
  createChapter: async (chapterData) => {
    const response = await axiosClient.post('/courses/chapters/', chapterData);
    return response.data;
  },

  // Update chapter
  updateChapter: async (id, chapterData) => {
    const response = await axiosClient.patch(`/courses/chapters/${id}/`, chapterData);
    return response.data;
  },

  // Delete chapter
  deleteChapter: async (id) => {
    const response = await axiosClient.delete(`/courses/chapters/${id}/`);
    return response.data;
  },

  // --- SESSIONS & VIDEOS ---

  // Get all sessions
  getSessions: async () => {
    const response = await axiosClient.get('/courses/sessions/');
    return response.data;
  },

  // Get single session details
  getSessionDetail: async (id) => {
    const response = await axiosClient.get(`/courses/sessions/${id}/`);
    return response.data;
  },

  // Create session (Supports FormData for video uploads)
  createSession: async (sessionFormData) => {
    const response = await axiosClient.post('/courses/sessions/', sessionFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update session
  updateSession: async (id, sessionFormData) => {
    const response = await axiosClient.patch(`/courses/sessions/${id}/`, sessionFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete session
  deleteSession: async (id) => {
    const response = await axiosClient.delete(`/courses/sessions/${id}/`);
    return response.data;
  },
};