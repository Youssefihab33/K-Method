from django.contrib import admin
import nested_admin
from .models import Course, Chapter, Session

class SessionInline(nested_admin.NestedTabularInline):
    model = Session
    extra = 1

class ChapterInline(nested_admin.NestedTabularInline):
    model = Chapter
    extra = 1
    inlines = [SessionInline]

@admin.register(Course)
class CourseAdmin(nested_admin.NestedModelAdmin):
    list_display = ('name', 'tutor', 'year', 'price')
    list_filter = ('year', 'tutor')
    search_fields = ('name', 'tutor__user__email')
    inlines = [ChapterInline]

# Uncomment these standalone admins if you still want to edit them separately

# @admin.register(Chapter)
# class ChapterAdmin(admin.ModelAdmin):
#     list_display = ('name', 'course', 'number')
#     list_filter = ('course',)


# @admin.register(Session)
# class SessionAdmin(admin.ModelAdmin):
#     list_display = ('name', 'chapter', 'number', 'duration_minutes')
#     list_filter = ('chapter__course',)
