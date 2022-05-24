#!/bin/bash

if [ -z $1 ]; then
	echo "Params must be [ polygon | matic | avax | rinkeby | goerli | all ]"
	exit
fi
SQL="psql $DATABASE_URL"
NETWORKS=`grep "const testnet_network_map" src/conf.ts|grep -v "\/\/"|awk -F'=' '{print $2}'|sed -e 's/ \|\"\|\[\|\]//g'`
CHAINS_COUNT=`echo $NETWORKS|awk -F',' '{print NF}'`
action() {
	echo "${1}:"
	echo "Chain -> "$2" | Token id -> "$3
	keys_option="-p ./keys"
	if [ "$1" == "mint" ];then
		keys_option=""
	fi
	eval yarn broker $1 -c $2 -t $3 $keys_option
	echo "sleep 10s..."
	echo "-------------------------------------"
	sleep 10
}

chain_action() {
    chain_id=`echo $NETWORKS|awk -F',' '{for(i=1;i<=NF;i++){if($i=="'$2'"){print i}}}'`
    tokens=`${SQL} -A -t -c "select id from (select id as id,json_array_elements_text(chains::json) as chain_id from tokens where id < 128 and id > ${CHAINS_COUNT}) as tokens_chains where chain_id = '$chain_id';"`
    for token in $tokens
    do
	action $1 $2 $token
    done
}
actions="approve mint list"
if [[ "$actions" =~ "$2" ]];then
    echo "action type: $2"
else
    echo "action must be [approve | mint | list]"
    exit
fi
networks="avax,goerli,matic,rinkeby,all"
if [[ "$networks" =~ "$1" ]];then
    echo "start deploy $1"
else
    echo "network must be one of ${networks}]"
    exit
fi

chain_id=`echo $NETWORKS|awk -F',' '{for(i=1;i<=NF;i++){if($i=="'${net_conf}'"){print i}}}'`
if [ $1 = "polygon" -o $1 = "matic" -o $1 = "all" ]; then
	chain_action $2 "matic_test"
fi
if [ $1 = "avax" -o $1 = "all" ]; then
	chain_action $2 "avax_test"
fi
if [ $1 = "rinkeby" -o $1 = "all" ]; then
	chain_action $2 "rinkeby"
fi
if [ $1 = "goerli" -o $1 = "all" ]; then
	chain_action $2 "goerli"
fi
#else
#	echo "Params must be [ polygon | matic | avax | rinkeby | goerli | all ]"
#	exit
#fi
