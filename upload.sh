#!/bin/bash

rsync -rltv --delete --exclude-from='no-upload.txt' ./ frozenfractal.com:/var/www/discharge.frozenfractal.com/
