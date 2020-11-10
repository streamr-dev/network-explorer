FROM node:14-alpine
COPY package*.json ./
RUN npm ci
COPY . ./
EXPOSE 3000
CMD ["npm", "start"]
