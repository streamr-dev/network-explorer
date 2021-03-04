FROM node:14-alpine

ARG NPM_TOKEN

COPY package*.json ./
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    && npm config set //registry.npmjs.org/:_authToken=${NPM_TOKEN} \
    && npm ci \
    && apk del build-dependencies
COPY . ./

EXPOSE 3000
CMD ["npm", "start"]
