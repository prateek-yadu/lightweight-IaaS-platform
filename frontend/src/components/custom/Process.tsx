import { Bolt, CreditCard, PackageOpen, Server } from "lucide-react";
import Branding from "../../branding.json";
import { useState } from "react";

export default function Process() {
  const appName = Branding.AppName; // gets app name from @/src/branding.json

  const processSetps = [
    {
      title: "Create",
      icon: PackageOpen,
      description: `Create server with ${appName} in one click.`,
      img: "/images/process/create-vps.png",
    },
    {
      title: "Manage",
      icon: Bolt,
      description: `Manage your servers easily with our clean, easy to use dashobard.`,
      img: "/images/process/manage-vps.png",
    },
    {
      title: "Manage Plans",
      icon: CreditCard,
      description: `Purchase and manage plans from dashboard`,
      img: "/images/process/manage-plans.png",
    },
    {
      title: "Scale",
      icon: Server,
      description: `${appName} helps you to scale servers easily with low costs.`,
      img: "/images/process/dashboard.png",
    },
  ];

  const [currentImg, setCurrentImg] = useState(processSetps[0].img);
  const [activeProcess, setActiveProcess] = useState(processSetps[0].title);

  return (
    <section className="py-[80px] lg:pb-[200px]">
      <div className="container px-4 m-auto">
        <h2 className="flex flex-col items-start text-3xl font-bold md:text-4xl lg:text-[49px] pb-4 dark:text-primary-foreground">
          <span>Deploy on servers</span> that's trully your own.
        </h2>
        <p className="text-muted-foreground font-medium text-base md:text-lg lg:text-[22px] sm:pr-20 md:pr-40 lg:pr-80 xl:pr-[640px] 2xl:pr-[800px]">
          Deploy your applications on {appName} for low latency and high performance with cutting edge technologies.
        </p>

        <div className="ring-1 ring-border rounded-[20px] mt-10 lg:mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-6 xl:gap-8 gap-y-6 p-6">
            {processSetps.map((item) => (
              <div
                className={`flex flex-col items-start gap-y-2 hover:bg-muted hover:dark:bg-muted/40 p-6 rounded-lg cursor-pointer ${activeProcess === item.title && "bg-muted dark:bg-muted/40"}`}
                key={item.title}
                onClick={() => {
                  setCurrentImg(item.img);
                  setActiveProcess(item.title);
                }}
              >
                <div className="flex items-center text-foreground dark:text-primary-foreground  gap-x-1">
                  <span className="">
                    <item.icon />
                  </span>
                  <span className="text-[18px] font-semibold">{item.title}</span>
                </div>
                <span className="text-muted-foreground font-medium">{item.description}</span>
              </div>
            ))}
          </div>
          <img src={currentImg} alt="process image" className="h-[400px] md:h-[750px] rounded-b-2xl object-contain lg:object-fill" />
        </div>
      </div>
    </section>
  );
}
