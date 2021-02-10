FROM node:12-alpine

ARG PORT=3002

RUN echo $PORT

RUN apk add python alpine-sdk libsodium-dev libtool autoconf automake

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

#RUN npm install yarn
RUN npm install yarn
RUN yarn

COPY --chown=node:node . .

EXPOSE $PORT

CMD [ "yarn", "run", "start" ]
