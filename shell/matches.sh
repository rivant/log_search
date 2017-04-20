#!/bin/sh

# User Input. Validated on web page.
# All required except for DEST
SOURCE=$1
SEARCH=$2
END_TIME=$3
START_TIME=$4
DEST=$5

# Common variables
ADAPTER_HOME=`printenv HOME|cut -d'/' -f1-3`
REGION_PATTERN='s/[[:alpha:]]*\([0-9]*\)[[:alnum:]]*/\1/'
C2N="tr '[:cntrl:]' '[\\n*]'"

# Search point for sources
SRC_REGION_NUM=`echo $SOURCE | sed $REGION_PATTERN`
SRC_REGION_NAME=`ls $ADAPTER_HOME/REGION | grep -E "[A-Z]$SRC_REGION_NUM"`
SRC_PATH="${ADAPTER_HOME}/REGION/$SRC_REGION_NAME/LOG"

# Search point for destinations
if [[ -n $DEST ]]; then
   DEST_REGION_NUM=`echo $DEST | sed $REGION_PATTERN`
   DEST_REGION_NAME=`ls $ADAPTER_HOME/REGION | grep -E "[A-Z]$DEST_REGION_NUM"`
   DEST_PATH="${ADAPTER_HOME}/REGION/$DEST_REGION_NAME/LOG"
   DEST_LOG="${DEST}_DEST.log"
else
   DEST_PATH="${ADAPTER_HOME}/REGION"
   DEST_LOG="_DEST.log"
fi

# Find $SOURCE files in date range.  Return file name and line number of $SEARCH
if [ `ls $SRC_PATH 2>/dev/null | wc -l` != 0 ]; then
   SRC_MATCHES=`find $SRC_PATH -type f -mtime +$END_TIME ! -mtime +$START_TIME | grep "${SOURCE}_SOURCE.log" | sort -r | xargs zgrep -n $SEARCH /dev/null| cut -f1-2 -d:`
   if [[ -z $SRC_MATCHES ]]; then
      printf "Cannot find $SEARCH in $SOURCE Source Logs." 1>&2
      exit 1
   fi
else
  printf "Cannot find $SRC_PATH\n" 1>&2
  exit 1
fi

# Find dest files in date range and $DEST_PATH
DEST_DATE_MATCHES=`find $DEST_PATH -type f -mtime +$END_TIME ! -mtime +$START_TIME | grep $DEST_LOG | sort -r`

# Match sources to dests
for SRC_ENTRY in $SRC_MATCHES
do
   SRC_LINE_NUM=`echo $SRC_ENTRY | cut -d: -f2`
   SRC_FILE_NAME=`echo $SRC_ENTRY | cut -f1 -d:`
   SRC_MSG=`zgrep -e "[:alnum::blank:]*" $SRC_FILE_NAME | sed "${SRC_LINE_NUM},/ACKCODE/!d"`
   CORREL_ID=`echo $SRC_MSG | sed 's/.* COREL ID = \([A-Z0-9]*\) .*/\1/'`
   for DEST_NAME in $DEST_DATE_MATCHES
   do
      DEST_PARTIAL=`zgrep $CORREL_ID $DEST_NAME`
      if [[ -n $DEST_PARTIAL ]]; then
         if [[ -z `echo $DEST_PARTIAL | grep dummy` ]]; then
            DEST_MATCH=`zgrep -e "[:alnum::blank:]*" $DEST_NAME | sed "/$CORREL_ID/,/MSH/!d"`
            TOTAL=$TOTAL"$DEST_NAME \n $DEST_MATCH \n"
         else
            TOTAL=$TOTAL"\n$DEST_NAME \n $DEST_PARTIAL \n"
         fi
      fi
   done
   TOTAL="$CORREL_ID\n$SRC_FILE_NAME\n$SRC_MSG\n$TOTAL DELIMITER"
   echo "$TOTAL"
   TOTAL=''
done
