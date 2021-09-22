import { configure, getLogger } from "log4js";
configure("./log4js.conf.json");
export {
    getLogger
}