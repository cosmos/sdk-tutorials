#!/bin/bash

VERSIONS_FILE="./versions.txt"
export DOCS_VERSIONS=$(cat "$VERSIONS_FILE")

echo -e "\nBuild platform versions start\n"

echo "Build current version"
npm ci && npm run build

echo "Move generated files to ~/output/ folder"
mkdir -p ~/output && cp -r .vuepress/dist/* ~/output/

echo -e "\nBuild other versions\n"

versions=${DOCS_VERSIONS[@]}

for branch in $versions; do \
    echo "Switch to $branch version" ; \
    git clean -fdx && git reset --hard && git checkout $branch && git submodule update ; \
    echo "Build $branch version" ; \
    npm ci && VUEPRESS_BASE="/$branch/" npm run build --no-cache ; \
    echo "Move generated files to ~/output/$branch/ folder"
    mkdir -p ~/output/$branch && cp -r .vuepress/dist/* ~/output/$branch/ ; \
done

echo -e "\nBuild platform versions end\n"
