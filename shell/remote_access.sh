#!/usr/bin/expect
set ID [lindex $argv 0]
set IP [lindex $argv 1]
set Source [lindex $argv 2]
set Pattern [lindex $argv 3]
set End_Time [lindex $argv 4]
set Start_Time [lindex $argv 5]
set tempTitle [lindex $argv 6]
set Dest [lindex $argv 7]
set Script shell/remote_matches.sh
set timeout 90

spawn -noecho ksh93 -c "ssh -o StrictHostKeyChecking=no $ID@$IP ksh93 -s < $Script $Source $Pattern $End_Time $Start_Time $env($tempTitle) $Dest"

log_user 0
expect "eDir Password:"
send "$env($tempTitle)\r"
log_user 1

expect eof
