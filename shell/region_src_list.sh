#!/bin/sh

# Get source logs
ls -R ~/REGION | grep -e "SOURCE.log$" | cut -d. -f1 | tr '\n' ','