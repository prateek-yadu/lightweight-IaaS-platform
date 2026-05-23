import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { UserPlan } from "@/interface/UserPlan";
import type { VM } from "@/interface/VM";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CopyIcon, Dot, LucideLoader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

export default function Dashboard() {
  const [plans, setPlans] = useState<UserPlan[]>([]); // stores user plan info
  const [vms, setVMs] = useState<VM[]>([]); // stores vms info

  // get plans
  const getPlans = async () => {
    const response = await (await (await fetch("/api/v1/profile/me/plans")).json()).data;
    if (response?.length > 0) {
      setPlans(response); // sets user plan
    }
  };

  const usedPlans = () => {
    const inUsePlans = plans?.filter((plan) => plan.in_use === 1);
    return inUsePlans.length != 0 ? String(inUsePlans.length) : "0";
  };

  const runningVPS = () => {
    const vpsRunning = vms?.filter((vm) => vm.status === "running");
    return vpsRunning.length != 0 ? String(vpsRunning.length) : "0";
  };
  // gets user's VMs info
  const getVMs = async () => {
    const response = await (await (await fetch("/api/v1/vms")).json()).data;
    if (response) {
      setVMs(response); // stores VMs info
    }
  };

  // beautify VM status
  const setVMStatus = (status: string) => {
    switch (status) {
      case "provisioning":
        return (
          <div className="flex items-center gap-3 justify-center">
            <LucideLoader2 className="size-4 animate-spin" />
            Provisioning
          </div>
        );
      case "starting":
        return (
          <div className="flex items-center gap-3 justify-center">
            <LucideLoader2 className="size-4 animate-spin" />
            Starting
          </div>
        );
      case "running":
        return (
          <div className="flex items-center justify-center">
            <Dot className="size-10 text-emerald-500" />
            Running
          </div>
        );
      case "restarting":
        return (
          <div className="flex items-center gap-3 justify-center">
            <LucideLoader2 className="size-4 animate-spin" />
            Restarting
          </div>
        );
      case "stopped":
        return (
          <div className="flex items-center justify-center">
            <Dot className="size-10 text-destructive" />
            Stopped
          </div>
        );
      case "stopping":
        return (
          <div className="flex items-center gap-3 justify-center">
            <LucideLoader2 className="size-4 animate-spin" />
            Stopping
          </div>
        );
      case "deleting":
        return (
          <div className="flex items-center gap-3 justify-center">
            <LucideLoader2 className="size-4 animate-spin" />
            Deleting
          </div>
        );
      default:
        return <>STATUS UNKNOWN</>;
    }
  };

  useEffect(() => {
    getVMs();
    getPlans();
  }, []);

  return (
    <>
      <DashboardHeader title="Overview" />

      <DashboardCards
        TotalVPS={String(vms.length != 0 ? vms.length : "0")}
        TotalSubscriptions={String(plans.length != 0 ? plans.length : "0")}
        InUseSubscriptions={usedPlans()}
        TotalRunningVPS={runningVPS()}
      />

      {vms?.length === 0 ? (
        <Empty className="py-48 border my-8">
          <EmptyHeader>
            <EmptyTitle>No VPS Found.</EmptyTitle>
            <EmptyDescription>
              We could not find any VPS linked with your accound. Would you like to create one?
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button>
              {" "}
              <Link to={"/dashboard/vps"}>Create VPS</Link>
            </Button>
            <Button variant={"outline"}>
              <Link to={"/pricing"}>Purchase Plan</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <Table className="my-8">
          <TableCaption>List of all VPS</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">Server Details</TableHead>
              <TableHead className="text-start">Description</TableHead>
              <TableHead className="text-center">IP</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vms?.map((vm) => (
              <TableRow key={vm.id} className="h-[60px]">
                <TableCell className="flex items-center gap-2 text-base h-[60px]">
                  {" "}
                  <span>
                    <img src="/images/os/ubuntu.png" alt="" className="size-4" />
                  </span>{" "}
                  {vm.name}
                </TableCell>
                <TableCell className="text-start">{vm.description ? vm.description : "-"}</TableCell>
                <TableCell className="flex items-center justify-center gap-2">
                  {vm.ip}{" "}
                  <CopyIcon
                    className="size-4 text-muted-foreground hover:text-accent-foreground cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(vm.ip);
                      toast.success("IP Coppied");
                    }}
                  />
                </TableCell>
                <TableCell className="text-center min-w-[296px]">{setVMStatus(vm.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
