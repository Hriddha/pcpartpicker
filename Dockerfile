FROM php:8.2-cli

# Install MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Copy PHP API files
COPY api/php/ /app/

WORKDIR /app

# Use PHP's built-in server instead of Apache (no MPM issues)
CMD php -S 0.0.0.0:${PORT:-80} -t /app