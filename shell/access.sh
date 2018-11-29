#!/usr/bin/expect
set ID [lindex $argv 0]
set IP [lindex $argv 1]
set Remote [lindex $argv 2]
set Source [lindex $argv 3]
set Pattern [lindex $argv 4]
set End_Time [lindex $argv 5]
set Start_Time [lindex $argv 6]
set tempKey [lindex $argv 7]
set Dest [lindex $argv 8]
set ePass [lindex $argv 9]
set Script shell/matches.sh
set timeout 90
set dPass [exec echo $ePass | openssl enc -aes-128-cbc -a -d -pass pass:$env($tempKey)]
set try 0

spawn -noecho ksh93 -c "ssh -o StrictHostKeyChecking=no $ID@$IP ksh93 -s < $Script $ID $Remote $Source $Pattern $End_Time $Start_Time $env($tempKey) ${Dest} $ePass"

log_user 0

expect {
  "Password:" {
    if { $try == 1 } {
      send_error " Unable to login, invalid username or password\n"
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
