FROM node:16-alpine3.17

WORKDIR /app

COPY ./package*.json .
COPY ./tsconfig.json .
COPY . .

RUN npm install -g ts-node typescript
RUN npm install


EXPOSE 5000

CMD [ "ts-node", "bin/www.ts" ]
