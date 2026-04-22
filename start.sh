#!/bin/sh
# Replace $PORT placeholder in nginx config
sed -i "s/\$PORT/${PORT:-3000}/" /etc/nginx/http.d/default.conf

# Start php-fpm in background
php-fpm -D

# Start nginx in foreground
nginx -g 'daemon off;'