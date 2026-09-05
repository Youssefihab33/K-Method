from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from .models import CustomUser, StudentProfile, TutorProfile

User = get_user_model()


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
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email',
                  'phone_number', 'password', 'is_student', 'is_tutor']
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
        # Explicitly set is_active=True so the user can log in after registering
        validated_data['is_active'] = True
        user = User.objects.create_user(**validated_data)
        return user


class TutorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorProfile
        fields = ['about', 'experience', 'teaching_since']


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['reached', 'school', 'student_id']


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
