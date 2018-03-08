#!/bin/ksh93

# User Input. Validated on web page.
# All required except for DEST
SOURCE=$1
SEARCH=$2
END_TIME=$3
START_TIME=$4
DEST=$5

# Common variables
ADAPTER_HOME=`printenv HOME`
REGION_PATTERN='s/[[:alpha:]-]*\([0-9]*\)[[:alnum:]]*/\1/'
REGION_NAMES=`ls $ADAPTER_HOME/REGION`

# Download cleanup
find files -type f -mmin +240 | xargs rm

# Search point for sources
SRC_REGION_NUM=`echo $SOURCE | sed $REGION_PATTERN`
SRC_REGION_NAME=`echo "$REGION_NAMES" | grep -E "[A-Z]$SRC_REGION_NUM$"`
SRC_PATH="${ADAPTER_HOME}/REGION/$SRC_REGION_NAME/LOG"

# Search points for destinations
if [[ -n $DEST ]]; then
   DEST_REGION_NUM=`echo $DEST | sed $REGION_PATTERN`
   DEST_REGION_NAME=`echo "$REGION_NAMES" | grep -E "[A-Z]$DEST_REGION_NUM$"`
   DEST_PATH="${ADAPTER_HOME}/REGION/$DEST_REGION_NAME/LOG"
   DEST_LOG="${DEST}_DEST.log"
else
	DOWNSTREAM=`cat ${ADAPTER_HOME}/REGION/$SRC_REGION_NAME/CONFIG/${SRC_REGION_NAME}Adapter.xml | sed "/${SOURCE}_SOURCE/,/<\/destinations>/!d" | grep '<destID>' | sed 's/.*>\([A-Z0-9-]*\)<.*/\1/'`
	NUM_CHECK=''
	for adapter in $DOWNSTREAM
	do
		DEST_REGION_NUM=`echo $adapter | sed $REGION_PATTERN`		
		if [[ -n `echo $NUM_CHECK | grep $DEST_REGION_NUM` ]]; then
			continue
		fi
		NUM_CHECK="$NUM_CHECK $DEST_REGION_NUM"
		DEST_REGION_NAME=`echo "$REGION_NAMES" | grep -E "[A-Z]$DEST_REGION_NUM$"`
		DEST_PATH="$DEST_PATH ${ADAPTER_HOME}/REGION/$DEST_REGION_NAME/LOG"		
	done
	DEST_LOG="_DEST.log"	
fi
DEST_DATE_MATCHES=`find $DEST_PATH -type f -mtime +$END_TIME ! -mtime +$START_TIME | grep $DEST_LOG | sort -r`

# Find $SOURCE files in date range.  Return file name and line number of $SEARCH
# Filter out Ack Messages, and search criteria outside of a message
if [ `ls $SRC_PATH 2>/dev/null | wc -l` != 0 ]; then
   SRC_MATCHES=`find $SRC_PATH -type f -mtime +$END_TIME ! -mtime +$START_TIME | grep "${SOURCE}_SOURCE.log" | sort -r | xargs zgrep -n $SEARCH /dev/null | grep -v "MSA|" | grep "MSH|" | cut -d: -f1-2`
   if [[ -z $SRC_MATCHES ]]; then
      printf "Cannot find $SEARCH in $SOURCE Source Log Messages." 1>&2
      exit 1
   fi
else
  printf "Cannot find $SRC_PATH\n" 1>&2
  exit 1
fi

# Match sources to dests
for SRC_ENTRY in $SRC_MATCHES
do
   SRC_LINE_NUM=`echo $SRC_ENTRY | cut -d: -f2`
   SRC_FILE_NAME=`echo $SRC_ENTRY | cut -f1 -d:`

   # Make file available for download
   SRC_NAME_ONLY=`echo $SRC_FILE_NAME | rev | cut -d/ -f1 | rev | sed 's/.gz/.log/g'`
   zgrep -e "[:alnum::blank:]*" $SRC_FILE_NAME > files/$SRC_NAME_ONLY

	 # Get Message + message info
   SRC_MSG=`zgrep -e "[:alnum::blank:]*" $SRC_FILE_NAME | sed "${SRC_LINE_NUM},/COREL ID/!d"`   
   CORREL_ID=`echo $SRC_MSG | sed 's/.* COREL ID = \([A-Z0-9]*\) .*/\1/'`

   for DEST_NAME in $DEST_DATE_MATCHES
   do
      # Check for matching correlation Id's
      ID_DEST_MATCHES_ARR=(`zgrep -n "Id $CORREL_ID" $DEST_NAME | cut -d: -f1`)
      ARR_LENGTH=`expr ${#ID_DEST_MATCHES_ARR[@]} - 1`
      ARR_COUNTER=0
			if [[ $ARR_LENGTH -gt 20 ]]; then
				continue
			fi
			
			# Make file available for download
      DST_NAME_ONLY=`echo $DEST_NAME | rev | cut -d/ -f1 | rev | sed 's/.gz/.log/g'`
      zgrep -e "[:alnum::blank:]*" $DEST_NAME > files/$DST_NAME_ONLY
					
      until [[ $ARR_COUNTER -gt $ARR_LENGTH ]]
      do
				LINE_NUMBER=`expr ${ID_DEST_MATCHES_ARR[$ARR_COUNTER]} + 2`
				LINE_GRAB=`sed -n "${LINE_NUMBER}p" $DEST_NAME`

        if [[ -n $ID_DEST_MATCHES_ARR ]]; then					
          #if [[ -z `echo $LINE_GRAB | grep dummy` ]] && [[ -z `echo $LINE_GRAB | grep -E "(WARN|ERROR|SEQCNTL)"` ]]; then
					if [[ -z `echo $LINE_GRAB | grep dummy` ]]; then
            DEST_MSG_MATCH=`zgrep -e "[:alnum::blank:]*" $DEST_NAME | sed "$LINE_NUMBER,/MSH/!d"`
            TOTAL=$TOTAL"$DEST_NAME \n $DEST_MSG_MATCH \n"
          else
            TOTAL=$TOTAL"\n$DEST_NAME \n $LINE_GRAB\r\n"
          fi          
        fi
				ARR_COUNTER=`expr $ARR_COUNTER + 1`
      done		
   done
   TOTAL="$CORREL_ID\n${SRC_PATH}/${SRC_NAME_ONLY}\n$SRC_MSG\n$TOTAL DELIMITER"
   echo "$TOTAL"
   TOTAL=''
done