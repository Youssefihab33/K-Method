# emails.py
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

def get_email_branding_context(extra_context=None):
    """
    Returns standard branding context used across all email templates.
    """
    context = {
        'site_name': getattr(settings, 'SITE_NAME', 'Our Platform'),
        'logo_url': getattr(settings, 'SITE_LOGO_URL', f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/logo.png"),
        'primary_color': getattr(settings, 'BRAND_COLOR_PRIMARY', '#AF913B'),
        'login_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/login",
    }
    if extra_context:
        context.update(extra_context)
    return context


def send_html_email(subject, template_name, context, recipient_list, plain_fallback_message='', fail_silently=True):
    """
    Reusable wrapper to render template with branding and send email.
    """
    full_context = get_email_branding_context(context)
    html_message = render_to_string(template_name, full_context)
    
    send_mail(
        subject=subject,
        message=plain_fallback_message,
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list if isinstance(recipient_list, list) else [recipient_list],
        fail_silently=fail_silently
    )