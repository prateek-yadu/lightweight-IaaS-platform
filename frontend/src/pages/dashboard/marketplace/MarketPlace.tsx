import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ArrowUpRightIcon, Home } from "lucide-react";
import { Link } from "react-router";

export default function MarketPlace() {
  return (
    <Empty className="py-80 border my-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Home />
        </EmptyMedia>
        <EmptyTitle>Marketplace Comming Soon.</EmptyTitle>
        <EmptyDescription>
          Marketplace is a place where users can install pre-built images. It will be availabe soon.
        </EmptyDescription>
      </EmptyHeader>
      <Button variant="link" className="text-muted-foreground" size="sm">
        <Link to="/" className="flex items-center gap-2">
          Learn More <ArrowUpRightIcon />
        </Link>
      </Button>
    </Empty>
  );
}
