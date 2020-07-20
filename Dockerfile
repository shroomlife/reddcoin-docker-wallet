FROM node:stretch-slim
LABEL maintainer="robin@shroomlife.de"

ENV DEBIAN_FRONTEND="noninteractive"
ENV BUILD_PACKAGES="wget"
ENV REDDCOIN_VERSION="3.10.1"

RUN apt-get update && apt-get install -y $BUILD_PACKAGES

RUN echo https://download.reddcoin.com/bin/reddcoin-core-$REDDCOIN_VERSION/reddcoin-$REDDCOIN_VERSION-linux64.tar.gz
RUN wget https://download.reddcoin.com/bin/reddcoin-core-$REDDCOIN_VERSION/reddcoin-$REDDCOIN_VERSION-linux64.tar.gz
RUN tar -xvzf reddcoin-$REDDCOIN_VERSION-linux64.tar.gz -C /tmp
RUN mv /tmp/reddcoin-$REDDCOIN_VERSION/bin/reddcoind /usr/local/bin/reddcoind
RUN mv /tmp/reddcoin-$REDDCOIN_VERSION/bin/reddcoin-cli /usr/local/bin/reddcoin-cli

RUN rm -rf /tmp/reddcoin-$REDDCOIN_VERSION
RUN find /usr/local/bin -type f -exec chmod u+x {} \;

RUN apt-get remove -y $BUILD_PACKAGES && apt-get autoremove -y

RUN mkdir -p /root/.reddcoin

COPY . /app
WORKDIR /app

RUN npm install

EXPOSE 80

CMD ["npm", "start"]
