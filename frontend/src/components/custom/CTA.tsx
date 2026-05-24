import { Button } from "../ui/button";
import { TypographyH1, TypographyP } from "../Typography/typography";
import { useNavigate } from "react-router";

export default function CTA() {
  const navigate = useNavigate()
  return (
    <section className="pb-[80px] lg:pb-[181px]">
      <div className="container m-auto">
        <div className="flex flex-col items-center justify-center bg-muted/50 py-28 sm:rounded-2xl relative">
          {/* bg image */}
          <div className="absolute top-0 bottom-0 left-0 right-0 sm:rounded-2xl bg-[url(/images/CTA.png)] object-cover z-10" />
          <div className="absolute top-0 bottom-0 left-0 right-0 sm:rounded-2xl z-20 bg-black/50"/>

          <TypographyH1 className="text-primary-foreground z-40">Ready to get Started ?</TypographyH1>
          <TypographyP className="text-primary-foreground [&:not(:first-child)]:mt-2 z-40">
            Start your journey with us by creating new VPS
          </TypographyP>
          <Button size={"lg"} className={"font-semibold text-lg p-5 mt-6 z-40"} onClick={()=>{navigate("/login")}}>
            Start Journey
          </Button>
        </div>
      </div>
    </section>
  );
}
