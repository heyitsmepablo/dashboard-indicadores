FROM postgres:18.2
# Instalar pacotes de localidade
RUN apt-get update && apt-get install -y locales

# Gerar o locale pt_BR.UTF-8
RUN sed -i '/pt_BR.UTF-8/s/^# //g' /etc/locale.gen \
    && locale-gen

# Definir o locale no ambiente do sistema
ENV LANG=en_US \
    LANGUAGE=en_US \
    LC_ALL=pt_BR.UTF-8