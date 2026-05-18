import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

interface log {
    timestamp?: number;
    type: "success" | "error" | "info",
    message: string,
    vmId?: string,
    userId?: string;
    ip: string | undefined;
    route: string;
}

interface workerLog {
    timestamp?: number;
    type: "success" | "error" | "info" ,
    message: string,
    error?: string
}

export const logger = {
    async log(filename: "auth" | "billing" | "instance" | "profile", log: log) {

        try {
            const __filename = fileURLToPath(import.meta.url)
            const __dirname = dirname(__filename)

            const outDir = path.join(__dirname, "..", "..", "logs", "backend")
            
            log.timestamp = Date.now();
    
            // creates logs folder if dir does not exists
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir);
            }
    
            fs.appendFile(`${outDir}/${filename}.log`, JSON.stringify(log) + "\n", err => { });
        } catch (error) {
            console.log(error)
        }


    }, worker: {
        async log(worker: "event" | "expiry" | "lifecycle" | "provision" | "sync", log: workerLog){
            try {
                const __filename = fileURLToPath(import.meta.url)
                const __dirname = dirname(__filename)

                const outDir = path.join(__dirname, "..", "..", "logs", "workers", worker)

                log.timestamp = Date.now();

                if(!fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir, {
                        recursive: true
                    })
                }

                fs.appendFile(`${outDir}/${worker}.worker.log`, JSON.stringify(log) + "\n", (err:any) =>{
                    if(err){
                        throw new Error(err)
                    }
                })
            }catch (error: any){
                throw new Error("ERROR: Failed to wite log reason: ", error)
            }
        }
    }
};