from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from .email import send_html_email
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers
from phonenumber_field.serializerfields import PhoneNumberField

from .models import School, CustomUser, StudentProfile, TutorProfile
from courses.serializers import CourseDetailSerializer

User = get_user_model()


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'name', 'kind', 'address']


class LoginSerializer(serializers.Serializer):
    # Inputs
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    # Outputs
    id = serializers.IntegerField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    is_student = serializers.BooleanField(read_only=True)
    is_tutor = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                email=email,
                password=password
            )

            if not user:
                raise serializers.ValidationError("Invalid email or password.")

            if not user.is_active:
                raise serializers.ValidationError(
                    "This user account is disabled.")
        else:
            raise serializers.ValidationError(
                "Both email and password are required.")

        # Save the authenticated user object into the validated data context
        attrs['user'] = user
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    parent_phone_number = PhoneNumberField(
        region='EG', required=False, allow_null=True)
    school = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(),
        required=False,
        allow_null=True
    )
    student_id = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=True,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone_number',
            'password', 'is_student', 'is_tutor',
            'parent_phone_number', 'school', 'student_id'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        normalized_email = value.lower()
        if User.objects.filter(email=normalized_email).exists():
            raise serializers.ValidationError(
                "A user with this email already exists.")
        return normalized_email

    def create(self, validated_data):
        # Extract student profile specific fields
        parent_phone = validated_data.pop('parent_phone_number', None)
        school = validated_data.pop('school', None)
        student_id = validated_data.pop('student_id', None)

        validated_data['is_active'] = True
        user = User.objects.create_user(**validated_data)

        # Update the StudentProfile created by the post_save signal
        if user.is_student:
            profile, _ = StudentProfile.objects.get_or_create(user=user)
            if parent_phone:
                profile.parent_phone_number = parent_phone
            if school:
                profile.school = school
            if student_id:
                profile.student_id = student_id
            profile.save()

        # Send Welcome Email
        try:
            send_html_email(
                subject="Welcome to Our Platform!",
                template_name="emails/welcome.html",
                context={'first_name': user.first_name},
                recipient_list=[user.email],
                plain_fallback_message=f"Hi {user.first_name},\nWelcome to our platform!",
                fail_silently=True
            )
        except Exception:
            pass
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_new_password(self, value):
        # Applies Django's password validation rules (length, complexity, etc.)
        validate_password(value, user=self.context['request'].user)
        return value

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class TutorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorProfile
        fields = ['about', 'experience', 'teaching_since']


class StudentProfileSerializer(serializers.ModelSerializer):
    enrolled_courses = CourseDetailSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = StudentProfile
        fields = ['reached', 'school', 'student_id', 'enrolled_courses']


class UserSerializer(serializers.ModelSerializer):
    tutor_profile = TutorProfileSerializer(read_only=True)
    student_profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone_number',
            'is_student', 'is_tutor', 'is_active', 'is_staff',
            'tutor_profile', 'student_profile'
        ]
        read_only_fields = ['id', 'email', 'is_staff', 'is_active']


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError(
                {"token": "Invalid user or UID."})

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError(
                {"token": "Invalid or expired token."})

        attrs['user'
              ] = user
        return attrs
