FROM node:lts-alpine as base

WORKDIR /app

COPY package.json ./

COPY tsconfig.json ./

RUN npm i

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build
