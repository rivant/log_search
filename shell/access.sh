#!/usr/bin/expect
set ID [lindex $argv 0]
set IP [lindex $argv 1]
set Source [lindex $argv 2]
set Pattern [lindex $argv 3]
set End_Time [lindex $argv 4]
set Start_Time [lindex $argv 5]
set tempKey [lindex $argv 6]
set Dest [lindex $argv 7]
set ePass [lindex $argv 8]
set Script shell/matches.sh
set timeout 3600
set dPass [exec echo $ePass | openssl enc -aes-128-cbc -a -d -pass pass:$env($tempKey)]
set try 0

spawn -noecho ksh93 -c "ssh -o StrictHostKeyChecking=no $ID@$IP ksh93 -s < $Script $Source $Pattern $End_Time $Start_Time $env($tempKey) ${Dest} $ePass"

log_user 0

expect {
	"Password:" {
		if { $try == 1 } {
			send_error " UnAble to login, invalid username or password\n"
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