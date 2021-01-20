FROM node:alpine3.12
LABEL "version"="1.5.8"
LABEL "description"="find-an-alpha Development Build"
LABEL "Maintainer"="Dave Johnson"

RUN mkdir -p /src/app

WORKDIR /src/app

COPY . .

RUN npm i -g polymer-cli && npm install 

ENTRYPOINT npm run start