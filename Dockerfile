FROM ubuntu:16.04

# Install prerequisites
RUN apt-get update -qq && apt-get install -qq -y curl software-properties-common python-software-properties

# Add certbot source
RUN add-apt-repository -y ppa:certbot/certbot

# Add Node.js source, needed to spin up a simple static file server
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

# Add the Cloud SDK distribution URI as a package source
RUN \
  export CLOUD_SDK_REPO="cloud-sdk-$(lsb_release -c -s)" \
  && \
  echo "deb http://packages.cloud.google.com/apt $CLOUD_SDK_REPO main" | \
    tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Import the Google Cloud public key
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -

# Add yarn source
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update -qq && apt-get install -y -qq certbot nodejs cron at google-cloud-sdk yarn git

RUN yarn global add http-server

# Add package.json and yarn.lock so this layer can be cached independently
ADD package.json yarn.lock ./

# Install dependencies for cert.js script
RUN yarn

# This directory will contain domain vertification files
RUN mkdir -p ./public

# Add service account key required to update the certificate
#
# NOTE: Although the decrypted key is not stored in the repository,
# it will be available at deploy time.
# This is added explicitly so the build fails early if
# the file does not exist
ADD ./secrets/gcloud.letsEncrypt.json .

# Add the certificate genenration and update scripts and crontab file to the container
ADD . .

# Schedule renewal using a cron job
RUN crontab cronJobUpdate

# 1) Start cron and at daemons to enable scheduled tasks 
#
# 2) Schedule certificate generation 15 minutes from now to make sure
# the service is deployed before running the command
#
# 3) Serve public files to allow Let's Encrypt to verify domain ownership
CMD cron start && atd && (echo 'node /cert.js' | at now + 15 minutes) && http-server ./public -p 8080
