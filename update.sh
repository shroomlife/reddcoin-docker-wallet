#!/bin/bash
git stash
git pull
docker-compose up -d --build