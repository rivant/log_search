#!/bin/sh

# User Input. Validated on web page.
# All required except for DEST
SOURCE=$1
SEARCH=$2
END_TIME=$3
START_TIME=$4
DEST=$5

# Common variables
ADAPTER_HOME=~
SYS=`uname -n | cut -c 1-4`
SDA=""
REGION_PATTERN='s/[[:alpha:]]*\([0-9]*\)[[:alnum:]]*/\1/'
DELIM='DELIMITER '
C2N="tr '[:cntrl:]' '[\\n*]'"

# Server check to decide if sudo needed
if [[ $SYS = 'phxs' || $SYS = 'phxp' ]]; then
  ADAPTER_HOME=`sudo -u \#800 printenv HOME`
  SDA="sudo -u \#800"
fi

# Search point for sources
SRC_REGION_NUM=`echo $SOURCE | sed $REGION_PATTERN`
SRC_REGION_NAME=`eval $SDA ls $ADAPTER_HOME/REGION | grep -E "[A-Z]$SRC_REGION_NUM"`
SRC_PATH="$ADAPTER_HOME/REGION/$SRC_REGION_NAME/LOG"

# Search point for destinations
if [[ -n $DEST ]]; then
   DEST_REGION_NUM=`echo $DEST | sed $REGION_PATTERN`
   DEST_REGION_NAME=`eval $SDA ls $ADAPTER_HOME/REGION | grep -E "[A-Z]$DEST_REGION_NUM"`
   DEST_PATH="$ADAPTER_HOME/REGION/$DEST_REGION_NAME/LOG"
   DEST_LOG="${DEST}_DEST.log"
else
   DEST_PATH="$ADAPTER_HOME/REGION"
   DEST_LOG="_DEST.log"
fi

# Match $SEARCH and date range, then return filename, message, and correlation ID
if [ `eval $SDA ls $SRC_PATH 2>/dev/null | wc -l` != 0 ]; then
   SRC_MATCHES=`eval $SDA find $SRC_PATH -type f -mtime +$END_TIME ! -mtime +$START_TIME | grep "${SOURCE}_SOURCE.log" | sort -r | xargs $(eval $SDA) zgrep -e "[:alnum::blank:]*" /dev/null | sed "/${SEARCH}/,/ACKCODE/!d"`
   if [[ -z $SRC_MATCHES ]]; then
      printf "Cannot find $SEARCH in $SOURCE Source Logs." 1>&2
      exit 1
   fi
else
  printf "Cannot find $SRC_PATH\n" 1>&2
  exit 1
fi

# Find dest files in date range and $DEST_PATH
DEST_MATCHES=`$(eval $SDA) find $DEST_PATH -type f -mtime +$END_TIME ! -mtime +$START_TIME | grep $DEST_LOG | sort -r`


# Match Corel ID's to files
if [ `eval $SDA ls $DEST_PATH 2>/dev/null | wc -l` != 0 ]; then
   for ID in $COREL_IDS
   do
      for FILE_NAME in $DEST_MATCHES
      do
         PARTIAL=`eval $SDA zgrep $ID $FILE_NAME /dev/null`
         if [[ -n $PARTIAL ]]; then
            if [[ -z `echo $PARTIAL | grep dummy` ]]; then
               MATCH=`zgrep -e "[:alnum::blank:]*" $FILE_NAME /dev/null | sed "/$ID/,/MSH/!d"`
               TOTAL=$TOTAL$MATCH$DELIM
            else
               TOTAL=$TOTAL$PARTIAL$DELIM
            fi
         fi
      done
      printf "$TOTAL"
      TOTAL=''
   done
else
   echo "Cannot find:  $DEST_PATH\n" 1>&2
   exit 1
fi


# printf "$SRC_MATCHES"
