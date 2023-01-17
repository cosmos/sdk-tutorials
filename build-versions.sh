#!/bin/sh

echo "\nBuild platform versions start\n"

echo "\nBuild current version\n"
npm ci && npm run build

echo "\Move generated files to ~/output/ folder\n"
mkdir -p ~/output && cp -r .vuepress/dist/* ~/output/

echo "\nBuild other versions\n"
versions=${DOCS_VERSIONS[@]}
for branch in $versions; do \
    echo "\nBuild docs version $branch\n" ; \
    git clean -fdx && git reset --hard && git checkout $branch && git submodule update ; \
    npm ci && VUEPRESS_BASE="/$branch/" npm run build --no-cache ; \
    echo "\Move generated files to ~/output/$branch/ folder\n"
    mkdir -p ~/output/$branch && cp -r .vuepress/dist/* ~/output/$branch/ ; \
done

echo "\nBuild platform versions end\n"
