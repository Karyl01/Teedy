# Using a custom image that already includes Ubuntu 22.04
FROM ubuntu:22.04

# Using the LABEL instruction to add metadata to the image, sets the maintainer's email address for the image
LABEL maintainer="b.gamard@sismics.com"

# Run Debian in non-interactive mode
ENV DEBIAN_FRONTEND noninteractive

# Configure environment variables
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64/
ENV JAVA_OPTIONS -Dfile.encoding=UTF-8 -Xmx1g
ENV JETTY_VERSION 11.0.20
ENV JETTY_HOME /opt/jetty

# Clean up unnecessary files after installation to reduce the size of the image
RUN apt-get update && \
    apt-get -y -q --no-install-recommends install \
    vim less procps unzip wget tzdata openjdk-11-jdk \
    ffmpeg \
    mediainfo \
    tesseract-ocr \
    tesseract-ocr-ara \
    tesseract-ocr-ces \
    tesseract-ocr-chi-sim \
    tesseract-ocr-chi-tra \
    tesseract-ocr-dan \
    tesseract-ocr-deu \
    tesseract-ocr-fin \
    tesseract-ocr-fra \
    tesseract-ocr-heb \
    tesseract-ocr-hin \
    tesseract-ocr-hun \
    tesseract-ocr-ita \
    tesseract-ocr-jpn \
    tesseract-ocr-kor \
    tesseract-ocr-lav \
    tesseract-ocr-nld \
    tesseract-ocr-nor \
    tesseract-ocr-pol \
    tesseract-ocr-por \
    tesseract-ocr-rus \
    tesseract-ocr-spa \
    tesseract-ocr-swe \
    tesseract-ocr-tha \
    tesseract-ocr-tur \
    tesseract-ocr-ukr \
    tesseract-ocr-vie \
    tesseract-ocr-sqi \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Reconfigure time zone data
RUN dpkg-reconfigure -f noninteractive tzdata

# Install Jetty server
RUN wget -nv -O /tmp/jetty.tar.gz \
    "https://repo1.maven.org/maven2/org/eclipse/jetty/jetty-home/${JETTY_VERSION}/jetty-home-${JETTY_VERSION}.tar.gz" \
    && tar xzf /tmp/jetty.tar.gz -C /opt \
    && mv /opt/jetty* /opt/jetty \
    && useradd jetty -U -s /bin/false \
    && chown -R jetty:jetty /opt/jetty \
    && mkdir /opt/jetty/webapps \
    && chmod +x /opt/jetty/bin/jetty.sh

# Expose port 8080
EXPOSE 8080

# Add the local file docs.xml and the built WAR file docs-web-*.war to the container's Jetty web applications directory
ADD docs.xml /app/webapps/docs.xml
ADD docs-web/target/docs-web-*.war /app/webapps/docs.war

# Set the working directory for subsequent instructions
WORKDIR /app

# Set the default command to run when the container starts
CMD ["java", "-jar", "/opt/jetty/start.jar"]
