import type React from "react";
import Branding from "../../branding.json";
import { X, type LucideProps } from "lucide-react";
import { Link, useLocation } from "react-router";

interface URL {
    name: string;
    href: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}

interface SidebarFields {
    headerLinks: URL[];
    footerLinks: URL[];
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ headerLinks, footerLinks, isOpen, setIsOpen }: SidebarFields) {
    const appName = Branding.AppName; // gets app name from @/src/branding.json

    // gets url location
    const location = useLocation();

    const fullURLPath = location.pathname; // gets full url path eg. /dashboard/vps

    function changeSidebarState() {
        setIsOpen(!isOpen);
    }

    return (
        <>
            {/* desktop sidebar */}
            <aside className="hidden lg:block min-h-screen bottom-0 bg-white lg:w-[26%] xl:w-[22%] 2xl:w-[15%] p-4 relative">

                {/* App title */}
                <h2 className="logo font-semibold text-xl text-primary text-center">{appName}</h2>

                {/* Dashboard links */}
                <ul className="mt-6 space-y-1">
                    {headerLinks.map((link, index) => (
                        <li key={index}>
                            <Link to={link.href} className={`flex items-center gap-2 hover:text-accent hover:bg-accent/[12%] py-3 px-4 rounded text-sm ${fullURLPath === link.href ? "text-accent bg-accent/[12%] font-medium" : "text-secondary-foreground"}`}>
                                <link.icon className="size-5" />
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Footer Links */}
                <div className="absolute bottom-2">
                    <ul className="flex flex-col">
                        {footerLinks.map((link, index) => (
                            <li key={index}>
                                <Link to={link.href} className="flex items-center gap-2 text-primary hover:text-accent py-3 px-4 text-sm">
                                    <link.icon className="size-5" />
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

            </aside>

            {/* mobile sidebar */}
            <div className={`${isOpen ? "translate-x-0" : "-translate-x-[200%]"} absolute right-0 top-0 bottom-0 left-0 md:w-[60%] z-20 bg-white felx items-center flex-col px-6 transition-all duration-300 transform`}>

                {/* App title */}
                <div className="flex justify-between pt-6">
                    <h2 className="logo font-semibold text-xl text-primary text-center">{appName}</h2>
                    <button>
                        <X className="size-6" onClick={() => { changeSidebarState(); }} />
                    </button>
                </div>

                {/* App title */}
                <ul className="mt-6 space-y-1">
                    {headerLinks.map((link, index) => (
                        <li key={index}>
                            <Link to={link.href} onClick={() => { changeSidebarState(); }} className={`flex items-center gap-2 py-3 px-4 rounded text-sm ${fullURLPath === link.href ? "bg-accent text-white" : "text-secondary-foreground"}`}>
                                <link.icon className="size-5" />
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Footer Links */}
                <div className="absolute bottom-2">
                    <ul className="flex flex-col">
                        {footerLinks.map((link, index) => (
                            <li key={index}>
                                <Link to={link.href} className="flex items-center gap-2 text-primary hover:text-accent py-3 px-4 text-sm">
                                    <link.icon className="size-5" />
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>

            {/* mobile sidebar background */}
            <div className={`${isOpen ? "absolute" : "hidden"} z-10 top-0 left-0 right-0 bottom-0 bg-black/40`} onClick={() => {
                changeSidebarState();
            }}>
            </div>
        </>
    );
}
