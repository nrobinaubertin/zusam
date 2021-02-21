FROM alpine:3.12

# add tini and s6 to manage processes
RUN apk add --no-cache -U tini s6
ENTRYPOINT ["/sbin/tini", "--"]

# global environment variables
ENV ALLOW_EMAIL=true
ENV ALLOW_IMAGE_UPLOAD=true
ENV ALLOW_VIDEO_UPLOAD=true
ENV APP_ENV=prod
ENV DATABASE_NAME=data.db
ENV DOMAIN=localhost
ENV INIT_GROUP=zusam
ENV INIT_PASSWORD=zusam
ENV INIT_USER=zusam
ENV LANG=en
ENV SUBPATH=
EXPOSE 8080
WORKDIR /zusam

# install base packages
RUN set -xe && apk add --no-cache nginx php7 openssl ffmpeg unzip \
    imagemagick \
    php7-common \
    php7-ctype \
    php7-curl \
    php7-dom \
    php7-fileinfo \
    php7-fpm \
    php7-iconv \
    php7-intl \
    php7-json \
    php7-mbstring \
    php7-opcache \
    php7-openssl \
    php7-pdo_sqlite \
    php7-pecl-apcu \
    php7-pecl-imagick \
    php7-posix \
    php7-session \
    php7-simplexml \
    php7-tokenizer \
    php7-xml \
    php7-xmlwriter

# copy files
COPY container/s6.d /etc/s6.d
COPY container/config /zusam/config
COPY container/php7 /etc/php7
COPY container/nginx /etc/nginx
COPY container/run.sh /usr/local/bin/run.sh
COPY public/api/index.php /zusam/public/api/index.php
COPY api /zusam/api
COPY app/dist /zusam/public

# handle build config
RUN set -xe \
    && mkdir -p /run/nginx /zusam/data /var/tmp/nginx /var/lib/nginx \
    && apk add --no-cache --virtual .build-deps tar ca-certificates wget php7-phar unzip \
    && cd /zusam/api && COMPOSER_ALLOW_SUPERUSER=1 php bin/composer install --prefer-dist \
    && rm -rf /zusam/data/data.db \
    && apk del .build-deps \
    && chmod -R 755 /usr/local/bin /etc/s6.d /var/lib/nginx /zusam/public /var/tmp/nginx

VOLUME /zusam/data
CMD ["run.sh"]
