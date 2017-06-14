#!/usr/bin/expect
set ID [lindex $argv 0]
set IP [lindex $argv 1]
set PW [lindex $argv 2]
set SD [lindex $argv 3]
set timeout 60

spawn -noecho ksh -c "scp -o StrictHostKeyChecking=no $ID@$IP:~/transfer_temp/*$SD* files"

log_user 0
expect "eDir Password:"
send "$PW\r"
log_user 1

expect eof
