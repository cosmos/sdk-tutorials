#!/bin/bash

VERSIONS_FILE="./versions.txt"
export DOCS_VERSIONS=$(cat "$VERSIONS_FILE")

if [ -z "${VERSIONS_BUILD_PATH}" ]; then
    export VERSIONS_BUILD_PATH="~/output/"
fi

echo -e "\nBuild platform versions start\n"

echo "Build current version"
npm ci && npm run build

echo "Move generated files to /tmp/versions-build/ folder"
mkdir -p $VERSIONS_BUILD_PATH && cp -r .vuepress/dist/* $VERSIONS_BUILD_PATH

echo -e "\nBuild other versions\n"

versions=${DOCS_VERSIONS[@]}

for branch in $versions; do \
    echo "Switch to $branch version" ; \
    git clean -fdx && git reset --hard && git checkout $branch && git submodule update ; \
    echo "Build $branch version" ; \
    npm ci && VUEPRESS_BASE="/$branch/" npm run build --no-cache ; \
    echo "Move generated files to /tmp/versions-build/$branch/ folder"
    mkdir -p "${VERSIONS_BUILD_PATH}${branch}" && cp -r .vuepress/dist/* "${VERSIONS_BUILD_PATH}${branch}" ; \
done

echo -e "\nBuild platform versions end\n"
