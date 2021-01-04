#!/bin/bash

curl \
    -X POST \
    -H "Authorization: token 3d7f22d1f4ca10b2c55e30bb79949865d694f968" \
    https://api.github.com/gists \
    -d '{
        "files": {
            "a1.json": {
                "content": "[]"
            }
        }'
