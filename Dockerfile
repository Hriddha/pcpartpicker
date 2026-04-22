FROM php:8.2-apache

# Enable Apache mod_rewrite
RUN a2enmod rewrite headers

# Install PHP MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Copy PHP API files
COPY api/php/ /var/www/html/

# Apache config to allow .htaccess
RUN echo '<Directory /var/www/html>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

EXPOSE 80