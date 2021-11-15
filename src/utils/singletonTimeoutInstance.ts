
export default (initial, timeout: number = 0, timeoutEvent?) => {
    let timeoutHandle = null;
    let obj = null;
    let signal = false;

    return {
        regist: async (cb) => {
            if (!signal) {
                obj = await initial(obj);
                signal = true;
            }

            if (timeout > 0 && timeoutEvent) {
                signal = false;
                timeoutHandle &&
                    clearTimeout(timeoutHandle);
                timeoutHandle = setTimeout(async () => {
                    obj = await timeoutEvent(obj);
                }, timeout);
            }

            return await cb(obj);
        },
        get: () => obj,
        status: () => signal
    }
}
