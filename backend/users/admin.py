from django.contrib import admin
from .models import School, CustomUser, TutorProfile, StudentProfile

# Register your models here.
admin.site.register(School)
admin.site.register(CustomUser)
admin.site.register(TutorProfile)
admin.site.register(StudentProfile)