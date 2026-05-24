import { useEffect, useState } from "react";
import { Cpu, Database, DatabaseBackup, MemoryStick } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { TypographyH4, TypographyP } from "@/components/Typography/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  vCPU: number;
  memory: number;
  storage: number;
  backups: number;
  validity_days: number;
}

export default function Pricing() {
  // stores plans
  const [plans, setPlans] = useState([]);

  const getPlans = async () => {
    // fetch available plans
    const response = await (await fetch("/api/v1/plans")).json();
    setPlans(response.data); // set plans returend by API call
  };

  const purchasePlan = async (planId: number) => {
    // API call to purchase plan
    const response = await (
      await fetch(`/api/v1/plans/${planId}/purchase`, {
        method: "POST",
      })
    ).json();

    // sends response
    toast(response.message);
  };

  useEffect(() => {
    getPlans();
  }, []);

  return (
    <>
      <main className="bg-background py-16">
        <div className="container p-4 m-auto">
          <div className="flex items-center justify-center flex-col gap-5">
            <h3 className="text-4xl text-center md:text-6xl font-semibold text-foreground"> Plans and Pricing </h3>
            <p className="leading-7 sm:w-1/2 lg:w-1/3 text-center text-foreground">
              Choose plan according to work specific requirement we provide wide range of affordable plans.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 md:gap-4 lg:max-w-5xl lg:grid-cols-3 lg:gap-6 m-auto">
            {plans?.map((plan: Plan) => (
              <Card key={plan.id} className="py-6 px-2 mt-8 md:mt-11">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <TypographyH4>{plan.name}</TypographyH4>
                    {plan.name === "KVM 2" && <Badge>Popular</Badge>}
                  </div>
                  <p className="my-2 text-muted-foreground text-base">{plan.description}</p>
                  <span className="flex items-center  mt-4 mb-2">
                    <span className="text-3xl font-semibold">₹ {plan.price}</span>
                    <TypographyP className="[&:not(:first-child)]:my-0 self-end pl-1 text-muted-foreground">
                      /month
                    </TypographyP>
                  </span>
                  <Button
                    className={"w-full my-4 py-5 font-semibold"}
                    variant={plan.name === "KVM 2" ? "default" : "secondary"}
                    size={"lg"}
                    onClick={() => {
                      purchasePlan(plan.id);
                    }}
                  >
                    Purchase Plan
                  </Button>

                  <span className="font-medium mb-4 block">What you'll get in {plan.name}:</span>

                  <div className="space-y-2">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Cpu />
                      <span className="text-foreground">
                        <span className="font-bold">{plan.vCPU}</span> vCPU cores
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <MemoryStick />
                      <span className="text-foreground">
                        {" "}
                        <span className="font-bold">{plan.memory} GiB</span> RAM
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Database />
                      <span className="text-foreground">
                        {" "}
                        <span className="font-bold">{plan.storage} GiB</span> disk space
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <DatabaseBackup />
                      <span className="text-foreground">
                        {" "}
                        <span className="font-bold">{plan.backups}</span> backups
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <TypographyP className="text-center text-destructive">
            Note:- Backups are currently in development phase and have not been implemented yet.
          </TypographyP>
        </div>
      </main>
    </>
  );
}
