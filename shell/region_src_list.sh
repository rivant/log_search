#!/bin/sh

# Get region and source logs
find ~/REGION -type f | grep -e "SOURCE.log$" | tr '\n' ','