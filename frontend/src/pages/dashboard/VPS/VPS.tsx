import {
  CopyIcon,
  Dot,
  Ellipsis,
  LucideChevronsUpDown,
  LucideLoader2,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { socket } from "../../../socket";
import type { UserPlan } from "../../../interface/UserPlan";
import type { VM } from "../../../interface/VM";

export default function VPS() {
  const [refresh, setRefresh] = useState<any>();

  // form data
  const [vmName, setVMName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<null | string>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // stores drawer state
  const [plans, setPlans] = useState<UserPlan[]>([]); // stores user plan info

  // handles vm option (start, stop, restart, delete) collapasble logic
  const [isCollapsableOpen, setIsCollapsableOpen] = useState(false);
  const [openedState, setOpenedState] = useState(""); // tracks which card's collapsable to open

  const [vms, setVMs] = useState<VM[]>([]); // stores vms info

  const changeDrawerState = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const VPSRegion = "in-north-1 (India, Chhattisgarh)"; // VPS region location static for now
  const VPSOS = "Ubuntu 24.04 LTS"; // VPS OS static for now

  // gets user's subscribed plans
  const getSubscribedPlans = async () => {
    const response = await (
      await (
        await fetch("/api/v1/profile/me/plans?is_expired=false&in_use=false")
      ).json()
    ).data;
    if (response.length > 0) {
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

    setIsDrawerOpen(!isDrawerOpen);

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

    setPlans((prev) =>
      prev.map((plan) =>
        plan.id == selectedPlan ? { ...plan, in_use: 1 } : plan,
      ),
    );

    toast(response.message);

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
            return prev.map((item) =>
              item.name === name ? { ...item, status: "starting" } : item,
            );
          });
          break;
        case "stop":
          setVMs((prev) => {
            return prev.map((item) =>
              item.name === name ? { ...item, status: "stopping" } : item,
            );
          });
          break;
        case "restart":
          setVMs((prev) => {
            return prev.map((item) =>
              item.name === name ? { ...item, status: "restarting" } : item,
            );
          });
          break;

        default:
          break;
      }
    } else {
      toast.info(response.message);
    }

    setIsCollapsableOpen(!isCollapsableOpen); // closes collapsable
  };

  // deletes VM
  const deleteVM = async (name: string) => {
    const response = await (
      await fetch(`/api/v1/vms/${name}`, {
        method: "DELETE",
      })
    ).json();

    if (response.status === 200) {
      setVMs((prev) => {
        return prev.map((item) =>
          item.name === name ? { ...item, status: "deleting" } : item,
        );
      });
    }

    setIsCollapsableOpen(!isCollapsableOpen); // closes collapsable
  };

  const resetForm = () => {
    setVMName("");
    setDescription("");
    setPassword("");
    if (plans.length > 0) {
      setSelectedPlan(null);
    }
  };

  // returns formated date eg. March 18, 2026
  const formatDate = (d: string) => {
    const givenDate = new Date(d);
    const date = givenDate.getDate().toString();
    const month = givenDate.toLocaleDateString("default", { month: "long" }); // gets month name eg. march
    const year = givenDate.getFullYear();
    return `${month + " " + date + ", " + year}`;
  };

  const changeCollapsableState = () => {
    setIsCollapsableOpen(!isCollapsableOpen);
  };

  const disPlayStatus = (status: string) => {
    switch (status) {
      case "running":
        return (
          <div className="flex items-center">
            <Dot className="size-10 text-success" />
            Running
          </div>
        );
      case "stopped":
        return (
          <div className="flex items-center">
            <Dot className="size-10 text-danger" />
            Stopped
          </div>
        );
      case "provisioning":
        return (
          <div className="flex items-center gap-3">
            <LucideLoader2 className="size-4 text-primary animate-spin" />
            Provisioning
          </div>
        );
      case "starting":
        return (
          <div className="flex items-center gap-3">
            <LucideLoader2 className="size-4 text-primary animate-spin" />
            Starting
          </div>
        );
      case "stopping":
        return (
          <div className="flex items-center gap-3">
            <LucideLoader2 className="size-4 text-primary animate-spin" />
            Stopping
          </div>
        );
      case "restarting":
        return (
          <div className="flex items-center gap-3">
            <LucideLoader2 className="size-4 text-primary animate-spin" />
            Restarting
          </div>
        );
      case "deleting":
        return (
          <div className="flex items-center gap-3">
            <LucideLoader2 className="size-4 text-primary animate-spin" />
            Deleting
          </div>
        );
      default:
        return <>STATUS UNKNOWN</>;
    }
  };

  useEffect(() => {
    getVMs();
    getSubscribedPlans();
  }, [refresh]);

  useEffect(() => {
    // establish socket connection
    socket.on("connect", () => {});
    socket.on("disconnect", () => {});

    socket.on("instance:lifecycle:events", (msg) => {
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
          return prev.map((vm: VM) =>
            vm.id === data.instance ? { ...vm, status: state } : vm,
          );
        });
      } else {
        // remove instance from list

        setVMs((prev) => {
          return prev.filter((instance) => instance.id !== data.instance);
        });
        toast.success("VM Deleted");
      }
    });

    return () => {
      socket.off("connect", () => {});
      socket.off("disconnect", () => {});
      socket.off("instance:lifecycle:events", () => {});
    };
  }, []);

  return (
    <div className="text-primary">
      {/* Drawer */}
      <div
        className={`${isDrawerOpen ? "translate-x-0" : "translate-x-[100%]"} fixed flex flex-col right-0 top-0 bottom-0 lg:w-3xl z-50 bg-white border-l-[1px] border-border-primary transition-all duration-300 min-h-screen`}
      >
        {/* header */}
        <div className="flex items-center justify-start px-4 py-3 border-b-[1px] border-border-primary">
          <h5 className="scroll-m-20 text-lg font-medium tracking-tight">
            Create VPS
          </h5>
        </div>

        {/* body */}
        <form className="px-6 py-8 space-y-8 flex-1">
          {/* vm name */}
          <div className="grid grid-cols-2 gap-2 lg:gap-0 items-center justify-between">
            <label
              htmlFor="name"
              className="text-secondary-foreground text-base"
            >
              VM Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={vmName}
              onChange={(e) => {
                setVMName(e.target.value);
              }}
              className="outline-none border-[1px] rounded border-primary/20 px-2 py-1 text-secondary-foreground bg-primary-background/50 hover:border-primary/40 focus:border-primary/40 focus:shadow-sm"
            />
          </div>

          {/* vm description */}
          <div className="grid grid-cols-2 gap-2 lg:gap-0 items-center justify-between">
            <label
              htmlFor="description"
              className="text-secondary-foreground text-base self-baseline"
            >
              Description{" "}
              <span className="bg-primary-background text-primary/80 font-semibold ring-1 ring-border-primary rounded-full text-xs px-2 py-1 ml-2">
                optional
              </span>
            </label>
            <textarea
              name="description"
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              className="outline-none border-[1px] rounded border-primary/20 px-2 py-1 text-secondary-foreground bg-primary-background/50 hover:border-primary/40 focus:border-primary/40 focus:shadow max-h-24 min-h-24"
            />
          </div>

          {/* vm root password */}
          <div className="grid grid-cols-2 gap-2 lg:gap-0 items-center justify-between">
            <label
              htmlFor="password"
              className="text-secondary-foreground text-base"
            >
              Root password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className="outline-none border-[1px] rounded border-primary/20 px-2 py-1 text-secondary-foreground bg-primary-background/50 hover:border-primary/40 focus:border-primary/40 focus:shadow"
            />
          </div>

          {/* OS selection */}
          <div className="grid grid-cols-2 gap-2 lg:gap-0 items-center justify-between">
            <label htmlFor="os" className="text-secondary-foreground text-base">
              Operating System
            </label>
            <input
              type="text"
              name="os"
              id="os"
              className="outline-none border-[1px] rounded border-primary/20 px-2 py-1 text-primary/50 bg-primary-background/50 hover:border-primary/40 focus:border-primary/40 focus:shadow"
              value={VPSOS}
              readOnly
            />
          </div>

          {/* region selection */}
          <div className="grid grid-cols-2 gap-2 lg:gap-0 items-center justify-between">
            <label
              htmlFor="region"
              className="text-secondary-foreground text-base"
            >
              Region
            </label>
            <input
              type="text"
              name="region"
              id="region"
              className="outline-none border-[1px] rounded border-primary/20 px-2 py-1 text-primary/50 bg-primary-background/50 hover:border-primary/40 focus:border-primary/40 focus:shadow"
              value={VPSRegion}
              readOnly
            />
          </div>

          {/* plan selection */}
          <div className="grid grid-cols-2 gap-2 lg:gap-0 items-center justify-between">
            <label
              htmlFor="plan"
              className="text-secondary-foreground text-base"
            >
              Plan
            </label>
            <select
              name="plan"
              id="plan"
              className="outline-none border-[1px] rounded border-accent/20 px-2 py-1 text-secondary-foreground bg-primary-background/50 hover:border-primary/40 focus:border-primary/40 focus:shadow"
              onChange={(e) => {
                setSelectedPlan(e.target.value);
              }}
              value={selectedPlan ? selectedPlan : "No Plan Selected"}
            >
              <option value="No Plan Selected">Select Plan</option>
              {plans.length > 0 ? (
                plans?.map(
                  (plan: UserPlan) =>
                    plan.in_use != 1 && (
                      <option
                        value={plan.id}
                        className="bg-primary-background text-primary"
                        key={plan.id}
                      >
                        {plan.name}{" "}
                        {"(" +
                          plan.vCPU +
                          " vCPU, " +
                          plan.memory +
                          " GiB Memory, " +
                          plan.storage +
                          " GiB Storage)"}
                      </option>
                    ),
                )
              ) : (
                <option className="bg-primary-background text-primary">
                  No Plan found
                </option>
              )}
            </select>
          </div>
        </form>

        {/* footer */}
        <div className="px-6">
          <div className="flex items-center justify-end my-6 gap-4 w-full">
            <button
              className=" bg-white px-4 py-2 rounded text-sm border-[1px] border-border-primary cursor-pointer hover:bg-accent/10 hover:text-accent"
              onClick={() => {
                changeDrawerState();
                resetForm();
              }}
            >
              cancel
            </button>
            <button
              className="bg-accent text-white px-4 py-2 rounded text-sm hover:bg-accent/95 cursor-pointer"
              onClick={() => {
                createVM();
              }}
            >
              create vm
            </button>
          </div>
        </div>
      </div>

      {/* Drawer background */}
      <div
        className={`${isDrawerOpen ? "absolute" : "hidden"} z-40 top-0 left-0 right-0 bottom-0 bg-primary/20`}
        onClick={() => {
          changeDrawerState();
          resetForm();
        }}
      ></div>

      {/* Header */}
      <div className="flex items-center justify-between mt-4">
        <h3 className="scroll-m-20 text-xl lg:text-2xl font-semibold tracking-tight">
          VPS - Overview
        </h3>
        <button
          className="flex items-center gap-2 bg-accent py-2 text-primary-background px-4 rounded text-sm font-medium hover:bg-accent/95 cursor-pointer"
          onClick={() => {
            changeDrawerState();
          }}
        >
          {" "}
          <Plus className="size-5 hidden lg:flex" />
          Create VM
        </button>
      </div>

      {/* Body */}
      <div className="w-full bg-white border-[1px] border-border-primary mt-8 rounded-xl">
        {vms?.length != 0 ? (
          <>
            {/* table head  */}
            <div className="grid xl:grid-cols-4 grid-cols-1 px-8">
              <div className="flex items-center justify-center xl:justify-start gap-2 py-4">
                <span className="text-base font-semibold text-primary flex items-center gap-2">
                  Server Details{" "}
                  <button className="text-muted hover:text-primary cursor-pointer">
                    {" "}
                    <LucideChevronsUpDown className="size-4 mt-0.5" />{" "}
                  </button>{" "}
                </span>
              </div>
              <div className="hidden xl:flex items-center justify-center gap-2 py-4">
                <span className="text-base font-semibold text-primary flex items-center gap-2">
                  IP{" "}
                  <button className="text-muted hover:text-primary cursor-pointer">
                    {" "}
                    <LucideChevronsUpDown className="size-4 mt-0.5" />{" "}
                  </button>{" "}
                </span>
              </div>
              <div className="hidden xl:flex items-center justify-center gap-2 py-4">
                <span className="text-base font-semibold text-primary flex items-center gap-2">
                  Status{" "}
                  <button className="text-muted hover:text-primary cursor-pointer">
                    {" "}
                    <LucideChevronsUpDown className="size-4 mt-0.5" />{" "}
                  </button>{" "}
                </span>
              </div>
            </div>

            {/* Table body */}

            {/* VM Box */}
            {vms?.map((vm: VM) => (
              <div
                className="px-8 py-6 grid xl:grid-cols-4 border-t-[1px] border-border-primary"
                key={vm.name}
              >
                {/* grid 1 - VM and plan Info */}
                <div className="flex md:grid grid-cols-[32px_1fr] gap-x-4 grid-rows-2 items-center">
                  <img src="/images/os/ubuntu.png" alt="" className="size-8" />
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-primary wrap-anywhere">
                    {vm.name}
                  </h4>
                  <p className="hidden col-end-3 text-muted md:flex items-center gap-3 text-xs font-medium">
                    {" "}
                    <span>{vm.plan}</span>{" "}
                    <span className="font-light xl:hidden 2xl:flex">|</span>{" "}
                    <span className="bg-primary-background text-primary/80 font-medium ring-1 ring-border-primary rounded-full text-xs px-2 py-1 xl:hidden 2xl:flex">
                      Expires at {formatDate(vm.expires_at)}
                    </span>
                  </p>
                </div>

                {/* grid 2 - IP Address */}
                <div className="hidden xl:flex items-center justify-center text-primary gap-3">
                  {vm.ip}
                  <CopyIcon
                    className="size-4 text-muted hover:text-accent cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(vm.ip);
                      toast.success("IP Coppied");
                    }}
                  />
                </div>

                {/* grid 3 - VM Status  */}
                <div className="hidden xl:flex items-center justify-center text-primary">
                  {disPlayStatus(vm.status)}
                </div>

                {/* grid 4 - vm options (firewall, backup, start, stop, restart, delete) */}
                <div className="flex items-center justify-end gap-6 relative">
                  <button
                    className="hidden xl:block text-muted hover:text-accent cursor-pointer transition-all duration-300 z-40"
                    onClick={() => {
                      changeCollapsableState();
                      setOpenedState(vm.name);
                    }}
                  >
                    <Ellipsis />
                  </button>

                  {/* VMs options collapsable (start, stop, restart, delete) */}
                  <div
                    className={`${isCollapsableOpen && vm.name == openedState ? "absolute" : "hidden"} border-[1px] rounded border-border-primary bg-white -bottom-[111px] w-36 right-10 z-50`}
                  >
                    <ul className="flex items-start flex-col w-full">
                      <li className="w-full">
                        <button
                          className="px-2 py-2 hover:bg-accent/[6%] hover:text-accent text-primary cursor-pointer w-full rounded-t"
                          onClick={() => {
                            updateVMState(vm.name, "start");
                          }}
                        >
                          Start
                        </button>
                      </li>
                      <li className="w-full">
                        <button
                          className="px-2 py-2 hover:bg-accent/[6%] hover:text-accent text-primary cursor-pointer w-full"
                          onClick={() => {
                            updateVMState(vm.name, "stop");
                          }}
                        >
                          Stop
                        </button>
                      </li>
                      <li className="w-full">
                        <button
                          className="px-2 py-2 hover:bg-accent/[6%] hover:text-accent text-primary cursor-pointer w-full"
                          onClick={() => {
                            updateVMState(vm.name, "restart");
                          }}
                        >
                          Restart
                        </button>
                      </li>
                      <li className="w-full">
                        <button
                          className="px-2 py-2 hover:bg-red-50 text-red-600 cursor-pointer w-full rounded-b"
                          onClick={() => {
                            deleteVM(vm.name);
                          }}
                        >
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* overlay screen */}
                <div
                  className={`${isCollapsableOpen ? "absolute" : "hidden"} top-0 left-0 right-0 bottom-0 z-40`}
                  onClick={() => {
                    changeCollapsableState();
                  }}
                ></div>
              </div>
            ))}
          </>
        ) : (
          <div className="h-screen flex flex-col items-center justify-center gap-y-8">
            <img
              src="/brandIcon.svg"
              alt=""
              className="size-20 grayscale-100"
            />
            <h2 className="text-2xl font-bold text-secondary-foreground">
              No VMs Found.
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
