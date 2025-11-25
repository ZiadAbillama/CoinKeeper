FROM jenkins/jenkins:lts

USER root

# Install Docker
RUN apt-get update && apt-get install -y \
    docker.io \
    docker-compose \
    kubectl \
    git \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Add Jenkins user to docker group
RUN groupadd -f docker && \
    usermod -aG docker jenkins

USER jenkins

# Install plugins from plugins.txt
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli -f /usr/share/jenkins/ref/plugins.txt

# Copy Jenkins configuration files
COPY casc.yaml /usr/share/jenkins/ref/jenkins.yaml
ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/jenkins.yaml

# Copy initialization scripts
COPY init.groovy.d/ /usr/share/jenkins/ref/init.groovy.d/

EXPOSE 8080 50000

ENV JAVA_OPTS="-Xmx2G -Xms1G"
