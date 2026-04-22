#!/bin/bash
# Replace Apache's default port 80 with Railway's $PORT
sed -i "s/Listen 80/Listen ${PORT:-80}/" /etc/apache2/ports.conf
sed -i "s/:80>/:${PORT:-80}>/" /etc/apache2/sites-enabled/000-default.conf

apache2-foreground