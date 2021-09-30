#!/bin/bash

POLYGON_PSQL_ADDR="172.21.244.71"
HECO_PSQL_ADDR="172.21.244.72"
RINKEBY_PSQL_ADDR="172.21.244.73"
GOERLI_PSQL_ADDR="172.21.244.74"

DB_NAME="plasma"
DB_USERNAME="postgres"

CONTRACT_CONF="contract_address.json"
GOV_CONF="governance_address.json"
ACCEPTER_CONF="accepter_contract_address.json"

write_contract_conf() {
cat > "conf/$CONTRACT_CONF" <<EOF
{
	"rinkeby": "$rinkeby_contract_address",
	"matic_test": "$polygon_contract_address",
	"goerli": "$goerli_contract_address",
	"heco_test": "$heco_contract_address"
}
EOF
}

write_gov_conf() {
cat > "conf/$GOV_CONF" << EOF
{
	"rinkeby": "$rinkeby_gov_address",
	"matic_test": "$polygon_gov_address",
	"goerli": "$goerli_gov_address",
	"heco_test": "$heco_gov_address"
}
EOF
}

gen_conf() {
	polygon_address=`psql -h $POLYGON_PSQL_ADDR -d $DB_NAME -U $DB_USERNAME -A -t -c "select contract_addr,gov_contract_addr from server_config"`
	polygon_contract_address=`echo $polygon_address | awk -F "|" '{print $1}'`
	polygon_gov_address=`echo $polygon_address | awk -F "|" '{print $2}'`

	heco_address=`psql -h $HECO_PSQL_ADDR -d $DB_NAME -U $DB_USERNAME -A -t -c "select contract_addr,gov_contract_addr from server_config"`
	heco_contract_address=`echo $heco_address | awk -F "|" '{print $1}'`
	heco_gov_address=`echo $heco_address | awk -F "|" '{print $2}'`

	rinkeby_address=`psql -h $RINKEBY_PSQL_ADDR -d $DB_NAME -U $DB_USERNAME -A -t -c "select contract_addr,gov_contract_addr from server_config"`
	rinkeby_contract_address=`echo $rinkeby_address | awk -F "|" '{print $1}'`
	rinkeby_gov_address=`echo $rinkeby_address | awk -F "|" '{print $2}'`

	goerli_address=`psql -h $GOERLI_PSQL_ADDR -d $DB_NAME -U $DB_USERNAME -A -t -c "select contract_addr,gov_contract_addr from server_config"`
	goerli_contract_address=`echo $goerli_address | awk -F "|" '{print $1}'`
	goerli_gov_address=`echo $goerli_address | awk -F "|" '{print $2}'`

	write_contract_conf
	write_gov_conf
}

gen_accepter_conf() {
cat > "conf/$ACCEPTER_CONF" <<EOF
{
	"rinkeby": "$rinkeby_accepter",
	"matic_test": "$polygon_accepter",
	"goerli": "$goerli_accepter",
	"heco_test": "$heco_accepter"
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
	heco_accepter=`yarn broker deploy -c heco_test | xargs echo | awk -F " " '{print $11}'`
}

gen_conf $polygon_address $heco_address $rinkeby_address $goerli_address
echo $CONTRACT_CONF' and '$GOV_CONF' create successful!'
sleep 3

yarn install
echo "yarn install successful!"
sleep 3

yarn build
echo "yarn build successful!"
sleep 3

deploy_link
echo "link deploy successful!"
sleep 3

gen_accepter_conf
echo $ACCEPTER_CONF' create successful!'
sleep 3

bash approve.sh all
echo "approve successful!"

bash mint.sh all
echo "mint successful!"
