import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
interface log {
    timestamp?: number;
    type: "success" | "error" | "info",
    message: string,
    vmId?: string,
    ip: string | undefined;
    route: string;
}

export const logger = {
  async log(log: log) {
    try {
      const filename = "lxd_agent";
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);

      const outDir = path.join(__dirname, "..", "..", "logs", filename);

      log.timestamp = Date.now();

      // creates logs folder if dir does not exists
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, {
          recursive: true,
        });
      }

      fs.appendFile(
        `${outDir}/${filename}.log`,
        JSON.stringify(log) + "\n",
        (err: any) => {
          if (err) {
            throw new Error(err);
          }
        },
      );
    } catch (error: any) {
      throw new Error("ERROR: Failed to wite log reason: ", error);
    }
  },
};
