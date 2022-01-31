#!/bin/bash

set -e

# Default non-root role
MONGODB_ROLE="${MONGODB_ROLE:-readWrite}"

if [ -n "${MONGODB_USER:-}" ] && [ -n "${MONGODB_PASSWORD:-}" ]; then
  echo "=> Creating MongoDB user ${MONGODB_USER}"
  mongo "${MONGODB_DATABASE}" --host localhost --eval "db.createUser({
    user: '$MONGODB_USER',
    pwd: '$MONGODB_PASSWORD',
    roles:[
      {role:'$MONGODB_ROLE', db:'$MONGODB_DATABASE'},
      {role:'$MONGODB_ROLE', db:'$MONGODB_AGENDA_DATABASE'}
    ]});"
fi
