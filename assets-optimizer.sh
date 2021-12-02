#!/usr/bin/env bash
echo "Assets optimization started"
echo "Resize: Started to resize images using sharp"
sharp resize 800 -i {**,**/**,**/**/**}/*.{png,jpg} -o .vuepress/public/resized-images --optimise true --withMetadata false
echo "Resize: Completed"
echo "Copy: Adds remaining small images to the same output folder"
find . \( -name 'node_modules' -o -path './.vuepress/dist' -o -path './.vuepress/theme' -o -path './.vuepress/public/resized-images' -o -path './.vuepress/public/h5p' \) -prune -o \( -name '*.png' -o -name '*.jpg' \) -exec cp -n -v {} .vuepress/public/resized-images \;
echo "Copy: Completed"
echo "Assets optimization completed"