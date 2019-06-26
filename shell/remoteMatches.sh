#!/bin/ksh93

# User Input. Validated on web page.
SOURCE=$1
SEARCH=$2
END_TIME=$3
START_TIME=$4
KEY=$5
DEST=$6
REMOTE=$7
EPASS=$8

#Source Environment Setup
sudo_setup(){
  SECURITY=(sudo -Au\#800)
  DPASS=`echo "$EPASS" | openssl enc -aes-128-cbc -a -d -pass pass:"$KEY"`
  echo "#!/bin/sh\necho $DPASS" > ~/.sudopass
  chmod 700 ~/.sudopass
  export SUDO_ASKPASS=~/.sudopass
  CLEANUP=(rm ~/.sudopass)
}
sudo_setup

# Common variables
ADAPTER_HOME=`${SECURITY[@]} printenv HOME`
REGION_PATTERN='s/[[:alpha:]-]*\([0-9]*\)[[:alnum:]]*/\1/'
REGION_NAMES=`${SECURITY[@]} ls $ADAPTER_HOME/REGION`

# Search point for sources
SRC_REGION_NUM=`echo $SOURCE | sed $REGION_PATTERN`
SRC_REGION_NAME=`echo "$REGION_NAMES" | grep -E "[A-Z]$SRC_REGION_NUM$"`
SRC_PATH="${ADAPTER_HOME}/REGION/$SRC_REGION_NAME/LOG"

# Search point for remote destination
# Remote access block
if [[ $REMOTE != 'empty' ]]; then
  TUNNEL_PORT=`echo $REMOTE | cut -d_ -f3`
  USER_ID=`echo $REMOTE | cut -d_ -f1`
  TUNNEL_IP=`echo $REMOTE | cut -d_ -f2`
  ACCESS=(ssh -S~/%r-ctrl-socket -qoStrictHostKeyChecking=no localhost -p$TUNNEL_PORT)

  #Setup Tunnel
  expect -c "spawn -noecho ssh -M -S~/%r-ctrl-socket -fNqo StrictHostKeyChecking=no -L $TUNNEL_PORT:localhost:22 $USER_ID@$TUNNEL_IP; log_user 0; expect \"eDir Password:\"; send \"$DPASS\r\"; set timeout 1; expect eof" & 

  #Callback for Tunnel connection with 10 second timeout.
  TIMER=0
  while [ $TIMER -lt 40 ]
  do
    PORT_CHECK=`netstat -an | grep $TUNNEL_PORT`
    if [[ -n $PORT_CHECK ]]; then
      #Setup remote environment and return region names
      REMOTE_REGIONS=$(
        ${ACCESS[@]} "
        echo \"#!/bin/sh\necho $DPASS\" > ~/.sudopass
        chmod 700 ~/.sudopass
        export SUDO_ASKPASS=~/.sudopass
        ${SECURITY[@]} printenv HOME | xargs -I% ${SECURITY[@]} ls %/REGION/ -d 2>/dev/null
      ")
      break
    fi
    sleep 0.25
    TIMER=`expr $TIMER + 1`
  done
      
  if [[ -z $PORT_CHECK ]]; then
    echo "Unable to connect to remote destination server"
    exit
  fi

  DEST_REGION_NUM=`echo $DEST | sed $REGION_PATTERN`
  DEST_REGION_NAME=`echo "$REMOTE_REGIONS" | grep -E "([A-Z]${DEST_REGION_NUM})" | tr -d '\r\n'`
  REMOTE_ADAPTER_HOME=`echo "$REMOTE_REGIONS" | grep "MQHA" | cut -d'/' -f1-3`
  DEST_PATH="${REMOTE_ADAPTER_HOME}/REGION/${DEST_REGION_NAME}/LOG" 
  DEST_DATE_MATCHES=$(${ACCESS[@]} "${SECURITY[@]} find $DEST_PATH -type f -mtime +$END_TIME | grep \"${DEST}_DEST.log\" | sort -r")

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
    SRC_LINE_NUM=`echo $SRC_ENTRY | cut -d: -f2`
    SRC_FILE_NAME=`echo $SRC_ENTRY | cut -d: -f1`

    # Get Message + metadata
    SRC_MSG=`${SECURITY[@]} zgrep "[[:alnum:]]*" $SRC_FILE_NAME | sed "${SRC_LINE_NUM},/COREL ID/!d"`
    CORREL_ID=`echo $SRC_MSG | sed 's/.* COREL ID = \([A-Z0-9]*\) .*/\1/'`

    for DEST_NAME in $DEST_DATE_MATCHES
    do
      # Check for matching correlation Id's
      ID_DEST_MATCHES_ARR=(`${ACCESS[@]} "${SECURITY[@]} zgrep -n \"Id $CORREL_ID\" $DEST_NAME | cut -d: -f1"`)
      ARR_LENGTH=`expr ${#ID_DEST_MATCHES_ARR[@]} - 1`
      ARR_COUNTER=0
      if [[ $ARR_LENGTH -gt 20 ]]; then
        continue
      fi				

      until [[ $ARR_COUNTER -gt $ARR_LENGTH ]]
      do
        LINE_NUMBER=`expr ${ID_DEST_MATCHES_ARR[$ARR_COUNTER]} + 2`
        LINE_GRAB=`${ACCESS[@]} "${SECURITY[@]} zgrep -e \"[:alnum::blank:]*\" $DEST_NAME | sed -n \"${LINE_NUMBER}p\""`

        if [[ -n $ID_DEST_MATCHES_ARR ]]; then
          if [[ -z `echo $LINE_GRAB | grep dummy` ]]; then
             DEST_MSG_MATCH=`${ACCESS[@]} "${SECURITY[@]} zgrep -e \"[:alnum::blank:]*\" $DEST_NAME | sed \"$LINE_NUMBER,/.ACK A./!d\""`
             TOTAL=$TOTAL"$DEST_NAME \n $DEST_MSG_MATCH \n"
          else
             TOTAL=$TOTAL"\n$DEST_NAME \n $LINE_GRAB\r\n"
          fi       
        fi
        ARR_COUNTER=`expr $ARR_COUNTER + 1`
      done
    done
    echo "$CORREL_ID\n${SRC_FILE_NAME}\n$SRC_MSG\n$TOTAL\nDELIMITER"
    TOTAL=''
  done

  #Environment Cleanup
  ${ACCESS[@]} "${CLEANUP[@]}"
  ps -u $USER_ID | grep -v sshd | grep ssh | awk '{print $2}' | xargs -I% kill %  #Close Tunnel
  "${CLEANUP[@]}"
fi