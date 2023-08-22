FROM node:18-alpine as base

WORKDIR /app

COPY . .

COPY ./../privatekey.key /app/privatekey.key
COPY ./../certificate.crt /app/certificate.crt

#RUN npm i

FROM base as production

ENV NODE_PATH ./build

RUN npm run dev
