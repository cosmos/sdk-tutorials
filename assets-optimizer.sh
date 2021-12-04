#!/usr/bin/env bash
echo "Assets optimization started"
echo "Setup: Ensure output folder is present"
mkdir -p .vuepress/public/resized-images
echo "Setup: Completed"
echo "Resize: Started to resize images using sharp"
sharp resize 988 -i {*,*/*,*/*/*,.*/*}/*.{png,jpg} -o .vuepress/public/resized-images --optimise true --withMetadata false
echo "Resize: Completed"
echo "Copy: Adds remaining small images to the same output folder"
find . \( -name 'node_modules' -o -path './.vuepress/dist' -o -path './.vuepress/theme' -o -path './.vuepress/public/resized-images' -o -path './.vuepress/public/h5p' \) -prune -o \( -name '*.png' -o -name '*.jpg' \) -exec cp -vu {} .vuepress/public/resized-images \;
echo "Copy: Completed"
echo "Assets optimization completed"