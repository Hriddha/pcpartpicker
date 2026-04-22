FROM php:8.2-apache

RUN a2enmod rewrite headers

RUN docker-php-ext-install pdo pdo_mysql

COPY api/php/ /var/www/html/

# Use Railway's dynamic $PORT
RUN echo '<Directory /var/www/html>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

# Script to set Apache port from $PORT env var at runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]