from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from knox.models import AuthToken  # type: ignore

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer
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

    def create(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
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
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)