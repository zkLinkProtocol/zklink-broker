#!/bin/bash

if [ -z $1 ]; then
	echo "Params must be [ polygon | matic | avax | rinkeby | goerli | all ]"
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
	for i in {3..4}
	do
		approve matic_test $i
	done
}

avax_approve() {
	for i in {1..3}
	do
		approve avax_test $i
	done
}

rinkeby_approve() {
	for i in {1..3}
	do
		approve rinkeby $i
	done
}

goerli_approve() {
	for i in {4..5}
	do
		approve goerli $i
	done
}

if [ $1 = "polygon" -o $1 = "matic" ]; then
	polygon_approve
elif [ $1 = "avax" ]; then
	avax_approve
elif [ $1 = "rinkeby" ]; then
	rinkeby_approve
elif [ $1 = "goerli" ]; then
	goerli_approve
elif [ $1 = "all" ]; then
	polygon_approve
	avax_approve
	rinkeby_approve
	goerli_approve
else
	echo "Params must be [ polygon | matic | avax | rinkeby | goerli | all ]"
fi

