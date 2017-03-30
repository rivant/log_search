#!/bin/sh

# Common variables
ADAPTER_HOME=~
SYS=`uname -n | cut -c 1-4`
SDA=""
REGION_PATTERN='s/[[:alpha:]]*\([0-9]*\)[[:alnum:]]*/\1/'

# Server check to decide if sudo needed
if [[ $SYS = 'phxs' || $SYS = 'phxp' ]]; then
  ADAPTER_HOME=`sudo -u \#800 printenv HOME`
  SDA="sudo -u \#800"
fi

# get region list
REGIONS=`eval $SDA ls $ADAPTER_HOME/REGION`

printf "$REGIONS"
