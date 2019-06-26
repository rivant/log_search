#!/usr/bin/expect
set ID [lindex $argv 0]
set IP [lindex $argv 1]
set Source [lindex $argv 2]
set Pattern [lindex $argv 3]
set End_Time [lindex $argv 4]
set Start_Time [lindex $argv 5]
set eKey [lindex $argv 6]
set Dest [lindex $argv 7]
set Dest_Location [lindex $argv 8]
set ePass [lindex $argv 9]
set timeout 3600
set dPass [exec echo $ePass | openssl enc -aes-128-cbc -a -d -pass pass:$eKey]
set try 0

if { $Dest_Location == "empty" } {
  spawn -noecho ksh93 -c "ssh -o StrictHostKeyChecking=no $ID@$IP ksh93 -s < shell/matches.sh $Source \"$Pattern\" $End_Time $Start_Time $eKey $Dest $Dest_Location $ePass 2>/dev/null"
} else {
  spawn -noecho ksh93 -c "ssh -o StrictHostKeyChecking=no $ID@$IP ksh93 -s < shell/remoteMatches.sh $Source \"$Pattern\" $End_Time $Start_Time $eKey $Dest $Dest_Location $ePass"
}

log_user 0

expect {
	"Password:" {
		if { $try == 1 } {
			send_user " Unable to login, invalid username or password\n"
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