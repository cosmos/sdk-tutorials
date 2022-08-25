#!/bin/bash

mkdir -p ./ida-customizations/$(dirname $1)

NEW_PATH=./ida-customizations/$1
if test -f "$NEW_PATH"; then
	echo "Warning: file ./ida-customizations/$1 already exists!"
else
	cp -n $1 $NEW_PATH
	echo "File copied to $NEW_PATH"
fi
