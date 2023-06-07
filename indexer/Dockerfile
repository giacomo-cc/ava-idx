# syntax=docker/dockerfile:1.4

FROM node:lts-buster-slim as builder

# Create app directory
WORKDIR /usr/src/app

COPY ./package.json ./yarn.lock .
RUN yarn install --frozen-lockfile

COPY ./ ./
RUN yarn build

# FROM node:lts-buster-slim as server

# # Create app directory
# WORKDIR /usr/src/app

# COPY package.json /usr/src/app/package.json
# COPY yarn.lock /usr/src/app/yarn.lock
# RUN yarn install --frozen-lockfile

# COPY --from=builder /usr/src/app/dist ./dist
CMD [ "yarn", "start" ]