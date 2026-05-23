import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardCardData = {
  TotalVPS: string;
  TotalRunningVPS: string;
  TotalSubscriptions: string;
  InUseSubscriptions: string;
};

export function DashboardCards({
  TotalVPS,
  TotalRunningVPS,
  TotalSubscriptions,
  InUseSubscriptions,
}: DashboardCardData) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card lg:grid-cols-3 xl:grid-cols-4 min-h-[100px]">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total VPS</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{TotalVPS}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Running VPS</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {TotalRunningVPS}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Subscriptions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {TotalSubscriptions}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Subscriptions In Use</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {InUseSubscriptions}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
