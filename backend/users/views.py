from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .email import send_html_email
from django.contrib.auth.tokens import default_token_generator
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from knox.models import AuthToken  # type: ignore

from .models import School, EmailVerificationCode
from .serializers import SchoolSerializer, LoginSerializer, RegisterSerializer, UserSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
User = get_user_model()

# def send_email(subject, template, user, btnLink=""):
#     context = {
#         'name': user.email,
#         'email': user.email,
#         'year': datetime.now().year,
#         'button_link': btnLink,
#         'link_to_[APP_NAME]': os.getenv('FRONTEND_DOMAIN'),
#         'admin_email': os.getenv('EMAIL_HOST'),
#     }
#     html_content = render_to_string(template, context)
#     plain_message = strip_tags(html_content)
#     message = EmailMultiAlternatives(
#         subject=subject,
#         body=plain_message,
#         from_email=None,
#         to=[user.email],
#     )
#     message.attach_alternative(html_content, "text/html")
#     message.send()


# @receiver(reset_password_token_created)
# def password_reset_token_created(reset_password_token, *args, **kwargs):
#     token_url = f'{os.getenv("FRONTEND_DOMAIN")}reset-password/{reset_password_token.key}'
#     send_email("Forgot your Password? - [APP_NAME]",
#                'email/forgot_password.html', reset_password_token.user, token_url)


# @receiver(post_password_reset)
# def password_reset(sender, **kwargs):
#     send_email("Password Changed Successfully - [APP_NAME]",
#                # A DO LATER HERE
#                'email/password_changed.html', kwargs['user'], 'DO LATER')

# Create your views here.
class LoginViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    # @action(detail=False, methods=['post'], url_path='login')
    # def perform_login(self, request):
    #     serializer = self.serializer_class(data=request.data, context={'request': request})
    #     if serializer.is_valid():
    #         user = serializer.validated_data['user']
    #         _, token = AuthToken.objects.create(user)
    #         return Response({
    #             'user': UserSerializer(user).data,
    #             'token': token
    #         }, status=status.HTTP_200_OK)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        serializer = self.serializer_class(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            _, token = AuthToken.objects.create(user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            _, token = AuthToken.objects.create(user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsersViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get', 'patch', 'put'], permission_classes=[IsAuthenticated])
    def current(self, request):
        if request.method in ['PATCH', 'PUT']:
            serializer = self.get_serializer(
                request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class SchoolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [AllowAny]


class SendEmailCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        if not email:
            return Response({'email': 'Email field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'email': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        verification_obj = EmailVerificationCode.generate_code(email)
        send_html_email(
            subject="Your Verification Code",
            template_name="emails/verification_code.html",
            context={'code': verification_obj.code},
            recipient_list=[email],
            plain_fallback_message=f"Your verification code is: {verification_obj.code}",
            fail_silently=False
        )

        return Response({'detail': 'Verification code sent to your email.'}, status=status.HTTP_200_OK)


class VerifyEmailCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        code = request.data.get('code', '').strip()

        if not email or not code:
            return Response({'detail': 'Email and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        record = EmailVerificationCode.objects.filter(
            email=email, code=code).order_by('-created_at').first()

        if not record or not record.is_valid():
            return Response({'detail': 'Invalid or expired verification code.'}, status=status.HTTP_400_BAD_REQUEST)

        record.is_verified = True
        record.save()

        return Response({'detail': 'Email verified successfully.'}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        if not email:
            return Response({'email': 'Email field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()

        # For security reasons, respond with success even if user isn't found
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            # Construct frontend URL (e.g. http://localhost:5173/reset-password/UID/TOKEN)
            frontend_domain = getattr(
                settings, 'FRONTEND_URL', 'http://localhost:5173')
            reset_url = f"{frontend_domain}/reset-password/{uid}/{token}/"

            send_html_email(
                subject="Password Reset Request",
                template_name="emails/password_reset.html",
                context={'first_name': user.first_name,
                         'reset_url': reset_url},
                recipient_list=[user.email],
                plain_fallback_message=f"Hi {user.first_name},\nReset your password here: {reset_url}",
                fail_silently=True
            )

        return Response(
            {'detail': 'If an account exists with this email, a password reset link has been sent.\nPlease check your inbox.'},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        new_password = serializer.validated_data['new_password']

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password reset successfully. You can now log in."}, status=status.HTTP_200_OK)
