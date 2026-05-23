import { cn } from "@/lib/utils";
import { type PropsWithChildren, type ReactNode } from "react";

type TypographyType = {
  className?: string;
  children: ReactNode;
};

export function TypographyH1({ className, children }: TypographyType) {
  return <h1 className={cn("scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance", className)}>{children}</h1>;
}

export function TypographyH2({ children }: PropsWithChildren) {
  return <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">{children}</h2>;
}

export function TypographyH3({ children }: PropsWithChildren) {
  return <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{children}</h3>;
}

export function TypographyH4({ children }: PropsWithChildren) {
  return <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{children}</h4>;
}

export function TypographyP({ className, children }: TypographyType) {
  return <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>{children}</p>;
}
