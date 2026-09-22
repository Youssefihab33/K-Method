import datetime, os
from django.db import models
from django.core.files.storage import FileSystemStorage
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from moviepy import VideoFileClip

class OverwriteStorage(FileSystemStorage):
    def get_available_name(self, name, max_length=None):
        # If the file already exists, remove it before saving the new one
        if self.exists(name):
            os.remove(os.path.join(self.location, name))
        return super().get_available_name(name, max_length)

def rename_sessions(instance, filename):
    ext = filename.split('.')[-1]
    new_filename = f"{instance.number}.{instance.name}.{ext}"
    return os.path.join('courses/', f'{instance.chapter.course.name}/', f'{instance.chapter.number}.{instance.chapter.name}', new_filename)

def rename_course_images(instance, filename):
    ext = filename.split('.')[-1]
    new_filename = f'{instance.name}.{ext}'
    return os.path.join('courses_images/', new_filename)

def validate_max_year(value):
    max_year = datetime.date.today().year
    if value > max_year:
        raise ValidationError(
            f'Year cannot be in the future (max {max_year}).')


def current_year():
    return datetime.date.today().year


class Course(models.Model):
    name = models.CharField(max_length=250)
    year = models.PositiveIntegerField(
        validators=[
            MinValueValidator(2000),
            validate_max_year,
        ],
        default=current_year,
        help_text='Use a valid year (e.g., 2025)'
    )
    image = models.ImageField(upload_to=rename_course_images, storage=OverwriteStorage(), blank=True, null=True)
    price = models.PositiveIntegerField(default=0)
    about = models.TextField(blank=True, default="")
    tutor = models.ForeignKey(
        'users.TutorProfile',
        on_delete=models.CASCADE,
        related_name='courses'
    )
    students = models.ManyToManyField(
        'users.StudentProfile',
        blank=True,
        related_name='enrolled_courses'
    )

    class Meta:
        ordering = ['-year', 'name']

    def __str__(self):
        return f'Dr.{self.tutor} - {self.name}'


class Chapter(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='chapters'
    )
    number = models.IntegerField()
    name = models.CharField(max_length=250)

    class Meta:
        ordering = ['course', 'number']
        unique_together = ['course', 'number']

    def __str__(self):
        return f'{self.course.name} - Ch.{self.number}: {self.name}'


class Session(models.Model):
    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    number = models.IntegerField()
    name = models.CharField(max_length=250)
    notes = models.TextField(blank=True, default="")
    video_file = models.FileField(upload_to=rename_sessions, storage=OverwriteStorage(), blank=True, null=True, max_length=1024)
    document_file = models.FileField(upload_to=rename_sessions, storage=OverwriteStorage(), blank=True, null=True, max_length=512)
    duration_minutes = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['chapter', 'number']
        unique_together = ['chapter', 'number']

    def __str__(self):
        return f'{self.chapter.name} - S.{self.number}: {self.name}'

    def save(self, *args, **kwargs):
        is_new_video = False
        if self.pk:
            old_entry = Session.objects.get(pk=self.pk)
            if old_entry.video_file != self.video_file:
                is_new_video = True
        else:
            is_new_video = True

        super().save(*args, **kwargs)

        if self.video_file and is_new_video:
            try:
                with VideoFileClip(self.video_file.path) as video:
                    calculated_duration = int(video.duration / 60)
                Session.objects.filter(pk=self.pk).update(duration_minutes=calculated_duration)
                self.duration_minutes = calculated_duration
                
            except Exception as e:
                print(f"Error parsing video duration: {e}")
