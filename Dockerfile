FROM node:14-buster

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

HEALTHCHECK --interval=1m --timeout=10s --start-period=2m --retries=10 CMD /usr/bin/curl --fail --silent --show-error --max-time 9 http://localhost:3000
EXPOSE 3000/tcp
CMD ["npm", "start"]
