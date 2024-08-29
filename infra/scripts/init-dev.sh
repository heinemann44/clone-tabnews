#!/bin/bash

function cleanup {
    npm run services:stop
    exit 0
}

trap cleanup INT

npm run services:up && npm run services:wait:database && npm run migrations:up && next dev
