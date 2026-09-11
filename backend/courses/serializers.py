from rest_framework import serializers
from .models import Course, Chapter, Session


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'chapter', 'number', 'name',
                  'notes', 'video_file', 'duration_minutes']


class ChapterSerializer(serializers.ModelSerializer):
    sessions = SessionSerializer(many=True, read_only=True)

    class Meta:
        model = Chapter
        fields = ['id', 'course', 'number', 'name', 'sessions']


class CourseListSerializer(serializers.ModelSerializer):
    tutor_name = serializers.ReadOnlyField(source='tutor.user.get_full_name')
    students_count = serializers.IntegerField(
        source='students.count', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'name', 'year', 'price', 'image', 'about',
                  'tutor', 'tutor_name', 'students_count']


class CourseDetailSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    tutor_name = serializers.ReadOnlyField(source='tutor.user.get_full_name')

    class Meta:
        model = Course
        fields = ['id', 'name', 'year', 'price', 'image',
                  'about', 'tutor', 'tutor_name', 'chapters']
