#!/bin/bash

if [ -z $1 ]; then
	echo "Params must be [ polygon | matic | heco | rinkeby | goerli | all ]"
	exit
fi

mint() {
	echo "Mint:"
	echo "Chain -> "$1" | Token id -> "$2
	yarn broker mint -c $1 -t $2
	echo "sleep 10s..."
	echo "-------------------------------------"
	sleep 10
}

polygon_mint() {
	for i in {1..6}
	do
		mint matic_test $i
	done
}

heco_mint() {
	for i in {1..7}
	do
		mint heco_test $i
	done
}

rinkeby_mint() {
	for i in {1..9}
	do
		mint rinkeby $i
	done
}

goerli_mint() {
	for i in {1..7}
	do
		mint goerli $i
	done
}

if [ $1 = "polygon" -o $1 = "matic" ]; then
	polygon_mint
elif [ $1 = "heco" ]; then
	heco_mint
elif [ $1 = "rinkeby" ]; then
	rinkeby_mint
elif [ $1 = "goerli" ]; then
	goerli_mint
elif [ $1 = "all" ]; then
	polygon_mint
	heco_mint
	rinkeby_mint
	goerli_mint
else
	echo "Params must be [ polygon | matic | heco | rinkeby | goerli | all ]"
fi

