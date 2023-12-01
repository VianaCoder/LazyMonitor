ARG NODE_VERSION=18.17.1

FROM node:${NODE_VERSION}-alpine

WORKDIR /lazymonitor

COPY server ./server
COPY package.json package-lock.json ./

RUN npm install --prod --cache

ENTRYPOINT ["npm", "start"]