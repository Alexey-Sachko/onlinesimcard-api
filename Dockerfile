FROM node:12.3.1-alpine

EXPOSE 4500

RUN mkdir -p /usr/bin/app
WORKDIR /usr/bin/app

COPY ./package.json /usr/bin/app/
COPY ./yarn.lock /usr/bin/app/

RUN yarn install

COPY . /usr/bin/app/

RUN yarn build

CMD [ "yarn", "start:prod" ]