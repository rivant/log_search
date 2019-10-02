export PATH=$PATH:~/SCRIPTS/node-v8.11.3-aix-ppc64/bin
export LD_LIBRARY_PATH=~/SCRIPTS/node-v8.11.3-aix-ppc64/lib/gcc/4.8.5/ppc64

#npm install
./node_modules/forever/bin/forever start --minUptime 1000 --spinSleepTime 1000 ./bin/www 1> /dev/null 2> err.out