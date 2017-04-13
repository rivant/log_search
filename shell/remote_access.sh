#!/usr/bin/expect
set ID [lindex $argv 0]
set IP [lindex $argv 1]
set PW [lindex $argv 2]
set Source [lindex $argv 3]
set Pattern [lindex $argv 4]
set End_Time [lindex $argv 5]
set Start_Time [lindex $argv 6]
set Dest [lindex $argv 7]
set Script ./remote_matches.sh

spawn ksh -c "ssh -o StrictHostKeyChecking=no $ID@$IP ksh -s < $Script $Source $Pattern $End_Time $Start_Time $PW $Dest"

expect "eDir Password:"
send "$PW\r"

expect eof
