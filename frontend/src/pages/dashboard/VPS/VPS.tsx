import { CopyIcon, Dot, LucideLoader2, MoreHorizontalIcon, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { socket } from "../../../socket";
import type { UserPlan } from "../../../interface/UserPlan";
import type { VM } from "../../../interface/VM";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router";

export default function VPS() {
  const [refresh, setRefresh] = useState<any>();

  // form data
  const [vmName, setVMName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<null | string>(null);

  const [plans, setPlans] = useState<UserPlan[]>([]); // stores user plan info

  const [vms, setVMs] = useState<VM[]>([]); // stores vms info

  const VPSRegion = "in-north-1 (India, Chhattisgarh)"; // VPS region location static for now
  const VPSOS = "Ubuntu 24.04 LTS"; // VPS OS static for now

  // get plans
  const getPlans = async () => {
    const response = await (await (await fetch("/api/v1/profile/me/plans?is_expired=false&in_use=false")).json()).data;
    if (response?.length > 0) {
      setPlans(response); // sets user plan
    }
  };

  // gets user's VMs info
  const getVMs = async () => {
    const response = await (await (await fetch("/api/v1/vms")).json()).data;
    if (response) {
      setVMs(response); // stores VMs info
    }
  };

  // create VM request
  const createVM = async () => {
    if (selectedPlan === "No Plan Selected") {
      toast.error("Please select a plan");
    }

    const response = await (
      await fetch("/api/v1/vms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vmName: vmName,
          vmDescription: description,
          rootPassword: password,
          planId: selectedPlan,
        }),
      })
    ).json();

    // clears vm name, description, password, plan
    setVMName("");
    setDescription("");
    setPassword("");
    setSelectedPlan(null);

    setPlans((prev) => prev.map((plan) => (plan.id == selectedPlan ? { ...plan, in_use: 1 } : plan)));

    toast(response.message);

    setOpen(!open);
    setRefresh(Math.random());
  };

  // update VM state (start, stop, restart)
  const updateVMState = async (name: string, state: string) => {
    const response = await (
      await fetch(`/api/v1/vms/${name}/${state}`, {
        method: "PUT",
      })
    ).json();

    if (response.status === 200) {
      switch (state) {
        case "start":
          setVMs((prev) => {
            return prev.map((item) => (item.name === name ? { ...item, status: "starting" } : item));
          });
          break;
        case "stop":
          setVMs((prev) => {
            return prev.map((item) => (item.name === name ? { ...item, status: "stopping" } : item));
          });
          break;
        case "restart":
          setVMs((prev) => {
            return prev.map((item) => (item.name === name ? { ...item, status: "restarting" } : item));
          });
          break;

        default:
          break;
      }
    } else {
      toast.info(response.message);
    }
  };

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // deletes VM
  const deleteVM = async (name: string) => {
    const response = await (
      await fetch(`/api/v1/vms/${name}`, {
        method: "DELETE",
      })
    ).json();

    if (response.status === 200) {
      setVMs((prev) => {
        return prev.map((item) => (item.name === name ? { ...item, status: "deleting" } : item));
      });
      // waits for 1000ms
      await sleep(5000);
      setRefresh(Math.random());
    } else {
      toast.error(response.message);
    }
  };

  // handles sheet state
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () =>
      plans
        ?.filter((item) => item.in_use != 1)
        .map((plan) => ({
          label: `${plan.name} (${plan.vCPU} vCPU, ${plan.memory} GiB Memory, ${plan.storage} GiB Storage)`,
          value: String(plan.id),
        })),
    [plans],
  );

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
  }, [refresh]);

  useEffect(() => {
    const onConnect = () => {
      console.log("socket connection established");
    };

    const onDisconnect = () => {
      console.log("socket connection closed");
    };

    const onInstanceLifecycleEvents = (msg: string) => {
      const data = JSON.parse(msg);
      let state: string;
      switch (data.operation) {
        case "instance-created":
          state = "provisioning";
          break;

        case "instance-started":
        case "instance-restarted":
          state = "running";
          break;

        case "instance-shutdown":
        case "instance-stopped":
          state = "stopped";
          break;
        case "instance-deleted":
          state = "deleted";
          break;
        default:
          state = "UNKNOWN";
      }

      if (state !== "deleted") {
        setVMs((prev) => {
          return prev.map((vm: VM) => (vm.id === data.instance ? { ...vm, status: state } : vm));
        });
      } else {
        // remove instance from list

        setVMs((prev) => {
          return prev.filter((instance) => instance.id !== data.instance);
        });
        toast.success("VM Deleted");
      }
    };

    // establish socket connection
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("instance:lifecycle:events", onInstanceLifecycleEvents);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("instance:lifecycle:events", onInstanceLifecycleEvents);
    };
  }, []);

  return (
    <>
      {/* Header */}
      <DashboardHeader
        title="VPS - Overview"
        action={
          <Button
            className={"p-5"}
            variant={"default"}
            onClick={() => {
              setOpen(!open);
            }}
          >
            {" "}
            <Plus className="size-5 hidden lg:flex" /> Create VM{" "}
          </Button>
        }
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className={"min-w-full lg:min-w-3xl"}>
          <SheetHeader>
            <SheetTitle className={"mb-6"}>Create VPS</SheetTitle>
            <div className="flex flex-col gap-y-6">
              {/* VM Name */}
              <div className="grid gap-3 lg:grid-cols-2 grid-cols-1">
                <Label htmlFor="vpsname">Name</Label>
                <Input
                  id="vpsname"
                  placeholder="cache.tld"
                  value={vmName}
                  onChange={(e) => {
                    setVMName(e.target.value);
                  }}
                />
              </div>

              {/* VM Description */}
              <div className="grid gap-3 lg:grid-cols-2 grid-cols-1">
                <Label htmlFor="desc">
                  Description <Badge variant={"secondary"}>optional</Badge>{" "}
                </Label>
                <Textarea
                  id="desc"
                  className="max-h-24 min-h-24"
                  placeholder="cache server (prod)"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                />
              </div>

              {/* VM Root Password */}
              <div className="grid gap-3 lg:grid-cols-2 grid-cols-1">
                <Label htmlFor="rpasswd">Root Password</Label>
                <Input
                  id="rpasswd"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </div>

              {/* VM OS */}
              <div className="grid gap-3 lg:grid-cols-2 grid-cols-1">
                <Label htmlFor="os">Operating System</Label>
                <Input id="os" defaultValue="Pedro Duarte" value={VPSOS} disabled={true} />
              </div>

              {/* VM Region */}
              <div className="grid gap-3 lg:grid-cols-2 grid-cols-1">
                <Label htmlFor="region">Region</Label>
                <Input id="region" defaultValue="Pedro Duarte" value={VPSRegion} disabled={true} />
              </div>

              {/* Plan selector */}
              <div className="grid gap-3 lg:grid-cols-2 grid-cols-1">
                <Label htmlFor="plans">Plan</Label>
                <Select
                  items={items}
                  onValueChange={(e) => {
                    setSelectedPlan(e);
                  }}
                  value={selectedPlan ? selectedPlan : "No Plan Selected"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Plan" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Plans</SelectLabel>

                      {items?.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetHeader>
          <SheetFooter className="flex flex-row-reverse">
            <Button
              type="button"
              className={"p-4"}
              onClick={() => {
                createVM();
              }}
            >
              Create VPS
            </Button>
            <SheetClose className={"p-4"} render={<Button variant="outline">Close</Button>} />
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {vms?.length !== 0 ? (
        <Table className="">
          <TableCaption>List of all VPS</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">Server Details</TableHead>
              <TableHead className="text-start">Description</TableHead>
              <TableHead className="text-center">IP</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
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
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          updateVMState(vm.name, "start");
                        }}
                      >
                        Start
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          updateVMState(vm.name, "restart");
                        }}
                      >
                        Restart
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          updateVMState(vm.name, "stop");
                        }}
                      >
                        Stop
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={"text-destructive hover:bg-accent"}
                        onClick={() => {
                          deleteVM(vm.name);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Empty className="py-48 border mb-8">
          <EmptyHeader>
            <EmptyTitle>No VPS Found.</EmptyTitle>
            <EmptyDescription>
              We could not find any VPS linked with your account. Would you like to create one?
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button
              onClick={() => {
                setOpen(!open);
              }}
            >
              Create VPS
            </Button>
            <Button variant={"outline"}>
              <Link to={"/pricing"}>Purchase Plan</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </>
  );
}
