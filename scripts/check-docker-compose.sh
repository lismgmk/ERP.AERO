#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if Makefile exists
if [ ! -f "$PROJECT_ROOT/Makefile" ]; then
    echo "Error: Makefile not found in $PROJECT_ROOT"
    exit 1
fi

# Check if docker compose exists (new version)
if command -v docker compose &> /dev/null; then
    echo "docker compose"
    exit 0
fi

# Check if docker-compose exists (old version)
if command -v docker-compose &> /dev/null; then
    echo "docker-compose"
    exit 0
fi

# If neither exists, exit with error
echo "Error: Neither 'docker compose' nor 'docker-compose' found"
exit 1 