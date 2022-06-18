#!/bin/bash

PSQL_ADDR="pgm-8vb0ps1su256826461630.pgsql.zhangbei.rds.aliyuncs.com"
DATABASE="postgres://zklink:qocpRmmxukAlJOe8CgY@pgm-8vb0ps1su256826461630.pgsql.zhangbei.rds.aliyuncs.com/plasma004"
DB_NAME="plasma004"
DB_USERNAME="zklink"
SQL="psql $DATABASE"
CONTRACT_CONF="contract_address.json"
GOV_CONF="governance_address.json"
ACCEPTER_CONF="accepter_contract_address.json"
PRY_CONF="periphery_address.json"
write_conf() {
        conf_type=$1
        eval file_name=\$${conf_type^^}_CONF
        eval r_addr=\$rinkeby_${conf_type}_address
        eval p_addr=\$polygon_${conf_type}_address
        eval g_addr=\$goerli_${conf_type}_address
        eval a_addr=\$avax_${conf_type}_address
        echo $file_name $r_addr $p_addr $g_addr $a_addr
        #echo "123" > $filename
cat > "conf/${file_name}" <<EOF
{
        "rinkeby": "$r_addr",
        "matic_test": "$p_addr",
        "goerli": "$g_addr",
        "avax_test": "$a_addr"
}
EOF
}

network_by_chainid() {
    case $1 in
        "1")
            echo "polygon"
            ;;
        "2")
            echo "avax"
            ;;
        "3")
            echo "rinkeby"
            ;;
        "4")
            echo "goerli"
            ;;
        "*")
            echo "unknown"
            ;;
    esac
}
gen_conf() {
        contract_config=`${SQL} -A -t -c "select contract_addr,chain_id from server_config order by chain_id asc"`
        echo $contract_config
        for conf in $contract_config
        do
            chain_id=`echo $conf|awk -F'|' '{print $2}'`
            ct_addr=`echo $conf|awk -F'|' '{print $1}'`
            echo $chain_id
            net=`network_by_chainid $chain_id`
            eval ${net}"_contract_address"=$ct_addr
	    #log_file_name=`find $ZKSYNC_HOME/zklink-contracts/log/ -name "*${net^^}*"`
	    #echo $log_file_name
	    #if [ "$log_file_name" != "" ];then
	    #    periphery_addr=`cat $log_file_name|awk -F"[,:]" '{for(i=1;i<=NF;i++){if($i~'/peripheryProxyAddr/'){print $(i+1);}}}'|sed -e 's/[\",}]//g'`
            #    eval ${net}"_pry_address"=$periphery_addr
	    #fi
        done
	write_conf "contract"
}


deploy_link() {
	echo "Deploy Rinkeby Link..."
	rinkeby_accepter_address=`yarn broker deploy -c rinkeby | xargs echo | awk -F " " '{print $11}'`
	echo "Deploy Polygon Link..."
	polygon_accepter_address=`yarn broker deploy -c matic_test | xargs echo | awk -F " " '{print $11}'`
	echo "Deploy Goerli Link..."
	goerli_accepter_address=`yarn broker deploy -c goerli | xargs echo | awk -F " " '{print $11}'`
	echo "Deploy Heco Link..."
	avax_accepter_address=`yarn broker deploy -c avax_test | xargs echo | awk -F " " '{print $11}'`
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

#write_conf "accepter"
#echo $ACCEPTER_CONF' create successful!'
#sleep 3

source action.sh all approve
echo "approve successful!"

#bash action.sh all mint
#echo "mint successful!"
