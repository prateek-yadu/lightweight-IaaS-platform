import { Link } from "react-router";
import Branding from "../../branding.json";
import { ModeToggle } from "../mode-toggle";

export default function Footer() {
  const siteMap = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Pricing",
      href: "/pricing",
    },
    {
      name: "Login",
      href: "/login",
    },
    {
      name: "Register",
      href: "/register",
    },
    {
      name: "Dashboard",
      href: "/dashboard",
    },
  ];
  const appName = Branding.AppName; // gets app name from @/src/branding.json
  return (
    <footer className="body-font border-t border-border bg-muted dark:bg-muted/50 text-foreground">
      <div className="container px-5 py-24 mx-auto flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
        <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
          <div className="flex font-medium items-center md:justify-start justify-center text-foreground">
            <img src="/brandIcon.svg" className="size-8" />
            <span className="ml-3 font-doto font-extrabold text-2xl">{appName}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">A go-to choice for indie devs around the globe.</p>
        </div>
        <div className="flex-grow flex flex-wrap md:pl-20 -mb-10 md:mt-0 mt-10 md:text-left text-center">
          <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="font-bold tracking-widest text-base mb-3">Status</h2>
            <ul className="list-none mb-10">
              <li>
                <a className="text-muted-foreground hover:text-foreground cursor-pointer">Services</a>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="font-bold text-foreground tracking-widest text-base mb-3">Sitemap</h2>
            <ul className="list-none mb-10 space-y-1">
              {siteMap.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="font-bold text-foreground tracking-widest text-base mb-3">Arctic for</h2>
            <ul className="list-none mb-10 space-y-1">
              <li>
                <a className="text-muted-foreground hover:text-foreground cursor-pointer">Startups</a>
              </li>
              <li>
                <a className="text-muted-foreground hover:text-foreground cursor-pointer">Enterprises</a>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="font-bold text-foreground tracking-widest text-base mb-3">Support</h2>
            <ul className="list-none mb-10 space-y-1">
              <li>
                <a className="text-muted-foreground hover:text-foreground cursor-pointer">Help center</a>
              </li>
              <li>
                <a className="text-muted-foreground hover:text-foreground cursor-pointer">Talk to support</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="text-[14px]">
        <div className="container mx-auto py-5 px-5 flex flex-wrap flex-col md:flex-row">
          <p className="text-muted-foreground text-center md:text-left">
            © 2026 {appName} —
            <Link
              to="https://github.com/prateek-yadu"
              rel="noopener noreferrer"
              className="text-muted-foreground font-medium ml-1 hover:text-primary-foreground"
              target="_blank"
            >
              @prateek-yadu
            </Link>
          </p>
          <div className="flex flex-col gap-y-4 items-center mt-4 md:mt-0 md:flex-row flex-1 md:justify-end md:gap-y-0 md:gap-x-4">
            <div className="">
              <ul className="flex gap-4">
                <li className="text-muted-foreground hover:text-foreground">
                  <Link to={"https://github.com/prateek-yadu/lightweight-IaaS-platform"} target="_blank">
                    Terms & Conditions
                  </Link>{" "}
                </li>
                <li className="text-muted-foreground hover:text-foreground">
                  <Link to={"https://github.com/prateek-yadu/lightweight-IaaS-platform"} target="_blank">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="ml-4 text-center mt-4 md:mt-0">
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
