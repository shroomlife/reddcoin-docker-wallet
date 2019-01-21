FROM node:stretch-slim

COPY ./bin /usr/local/bin
RUN mkdir -p /root/.reddcoin
RUN find /usr/local/bin -type f -exec chmod u+x {} \;

COPY ./app /app
WORKDIR /app

EXPOSE 80

CMD ["npm", "start"]