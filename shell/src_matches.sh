#!/bin/sh

# User Input. Validated on web page.
SOURCE=$1
SEARCH=$2
END_TIME=$3
START_TIME=$4

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

# Find region numbers
SOURCE_ID=`echo $SOURCE | sed $REGION_PATTERN`
SRC_REGION=`eval $SDA ls $ADAPTER_HOME/REGION | grep -E "[A-Z]$SOURCE_ID"`

# Set source file path
SRC_PATH="$ADAPTER_HOME/REGION/$SRC_REGION/LOG"

# Match $SEACH and return filename, message, and corellation ID
if [ `eval $SDA ls $SRC_PATH 2>/dev/null | wc -l` != 0 ]; then
   MATCHES=`$(eval $SDA) find $SRC_PATH -type f -mtime +$END_TIME ! -mtime +$START_TIME | grep "${SOURCE}_SOURCE.log" | sort -r | xargs -I % $(eval $SDA) zgrep -e "[:alnum::blank:]*" % /dev/null | sed "/${SEARCH}/,/ACKCODE/!d"`
   if [[ -z $MATCHES ]]; then
      printf "Cannot find $SEARCH in $SOURCE Source Logs." 1>&2
      exit 1
   fi
else
  echo "Cannot find $SRC_PATH\n" 1>&2
  exit 1
fi

printf "$MATCHES"
