#!/bin/bash

if [ -z $1 ]; then
	echo "Params must be [ polygon | matic | heco | rinkeby | goerli | all ]"
	exit
fi

approve() {
	echo "Approve:"
	echo "Chain -> "$1" | Token id -> "$2
	yarn broker approve -c $1 -t $2 -p ./keys/
	echo "sleep 10s..."
	echo "-------------------------------------"
	sleep 10
}

polygon_approve() {
	for i in {1..6}
	do
		approve matic_test $i
	done
}

heco_approve() {
	for i in {1..7}
	do
		approve heco_test $i
	done
}

rinkeby_approve() {
	for i in {1..9}
	do
		approve rinkeby $i
	done
}

goerli_approve() {
	for i in {1..7}
	do
		approve goerli $i
	done
}

if [ $1 = "polygon" -o $1 = "matic" ]; then
	polygon_approve
elif [ $1 = "heco" ]; then
	heco_approve
elif [ $1 = "rinkeby" ]; then
	rinkeby_approve
elif [ $1 = "goerli" ]; then
	goerli_approve
elif [ $1 = "all" ]; then
	polygon_approve
	heco_approve
	rinkeby_approve
	goerli_approve
else
	echo "Params must be [ polygon | matic | heco | rinkeby | goerli | all ]"
fi

