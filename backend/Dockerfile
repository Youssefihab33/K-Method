FROM nginx:1.25.3-alpine
WORKDIR /usr/src/app/k-method

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY ./ ./

# Install dependencies in a single layer to reduce image size
RUN apk update && \
    apk add --no-cache python3 supervisor ca-certificates ffmpeg && \
    python3 -m ensurepip && \
    pip3 install --no-cache-dir -r requirements.txt gunicorn && \
    rm -rf /var/cache/apk/* && \
    rm -rf /root/.cache/pip

# Collect static files
RUN python manage.py collectstatic --noinput

# Configure Nginx and Supervisor
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN rm -f /etc/nginx/sites-enabled/default && mkdir -p /var/log/supervisor

EXPOSE 80

# Start Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
