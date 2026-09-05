import datetime
from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError


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
    # image = models.ImageField(upload_to='course_images/', blank=True, null=True)
    price = models.PositiveIntegerField(default=0)
    contents = models.JSONField(default=dict, blank=True)
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
        return f'{self.tutor} - {self.name}'


class Chapter(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='chapters'
    )
    number = models.FloatField()
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
    number = models.FloatField()
    name = models.CharField(max_length=250)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to='videos/sessions/', blank=True, null=True)
    duration_minutes = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['chapter', 'number']
        unique_together = ['chapter', 'number']

    def __str__(self):
        return f'{self.chapter.name} - S.{self.number}: {self.name}'
