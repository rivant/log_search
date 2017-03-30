#!/bin/sh

# Common variables
ADAPTER_HOME=~
SYS=`uname -n | cut -c 1-4`
SDA=""

# Server check to decide if sudo needed
if [[ $SYS = 'phxs' || $SYS = 'phxp' ]]; then
  ADAPTER_HOME=`sudo -u \#800 printenv HOME`
  SDA="sudo -u \#800"
fi

# Get region and dests
eval $SDA find $ADAPTER_HOME/REGION -type f | grep -e "DEST.log$"
