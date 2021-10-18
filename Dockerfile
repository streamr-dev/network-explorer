FROM node:16-buster

ARG NPM_AUTH_TOKEN

WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get --assume-yes --no-install-recommends install \
	build-essential=12.6 \
	curl=7.64.0-4+deb10u2 \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*
COPY . ./
RUN npm config set //registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN} \
	&& npm ci

EXPOSE 3000
CMD ["npm", "start"]
