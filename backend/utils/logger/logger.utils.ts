import fs from 'fs';

interface log {
    timestamp?: number;
    type: "success" | "error" | "info",
    message: string,
    vmId?: string,
    userId?: string;
    ip: string | undefined;
    route: string;

}

export const logger = {
    async log(filename: "auth" | "billing" | "instance", log: log) {

        log.timestamp = Date.now();

        // creates logs folder if dir does not exists
        if (!fs.existsSync("./logs")) {
            fs.mkdirSync("./logs");
        }

        fs.appendFile(`./logs/${filename}.log`, JSON.stringify(log) + "\n", err => { });

    }
};