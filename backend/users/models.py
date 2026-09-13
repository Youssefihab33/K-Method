import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from phonenumber_field.modelfields import PhoneNumberField
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver


def current_year():
    return datetime.date.today().year


def validate_max_year(value):
    max_year = datetime.date.today().year
    if value > max_year:
        raise ValidationError(
            f'Year cannot be in the future (max {max_year}).')


class School(models.Model):
    class SchoolKind(models.TextChoices):
        SCHOOL = "School", "School"
        UNIVERSITY = "University", "University"

    name = models.CharField(max_length=255)
    kind = models.CharField(
        max_length=50,
        choices=SchoolKind.choices,
        default=SchoolKind.SCHOOL,
    )
    email = models.EmailField(unique=True)
    phone_number = PhoneNumberField(region='EG', db_index=True)
    address = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return self.name


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email was not provided!')

        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    phone_number = PhoneNumberField(region='EG', db_index=True)

    is_tutor = models.BooleanField(default=False)
    is_student = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number']

    objects = CustomUserManager()

    def __str__(self):
        name = f'{self.first_name} {self.last_name}'.strip()
        return name if name else self.email


class TutorProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='tutor_profile'
    )
    about = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    teaching_since = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1950),
            validate_max_year,
        ],
        default=current_year,
        help_text='Use a valid year (e.g., 2005)'
    )

    def __str__(self):
        name = f'{self.user.first_name} {self.user.last_name}'.strip()
        return name if name else self.user.email


class StudentProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='student_profile'
    )
    reached = models.JSONField(default=dict, blank=True)
    parent_phone_number = PhoneNumberField(region='EG', db_index=True, blank=True)
    school = models.ForeignKey(
        'users.School', on_delete=models.SET_NULL, blank=True, null=True)
    student_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Student or University Registration ID'
    )

    def __str__(self):
        name = f'{self.user.first_name} {self.user.last_name}'.strip()
        return name if name else self.user.email


@receiver(post_save, sender=CustomUser)
def save_or_create_user_profile(sender, instance, created, **kwargs):
    if instance.is_tutor:
        TutorProfile.objects.get_or_create(
            user=instance,
            defaults={'teaching_since': datetime.date.today().year}
        )
    if instance.is_student:
        StudentProfile.objects.get_or_create(
            user=instance,
            defaults={'reached': {}}
        )
