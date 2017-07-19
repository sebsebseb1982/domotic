#!/bin/bash
sshpass -p $3 ssh  $1@$2 "/usr/sbin/wl -a eth1 radio $4;"
exit
