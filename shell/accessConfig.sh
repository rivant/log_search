#!/usr/bin/expect
set ID [lindex $argv 0]
set IP [lindex $argv 1]
set role [lindex $argv 2]
set adapterType [lindex $argv 3]
set eKey [lindex $argv 4]
set ePass [lindex $argv 5]
set Script shell/adapterList.sh
set timeout 30
set dPass [exec echo $ePass | openssl enc -aes-128-cbc -a -d -pass pass:$eKey]
set try 0

spawn -noecho ksh93 -c "ssh -o StrictHostKeyChecking=no $ID@$IP ksh93 -s < $Script $IP $role $adapterType $eKey $ePass 2>/dev/null"

log_user 0

expect {
	"Password:" {
		if { $try == 1 } {			
			exit 1
		}
		
		send "$dPass\r"
		incr try
		log_user 1
		exp_continue
	}
	
	eof {
		# Success
	}
}