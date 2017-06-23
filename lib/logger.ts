export function dump(message) {
    if (process.env.NODE_ENV === "test") {
        console.log(`[Dump] ${message}`);
    }
}

export function info(message) {
    console.log(`[Info] ${message}`);
}

export function warn(message) {
    console.warn(`[Warn] ${message}`);
}

export function error(message) {
    console.error(`[Error] ${message}`);
}
