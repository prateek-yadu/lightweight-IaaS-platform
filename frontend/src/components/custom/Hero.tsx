import { useNavigate } from "react-router";
import Branding from "../../branding.json";
import { Button } from "../ui/button";

export default function Hero() {
  const navigate = useNavigate()
  const appName = Branding.AppName; // gets app name from @/src/branding.json
  return (
    <section className="py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 m-auto">
        {/* heading */}
        <h1 className="font-bold text-4xl mb-[19px] text-center md:text-6xl lg:text-[90px] flex items-center flex-col dark:text-primary-foreground">
          <span>First choice </span> for indie devlopers.
        </h1>

        {/* description */}
        <p className="font-medium text-lg text-center text-muted-foreground lg:text-[22px] md:px-28 lg:px-40 xl:px-96">
          Make your servers ready for production with {appName} Easy to manage servers, scale without any effort.
        </p>

        {/* buttons */}
        <div className="flex items-center flex-col gap-3 mt-8 font-medium md:flex-row justify-center">
          <Button size={"lg"} className={"p-6 px-4 font-semibold"} onClick={()=>{navigate("/login")}}>
            Get started with Arctic
          </Button>
          <Button size={"lg"} className={"p-6 px-4 font-semibold"} variant={"outline"}>
            Talk to sales
          </Button>
        </div>
      </div>

      {/* Product Video */}
      <div className="container m-auto mt-12 md:mt-24 px-4">
        <video width={"100%"} controls className="w-full h-full rounded-2xl " autoPlay={true} muted={true} loop={true}>
          <source src="/videos/demo.webm" type="video/webm" />
        </video>
      </div>
    </section>
  );
}
