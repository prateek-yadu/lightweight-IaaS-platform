import { type ReactNode } from "react";
import { TypographyH3 } from "../Typography/typography";

type DashboardHeaderProps = {
  title: string;
  action?: ReactNode;
};

export default function DashboardHeader({ title, action }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mt-4 mb-6">
      <TypographyH3>{title}</TypographyH3>
      {action && action}
    </div>
  );
}
