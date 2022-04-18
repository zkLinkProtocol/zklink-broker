#!/bin/bash

PSQL_ADDR="pgm-8vb0ps1su256826461630.pgsql.zhangbei.rds.aliyuncs.com"

DB_NAME="plasma_test"
DB_USERNAME="zklink"

CONTRACT_CONF="contract_address.json"
GOV_CONF="governance_address.json"
ACCEPTER_CONF="accepter_contract_address.json"

write_contract_conf() {
cat > "conf/$CONTRACT_CONF" <<EOF
{
	"rinkeby": "$rinkeby_contract_address",
	"matic_test": "$polygon_contract_address",
	"goerli": "$goerli_contract_address",
	"avax_test": "$avax_contract_address"
}
EOF
}

write_gov_conf() {
cat > "conf/$GOV_CONF" << EOF
{
	"rinkeby": "$rinkeby_gov_address",
	"matic_test": "$polygon_gov_address",
	"goerli": "$goerli_gov_address",
	"avax_test": "$avax_gov_address"
}
EOF
}
network_by_chainid() {
    case $1 in
        "1")
            echo "polygon"
            ;;
        "4")
            echo "avax"
            ;;
        "3")
            echo "rinekby"
            ;;
        "2")
            echo "goerli"
            ;;
        "*")
            echo "unknown"
            ;;
    esac
}
gen_conf() {
        contract_config=`PGPASSWORD=qocpRmmxukAlJOe8CgY psql -h $PSQL_ADDR -d $DB_NAME -U $DB_USERNAME -A -t -c "select contract_addr,gov_contract_addr,chain_id from server_config order by chain_id asc"`
        echo $contract_config
        for conf in $contract_config
        do
            chain_id=`echo $conf|awk -F'|' '{print $3}'`
            gov_addr=`echo $conf|awk -F'|' '{print $2}'`
            ct_addr=`echo $conf|awk -F'|' '{print $1}'`
            echo $chain_id
            net=`network_by_chainid $chain_id`
            eval ${net}"_contract_address"=$ct_addr
            eval ${net}"_gov_address"=$gov_addr
        done
	write_contract_conf
	write_gov_conf
}

gen_accepter_conf() {
cat > "conf/$ACCEPTER_CONF" <<EOF
{
	"rinkeby": "$rinkeby_accepter",
	"matic_test": "$polygon_accepter",
	"goerli": "$goerli_accepter",
	"avax_test": "$avax_accepter"
}
EOF
}

deploy_link() {
	echo "Deploy Rinkeby Link..."
	rinkeby_accepter=`yarn broker deploy -c rinkeby | xargs echo | awk -F " " '{print $11}'`
	echo "Deploy Polygon Link..."
	polygon_accepter=`yarn broker deploy -c matic_test | xargs echo | awk -F " " '{print $11}'`
	echo "Deploy Goerli Link..."
	goerli_accepter=`yarn broker deploy -c goerli | xargs echo | awk -F " " '{print $11}'`
	echo "Deploy Heco Link..."
	avax_accepter=`yarn broker deploy -c avax_test | xargs echo | awk -F " " '{print $11}'`
}

gen_conf
echo $CONTRACT_CONF' and '$GOV_CONF' create successful!'
sleep 3

yarn install
echo "yarn install successful!"
sleep 3

yarn build
echo "yarn build successful!"
sleep 3

#deploy_link
#echo "link deploy successful!"
#sleep 3

#gen_accepter_conf
#echo $ACCEPTER_CONF' create successful!'
#sleep 3

bash approve.sh all
echo "approve successful!"

#bash mint.sh all
#echo "mint successful!"
