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
    # tutor_phone_number = str(tutor.user.phone_number)
    chapters = ChapterSerializer(many=True, read_only=True)
    tutor_name = serializers.ReadOnlyField(source='tutor.user.get_full_name')
    tutor_phone_number = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'name', 'year', 'price', 'image', 'tutor_phone_number',
                  'about', 'tutor', 'tutor_name', 'chapters']

    def get_tutor_phone_number(self, obj):
        if obj.tutor and obj.tutor.user and obj.tutor.user.phone_number:
            return str(obj.tutor.user.phone_number)
        return None
