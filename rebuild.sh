#!/bin/bash
# Update target and abi for the electron version being used

npm rebuild --runtime=electron --target=1.4.13 --disturl=https://atom.io/download/atom-shell --abi=50
