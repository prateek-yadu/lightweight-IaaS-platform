import { Request, Response } from "express";

type OverallHealth = "Stable" | "Critical" | undefined;
type ServiceHealth = "OK" | "DOWN";

const checkServerStatus: () => Promise<ServiceHealth> = async () => {
  try {
    const lxdResponse = await fetch(`${process.env.LXD_SERVER}/1.0`);

    if (lxdResponse.status === 200) {
      return "OK";
    } else {
      // server might be up but, can not perform operations via API
      return "DOWN";
    }
  } catch (error) {
    // if fetch fails we assume server is down
    return "DOWN";
  }
};

export const shallowHealth = async (req: Request, res: Response) => {
  try {
    const serverHealth: ServiceHealth = await checkServerStatus();

    let overAllhealth: OverallHealth;

    switch (serverHealth) {
      case "OK":
        overAllhealth = "Stable";
        break;
      case "DOWN":
        overAllhealth = "Critical";
        break;
    }

    const health = {
      health: overAllhealth,
      uptime: process.uptime(), // sends uptime in seconds
      lastCheck: Date.now(),
    };
    res.json(health);
  } catch (error) {
    // assumes server is down
    const health = {
      health: "Critical",
      services: {
        lxd_agent: "OK",
        lxd_server: "DOWN",
      },
      lastCheck: Date.now(),
    };

    res.json(health);
  }
};

export const deepHealth = async (req: Request, res: Response) => {
  try {
    let serverHealth: ServiceHealth = await checkServerStatus();

    let overAllhealth: OverallHealth;

    switch (serverHealth) {
      case "OK":
        overAllhealth = "Stable";
        break;
      case "DOWN":
        overAllhealth = "Critical";
        break;
    }

    const health = {
      health: overAllhealth,
      services: {
        lxd_agent: "OK",
        lxd_server: serverHealth,
      },
      lastCheck: Date.now(),
    };

    res.json(health);
  } catch (error) {
    const health = {
      health: "Critical",
      services: {
        lxd_agent: "OK",
        lxd_server: "DOWN",
      },
      lastCheck: Date.now(),
    };

    res.json(health);
  }
};
