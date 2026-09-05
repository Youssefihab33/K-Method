from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Course, Chapter, Session
from .serializers import (
    CourseListSerializer,
    CourseDetailSerializer,
    ChapterSerializer,
    SessionSerializer
)


class IsTutorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return hasattr(request.user, 'tutor_profile') and request.user.is_tutor


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return CourseDetailSerializer
        return CourseListSerializer

    def perform_create(self, serializer):
        serializer.save(tutor=self.request.user.tutor_profile)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        if not hasattr(request.user, 'student_profile'):
            return Response(
                {'detail': 'Only students can enroll in courses.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        student_profile = request.user.student_profile
        course.students.add(student_profile)
        return Response({'detail': 'Successfully enrolled in course.'}, status=status.HTTP_200_OK)


class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated, IsTutorOrReadOnly]


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsTutorOrReadOnly]
