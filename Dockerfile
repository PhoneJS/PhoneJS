FROM debian:bullseye-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV MONITOR_DOMINIO=localhost
WORKDIR /var/www/html

# 1️⃣ Pacotes essenciais e permissões
RUN apt-get update && apt-get install -y --no-install-recommends \
  sudo curl wget bash git nano unzip zip jq gnupg2 \
  software-properties-common acl attr \
  net-tools iputils-ping lsof strace procps \
  && mkdir -p /var/www/html/Pull/live /var/www/.cache /tmp/ffmpeg_output \
  && touch /var/www/html/cookies.txt \
  && chmod -R 777 /var/www /tmp /var/www/html/cookies.txt \
  && chown -R www-data:www-data /var/www \
  && usermod -aG sudo www-data \
  && echo "www-data ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2️⃣ PHP 8.2 + Apache + extensões comuns
RUN apt-get update && apt-get install -y \
  lsb-release ca-certificates apt-transport-https \
  && curl -fsSL https://packages.sury.org/php/apt.gpg | gpg --dearmor -o /etc/apt/trusted.gpg.d/php.gpg \
  && echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list \
  && apt-get update && apt-get install -y \
    php8.2 php8.2-cli php8.2-common php8.2-mbstring php8.2-xml php8.2-zip libapache2-mod-php8.2 php8.2-curl php8.2-opcache php8.2-bcmath php8.2-intl php8.2-gd php8.2-mysql \
  && a2enmod php8.2 rewrite dir headers expires proxy proxy_http \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# 3️⃣ FFmpeg (estático + fallback apt)
RUN curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o /tmp/ffmpeg.tar.xz \
  && mkdir -p /opt/ffmpeg \
  && tar -xJf /tmp/ffmpeg.tar.xz -C /opt/ffmpeg --strip-components=1 \
  && ln -sf /opt/ffmpeg/ffmpeg /usr/local/bin/ffmpeg \
  && ln -sf /opt/ffmpeg/ffprobe /usr/local/bin/ffprobe \
  && chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe

RUN apt-get update && apt-get install -y ffmpeg || true

# 4️⃣ Node.js + libs globais
RUN apt-get install -y nodejs npm \
  && npm install -g pm2 nodemon express typescript vite create-react-app || true

# 5️⃣ Extras: Java, bancos, imagem, etc.
RUN apt-get install -y \
  default-jdk openjdk-17-jdk \
  mariadb-client postgresql-client sqlite3 \
  imagemagick nginx redis apache2 || true

# 6️⃣ yt-dlp via pip3
RUN apt-get update && apt-get install -y python3 python3-pip \
  && pip3 install --no-cache-dir yt-dlp \
  && ln -sf $(which yt-dlp) /usr/local/bin/yt-dlp || true

# 7️⃣ Copia os arquivos do projeto
COPY . /var/www/html

# 8️⃣ Permissões + Criação index.php padrão se não existir
RUN chmod -R 755 /var/www/html \
  && chown -R www-data:www-data /var/www/html \
  && echo "🧪 Verificando se index.php existe..." \
  && if [ ! -f /var/www/html/index.php ]; then \
    echo "⚠️ index.php não encontrado. Criando..."; \
    if [ -f /var/www/html/onde.xphp ]; then \
      echo "<?php include 'onde.xphp'; ?>" > /var/www/html/index.php; \
    else \
      echo "<?php" > /var/www/html/index.php && \
      echo "\$protocolo = (!empty(\$_SERVER['HTTPS']) && \$_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';" >> /var/www/html/index.php && \
      echo "\$dominio = \$_SERVER['HTTP_HOST'];" >> /var/www/html/index.php && \
      echo "header('Location: ' . \$protocolo . '://' . \$dominio . '/#/');" >> /var/www/html/index.php && \
      echo "exit;" >> /var/www/html/index.php; \
    fi; \
  fi

# 9️⃣ Configura Apache para servir PHP corretamente
RUN echo '<IfModule mod_dir.c>\nDirectoryIndex index.php index.html\n</IfModule>' > /etc/apache2/mods-available/dir.conf \
  && echo '<FilesMatch "\.php$">\nSetHandler application/x-httpd-php\n</FilesMatch>' > /etc/apache2/mods-available/php8.2.conf \
  && echo '<VirtualHost *:80>\n\
ServerName localhost\n\
DocumentRoot /var/www/html\n\
<Directory /var/www/html>\n\
    Options +Indexes +FollowSymLinks\n\
    AllowOverride All\n\
    DirectoryIndex index.php index.html\n\
    Require all granted\n\
</Directory>\n\
ErrorLog ${APACHE_LOG_DIR}/error.log\n\
CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

EXPOSE 80

# 🔟 CMD: Apache + verificação automática do domínio
CMD bash -c '\
  apache2ctl -D FOREGROUND & \
  sleep 5 && \
  echo "🟢 Apache iniciado." && \
  while true; do \
    for i in $(seq 60 -1 1); do \
      echo -ne "⏳ Aguardando próxima verificação em $i segundos...\r"; \
      sleep 1; \
    done; \
    echo ""; \
    DATA=$(date "+%Y-%m-%d %H:%M:%S"); \
    echo "🌐 Verificando domínio: $MONITOR_DOMINIO..."; \
    PROTO="http"; \
    curl -skI https://$MONITOR_DOMINIO | grep -i "HTTP/" >/dev/null && PROTO="https"; \
    URL="$PROTO://$MONITOR_DOMINIO/online.txt"; \
    RESPONSE=$(curl -s -w " HTTP_CODE:%{http_code}" -o /tmp/online.txt "$URL"); \
    CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d ":" -f 2); \
    if [ "$CODE" = "200" ]; then \
      echo "[$DATA] ✅ ONLINE - $URL (HTTP 200)"; \
    else \
      echo "[$DATA] ⚠️ ERRO - Código HTTP $CODE ao acessar $URL"; \
    fi; \
    echo "📝 Log salvo em /tmp/online.txt"; \
  done'