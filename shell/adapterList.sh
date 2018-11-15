#!/bin/ksh93

ADAPTER_TYPE=$1
KEY=$2
EPASS=$3

# Check for security type
SECURITY=("")
if [[ `uname -n` != phxc* ]]; then  
	SECURITY=(sudo -Au \#800)
	DPASS=`echo "$EPASS" | openssl enc -aes-128-cbc -a -d -pass pass:"$KEY"`
	echo "#!/bin/sh\necho $DPASS" > ~/.sudopass
	chmod 700 ~/.sudopass
	export SUDO_ASKPASS=~/.sudopass
else
	sudo -u \#800 -i "ADAPTER_TYPE=$ADAPTER_TYPE" "SECURITY=$SECURITY"
fi
ADAPTER_HOME=`${SECURITY[@]} printenv HOME`

# Get and return adapter names
NAMES=`${SECURITY[@]} find $ADAPTER_HOME/REGION -type f | grep -e "Adapter.xml$" | xargs ${SECURITY[@]} grep -E "ID=.[A-Z0-9]+_.*${ADAPTER_TYPE}" | cut -d'"' -f2`
print $NAMES