#!/bin/bash

VERSIONS_FILE="./versions.txt"
export DOCS_VERSIONS=$(cat "$VERSIONS_FILE")

echo -e "\nBuild platform versions start\n"

echo "Build current version"
npm ci && npm run build

echo "Move generated files to /tmp/versions-build/ folder"
mkdir -p /tmp/versions-build && cp -r .vuepress/dist/* /tmp/versions-build

echo -e "\nBuild other versions\n"

versions=${DOCS_VERSIONS[@]}

for branch in $versions; do \
    echo "Switch to $branch version" ; \
    git clean -fdx && git reset --hard && git checkout $branch && git submodule update ; \
    echo "Build $branch version" ; \
    npm ci && VUEPRESS_BASE="/$branch/" npm run build --no-cache ; \
    echo "Move generated files to /tmp/versions-build/$branch/ folder"
    mkdir -p /tmp/versions-build/$branch && cp -r .vuepress/dist/* /tmp/versions-build/$branch/ ; \
done

echo -e "\nBuild platform versions end\n"
