FROM postgres:16-alpine

# Instalar os pacotes de locale nativos do Alpine e o banco de dados do ICU
RUN apk add --no-cache musl-locales musl-locales-lang icu-data-full

# Definir as variáveis de ambiente para português do Brasil
ENV MUSL_LOCPATH=/usr/share/i18n/locales/musl
ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8