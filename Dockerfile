FROM php:8.2-apache

# Fix: disable conflicting MPMs, enable only prefork
RUN a2dismod mpm_event mpm_worker || true && \
    a2enmod mpm_prefork rewrite headers

# Install PHP MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Copy PHP API files
COPY api/php/ /var/www/html/

# Apache config
RUN echo '<Directory /var/www/html>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

# Copy and set entrypoint for Railway dynamic port
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]