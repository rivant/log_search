#!/bin/sh

ls -R ~/REGION | grep -e "DEST.log$" | cut -d. -f1 | tr '\n' ','