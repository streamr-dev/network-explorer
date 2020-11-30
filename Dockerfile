FROM node:14-alpine
COPY package*.json ./
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    && npm ci \
    && apk del build-dependencies
COPY . ./
EXPOSE 3000
CMD ["npm", "start"]
