FROM node:latest
WORKDIR /app
RUN apt update
RUN npm install -g http-server
WORKDIR /app/UI
COPY .. .
RUN npm install
CMD ["npm","start"]
