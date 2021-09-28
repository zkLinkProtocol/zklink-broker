import { configure, getLogger } from "log4js";
configure("./conf/log4js.conf.json");
export {
    getLogger
}