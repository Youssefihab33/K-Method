from django.contrib import admin
from .models import Course, Chapter, Session


class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 1


class SessionInline(admin.TabularInline):
    model = Session
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'tutor', 'year', 'price')
    list_filter = ('year', 'tutor')
    search_fields = ('name', 'tutor__user__email')
    inlines = [ChapterInline]


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'number')
    list_filter = ('course',)
    inlines = [SessionInline]


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('name', 'chapter', 'number', 'duration_minutes')
    list_filter = ('chapter__course',)