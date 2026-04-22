FROM php:8.2-fpm-alpine

# Install MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Install nginx
RUN apk add --no-cache nginx

# Copy PHP files
COPY api/php/ /var/www/html/

# Nginx config
RUN echo 'server {
    listen $PORT default_server;
    root /var/www/html;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}' > /etc/nginx/http.d/default.conf

COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]