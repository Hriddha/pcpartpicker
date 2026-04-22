#!/bin/sh
sed -i "s/__PORT__/${PORT:-3000}/" /etc/nginx/http.d/default.conf
php-fpm -D
nginx -g 'daemon off;'