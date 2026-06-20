#!/bin/sh
set -e

node dist/database/seed.js

exec node dist/index.js
