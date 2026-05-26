import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserPlan } from "@/interface/UserPlan";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Billing() {
  const [plans, setPlans] = useState<UserPlan[] | null>(null);

  const getAllPlans = async () => {
    const res = await (await fetch("/api/v1/profile/me/plans")).json();

    if (res.status == 200) {
      setPlans(res.data);
    }

    if (res.status == 500) {
      toast.error(res.message);
    }
  };

  const renewPlan = async (id: string) => {
    const res = await (
      await fetch(`/api/v1/profile/me/plans/${id}/renew`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (res.status == 200) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
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

  useEffect(() => {
    getAllPlans();
  }, []);

  return (
    <>
      <DashboardHeader title="Subscriptions" />

      {plans !== null ? (
        <Table>
          <TableCaption>List of all Purchased Plans</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Purchase date</TableHead>
              <TableHead>Expiration date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans?.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="flex items-center justify-start h-[52px] gap-2">
                  {plan.name} {plan.in_use === 1 && <Badge variant={"secondary"}>in use</Badge>}
                </TableCell>
                <TableCell>{formatDate(plan.purchased_at)}</TableCell>
                <TableCell>{formatDate(plan.expires_at)}</TableCell>
                <TableCell>
                  <Button
                    variant={"default"}
                    onClick={() => {
                      renewPlan(plan.id);
                    }}
                  >
                    Renew
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Empty className="py-48 border mb-8">
          <EmptyHeader>
            <EmptyTitle>No Plans Found.</EmptyTitle>
            <EmptyDescription>
              We could not find any Plan linked with your account. Would you like to pruchase one?
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button>
              <Link to={"/pricing"}>Purchase Plan</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </>
  );
}
