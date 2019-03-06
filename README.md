# Koodisto microservice

Caches koodisto data to redis.

## Installation

### Clone repo

``` bash
# clone the repo
$ git clone https://github.com/CSCfi/koodisto-service.git

# go into app's directory
$ cd koodisto-service

# install app's dependencies
$ yarn install
```

### Run redis docker container

``` bash
# pull docker image
$ docker pull redis

# run docker container
$ docker run --detach --publish 6379:6379 --name=koodisto-redis redis
```

## Usage

``` bash
# serve with hot reload at localhost:3000.
$ yarn run watch

# build for production
$ yarn run build
```

## Endpoints

Endpoints are prefixed with `/api/v1`
