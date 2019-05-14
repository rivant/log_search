#!/bin/ksh93

# User Input. Validated on web page.
# All required except for DEST
SOURCE=$1
SEARCH=$2
END_TIME=$3
START_TIME=$4
KEY=$5
DEST=$6
REMOTE=$7
EPASS=$8

# check if sudo needed
SECURITY=("")
CLEANUP=("")
if [[ `uname -n` != phxc* ]]; then
  sudo_setup(){
    SECURITY=(sudo -Au\#800)
    DPASS=`echo "$EPASS" | openssl enc -aes-128-cbc -a -d -pass pass:"$KEY"`
    echo "#!/bin/sh\necho $DPASS" > ~/.sudopass
    chmod 700 ~/.sudopass
    export SUDO_ASKPASS=~/.sudopass
    CLEANUP=(rm ~/.sudopass)
  }
  sudo_setup
else
	sudo -u \#800 -i "SECURITY=$SECURITY" "SOURCE=$SOURCE" "SEARCH=$SEARCH" "END_TIME=$END_TIME" "START_TIME=$START_TIME" "DEST=$DEST"
fi

# Common variables
ADAPTER_HOME=`${SECURITY[@]} printenv HOME`
REGION_PATTERN='s/[[:alpha:]-]*\([0-9]*\)[[:alnum:]]*/\1/'
REGION_NAMES=`${SECURITY[@]} ls $ADAPTER_HOME/REGION`

# Search point for sources
SRC_REGION_NUM=`echo $SOURCE | sed $REGION_PATTERN`
SRC_REGION_NAME=`echo "$REGION_NAMES" | grep -E "[A-Z]$SRC_REGION_NUM$"`
SRC_PATH="${ADAPTER_HOME}/REGION/$SRC_REGION_NAME/LOG"

# Search point for remote destination
if [ $DEST_LOCATION != 'empty' -a $DEST != 'empty' ]; then
  #Setup Tunnel
  USER_ID=`echo $REMOTE | cut -d_ -f1`
  TUNNEL_IP=`echo $REMOTE | cut -d_ -f2`
  TUNNEL_PORT=`echo $REMOTE | cut -d_ -f3`
  ACCESS=(ssh -qoStrictHostKeyChecking=no localhost -p$TUNNEL_PORT)
  expect -c "spawn -noecho ssh -fNqo StrictHostKeyChecking=no -L $TUNNEL_PORT:localhost:22 $USER_ID@$TUNNEL_IP; log_user 0; expect \"eDir Password:\"; send \"$DPASS\r\"; set timeout 1; expect eof" & 
  
  #Callback for Tunnel connection with 10 second timeout.
  TIMER=0
  until [ $TIMER -gt 40 ]
  do
    PORT_CHECK=`netstat -an | grep $TUNNEL_PORT`
    if [[ -n $PORT_CHECK ]]; then
      #echo Established in `echo $TIMER \* 0.25|bc` seconds
      break
    fi
    sleep 0.25
    TIMER=`expr $TIMER + 1`
  done
    
  #Remote Environment Setup
  if [[ -n $PORT_CHECK ]]; then    
    USER_DIR=$(
      /usr/bin/expect <<-EOD
      spawn -noecho ksh93 -c "${ACCESS[@]} 'echo \"#!/bin/sh\necho $DPASS\" > ~/.sudopass; chmod 700 ~/.sudopass; export SUDO_ASKPASS=~/.sudopass; ${SECURITY[@]} printenv HOME'"
      log_user 0
      expect "eDir Password:"
      send "$DPASS\r"
      log_user 1
      expect eof
EOD)

    #Environment and Tunnel Cleanup
    /usr/bin/expect <<-EOD
      spawn -noecho ksh93 -c "${ACCESS[@]} '${CLEANUP[@]}'"
      log_user 0
      expect "eDir Password:"
      send "$DPASS\r"
      log_user 1
      expect eof
EOD
    ps -u $USER_ID | grep -v sshd | grep ssh | cut -d' ' -f3 | xargs -I% kill %
  else
    echo "Unable to connect to remote destination server"
  fi
fi

# Search point for destinations
if [[ $DEST != 'empty' ]]; then
   DEST_REGION_NUM=`echo $DEST | sed $REGION_PATTERN`
   DEST_REGION_NAME=`echo "$REGION_NAMES" | grep -E "[A-Z]$DEST_REGION_NUM$"`	 
   DEST_PATH="${ADAPTER_HOME}/REGION/$DEST_REGION_NAME/LOG"
   DEST_LOG="${DEST}_DEST.log"	 
else
	DOWNSTREAM=`${SECURITY[@]} cat ${ADAPTER_HOME}/REGION/$SRC_REGION_NAME/CONFIG/${SRC_REGION_NAME}Adapter.xml | sed "/${SOURCE}_SOURCE/,/<\/destinations>/!d" | grep '<destID>' | sed 's/.*>\([A-Z0-9-]*\)<.*/\1/'`	
	if [[ -z $DOWNSTREAM ]]; then
		echo Unable to find entry for ${SOURCE}_SOURCE in ${SRC_REGION_NAME}Adapter.xml to determine destinations.  Try specifying a destination.
		exit 1
	fi
	NUM_CHECK=''
	for adapter in $DOWNSTREAM
	do
		DEST_REGION_NUM=`echo $adapter | sed $REGION_PATTERN`
		DEST_REGION_NAME=`echo "$REGION_NAMES" | grep -E "[A-Z]$DEST_REGION_NUM$"`
		
		# Prevent storing duplicate regions and missing regions
		if [[ -n `echo $NUM_CHECK | grep $DEST_REGION_NUM` ]] || [[ -z $DEST_REGION_NAME ]]; then
			continue
		fi
		
		# Select last region on duplicates
		REGION_NAME_COUNT=`echo $DEST_REGION_NAME | wc -w`
		if [ $REGION_NAME_COUNT > 1 ]; then
			DEST_REGION_NAME=`echo $DEST_REGION_NAME | cut -d' ' -f $REGION_NAME_COUNT`
		fi

		NUM_CHECK="$NUM_CHECK $DEST_REGION_NUM"		
		DEST_PATH="$DEST_PATH ${ADAPTER_HOME}/REGION/$DEST_REGION_NAME/LOG"		
	done
	DEST_LOG="_DEST.log"
fi 
DEST_DATE_MATCHES=`${SECURITY[@]} find $DEST_PATH -type f -mtime +$END_TIME ! -mtime +$START_TIME | grep $DEST_LOG | sort -r`

# Find $SOURCE files in date range.  Return file name and line number of $SEARCH
# Filter out Ack Messages, and any search criteria outside of an hl7 message
if [ `${SECURITY[@]} ls $SRC_PATH 2>/dev/null | wc -l` != 0 ]; then		
  SRC_MATCHES=`${SECURITY[@]} find $SRC_PATH -type f -mtime +$END_TIME ! -mtime +$START_TIME | grep "${SOURCE}_SOURCE.log" | sort -r | xargs ${SECURITY[@]} zgrep -n "$SEARCH" /dev/null | grep -v "MSA|" | grep "MSH|" | cut -f1-2 -d:`
	
  if [[ -z $SRC_MATCHES ]]; then
    printf "Unable to find $SEARCH in $SOURCE Source Log Messages."
    exit 1
  fi
else
  printf "Unable to find $SRC_PATH\n" 1>&2
  exit 1
fi

# Match sources to dests
for SRC_ENTRY in $SRC_MATCHES
do
  SRC_LINE_NUM=`echo $SRC_ENTRY | cut -f2 -d:`
  SRC_FILE_NAME=`echo $SRC_ENTRY | cut -f1 -d:`
	SRC_NAME_ONLY=`echo $SRC_FILE_NAME | rev | cut -d/ -f1 | rev | sed 's/.gz/.log/g'`
       
  # Get Message + metadata
	#SRC_MSG=`${SECURITY[@]} zgrep "[[:alnum:]]*" $SRC_FILE_NAME | sed "${SRC_LINE_NUM},/RESPONSE/!d"`
  SRC_MSG=`${SECURITY[@]} zgrep "[[:alnum:]]*" $SRC_FILE_NAME | sed "${SRC_LINE_NUM},/COREL ID/!d"`
  CORREL_ID=`echo $SRC_MSG | sed 's/.* COREL ID = \([A-Z0-9]*\) .*/\1/'`

  for DEST_NAME in $DEST_DATE_MATCHES
  do
    # Check for matching correlation Id's
    ID_DEST_MATCHES_ARR=(`${SECURITY[@]} zgrep -n "Id $CORREL_ID" $DEST_NAME | cut -d: -f1`)
    ARR_LENGTH=`expr ${#ID_DEST_MATCHES_ARR[@]} - 1`
    ARR_COUNTER=0
		if [[ $ARR_LENGTH -gt 20 ]]; then
			continue
		fi				

    until [[ $ARR_COUNTER -gt $ARR_LENGTH ]]
    do
      LINE_NUMBER=`expr ${ID_DEST_MATCHES_ARR[$ARR_COUNTER]} + 2`
      LINE_GRAB=`${SECURITY[@]} zgrep -e "[:alnum::blank:]*" $DEST_NAME | sed -n "${LINE_NUMBER}p"`

      if [[ -n $ID_DEST_MATCHES_ARR ]]; then
        if [[ -z `echo $LINE_GRAB | grep dummy` ]]; then
           #DEST_MSG_MATCH=`${SECURITY[@]} sed "$LINE_NUMBER,/.ACK A./!d" $DEST_NAME`
           DEST_MSG_MATCH=`${SECURITY[@]} zgrep -e "[:alnum::blank:]*" $DEST_NAME | sed "$LINE_NUMBER,/.ACK A./!d"`
           #DEST_MSG_MATCH=`${SECURITY[@]} zgrep -e "[:alnum::blank:]*" $DEST_NAME | sed "$LINE_NUMBER,/MSH/!d"`
           TOTAL=$TOTAL"$DEST_NAME \n $DEST_MSG_MATCH \n"
        else
           TOTAL=$TOTAL"\n$DEST_NAME \n $LINE_GRAB\r\n"
        fi       
      fi
      ARR_COUNTER=`expr $ARR_COUNTER + 1`
    done
  done
  echo "$CORREL_ID\n${SRC_PATH}/${SRC_NAME_ONLY}\n$SRC_MSG\n$TOTAL\nDELIMITER"  
  TOTAL=''
done
`${CLEANUP[@]}`