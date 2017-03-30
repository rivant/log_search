#!/bin/sh

# User Input. Validated on web page.
DEST=$1
END_TIME=$2
START_TIME=$3
COREL_IDS=$4

# Common variables
ADAPTER_HOME=~
SYS=`uname -n | cut -c 1-4`
SDA=""
C2N="tr '[:cntrl:]' '[\\n*]'"
DELIM='DELIMITER '

# Server check to see if sudo needed
if [[ $SYS = 'phxs' || $SYS = 'phxp' ]]; then
  ADAPTER_HOME=`sudo -u \#800 printenv HOME`
  SDA="sudo -u \#800"
fi

# Search point for destinations
if [[ -n $DEST ]]; then
   DEST_ID=`echo $DEST | sed 's/[[:alpha:]]*\([0-9]*\)[[:alnum:]]*/\1/'`
   DEST_REGION=`eval $SDA ls $ADAPTER_HOME/REGION | grep -E "[A-Z]$DEST_ID"`
   DEST_PATH="$ADAPTER_HOME/REGION/$DEST_REGION/LOG"
   DEST_LOG="${DEST}_DEST.log"
else
   DEST_PATH="$ADAPTER_HOME/REGION"
   DEST_LOG="_DEST.log"
fi

# Find files with user given specs
MATCHES=`$(eval $SDA) find $DEST_PATH -type f -mtime +$END_TIME ! -mtime +$START_TIME | grep $DEST_LOG | sort -r`

# Match Corel ID's to files
if [ `eval $SDA ls $DEST_PATH 2>/dev/null | wc -l` != 0 ]; then
   for ID in $COREL_IDS
   do
      for FILE_NAME in $MATCHES
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
