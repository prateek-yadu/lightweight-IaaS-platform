import { Activity, Bolt, PackageOpen, Server } from "lucide-react";

function Home() {

  const sponsors01 = [
    {
      url: "/images/sponsors/SVG.svg",
      alt: "cocacola"
    },
    {
      url: "/images/sponsors/SVG-1.svg",
      alt: "cocacola"
    },
    {
      url: "/images/sponsors/SVG-2.svg",
      alt: "cocacola"
    },
    {
      url: "/images/sponsors/SVG-3.svg",
      alt: "cocacola"
    },
    {
      url: "/images/sponsors/SVG-4.svg",
      alt: "cocacola"
    },
    {
      url: "/images/sponsors/SVG-5.svg",
      alt: "cocacola"
    }
  ];

  const sponsors02 = [{
    url: "/images/sponsors/SVG-6.svg",
    alt: "cocacola"
  },
  {
    url: "/images/sponsors/SVG-7.svg",
    alt: "cocacola"
  },
  {
    url: "/images/sponsors/SVG-8.svg",
    alt: "cocacola"
  },
  {
    url: "/images/sponsors/SVG-9.svg",
    alt: "cocacola"
  },
  {
    url: "/images/sponsors/SVG-10.svg",
    alt: "cocacola"
  },];

  const complaiants = [
    {
      url: "/images/complaints/gdpr.png",
      alt: "gdpr"
    },
    {
      url: "/images/complaints/ccpa.png",
      alt: "ccpa"
    },
    {
      url: "/images/complaints/iso-1.png",
      alt: "iso-9001"
    },
    {
      url: "/images/complaints/iso-2.png",
      alt: "iso-27001"
    },
  ];

  return (
    <>
      {/* Navbar */}
      <nav className="container m-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex items-center font-doto font-extrabold text-2xl gap-2 md:gap-3">
            <div className="">
              <svg width="59" height="40" viewBox="0 0 59 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 md:size-7 fill-accent">
                <path d="M10 15.1533L56.0254 27.3643C57.7788 27.8295 59 29.4164 59 31.2305V40H49V35.8457L29.501 30.6729L10 35.8457V40H0V31.2305C4.53996e-06 29.4164 1.22118 27.8295 2.97461 27.3643L10.001 25.499L2.97461 23.6357C1.22116 23.1706 3.02567e-05 21.5836 0 19.7695V14C0 11.7909 1.79086 10 4 10H10V15.1533Z"></path>
                <path d="M55 10C57.2091 10 59 11.7909 59 14V20H49V10H55Z"></path>
                <path d="M45 0C47.2091 0 49 1.79086 49 4V10H10V4C10 1.79086 11.7909 2.81866e-08 14 0H45Z"></path>
              </svg>
            </div>
            <span>

              ARCTIC
            </span>
          </div>

          {/* Links */}
          <ul className="hidden md:flex text-lg font-medium space-x-6 ml-12 py-2 font-pixelify-sans">
            <li>Solutions</li>
            <li>Help</li>
            <li>Pricing</li>
          </ul>
        </div>
        <div className="flex items-center font-medium text-base gap-4 font-pixelify-sans">
          <button className="hidden md:flex text-[#31373D] bg-white px-2 md:px-5 py-1 md:py-2 ring-1 ring-[#CDD3DB] rounded-xl text-sm md:text-base">Login</button>
          <button className="text-white bg-accent px-2 md:px-5 py-1 md:py-2 ring-1 ring-[#505967] rounded-xl text-sm md:text-base">Register</button>
        </div>
      </nav>

      <main className="">
        {/* Hero */}
        <section className="py-12 md:py-24 lg:py-32 bg-[#FBFBFB]">
          <div className="container px-4 m-auto">
            {/* heading */}
            <h1 className="font-bold text-4xl mb-[19px] text-center md:text-6xl lg:text-[90px] flex items-center flex-col"><span>First choice </span> for indie devlopers.</h1>

            {/* description */}
            <p className="font-medium text-lg text-center text-[#31373D] lg:text-[22px] md:px-28 lg:px-40 xl:px-96">Make your servers ready for production with Arctic. Easy to manage servers, scale without any effort.</p>

            {/* buttons */}
            <div className="flex items-center flex-col gap-3 mt-8 font-medium md:flex-row justify-center">
              <button className="text-white bg-accent px-4 md:px-4 py-2 md:py-[13px] ring-1 ring-[#505967] rounded-xl text-sm md:text-base">Get started with Arctic</button>
              <button className="text-[#31373D] bg-white px-4 md:px-4 py-2 md:py-[13px] ring-1 ring-[#CDD3DB] rounded-xl text-sm md:text-base">Talk to sales</button>
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="bg-[#FBFBFB] pb-20">
          <div className="container px-4 m-auto flex flex-col gap-2 lg:gap-y-[51px] items-center">
            <div className="flex gap-6 lg:gap-16 overflow-x-scroll md:overflow-hidden justify-between">
              {sponsors01.map((sponsor) => (
                <img src={sponsor.url} alt={sponsor.alt} className="h-7 lg:h-10" />
              ))}
            </div>
            <div className="flex gap-6 lg:gap-16 overflow-x-scroll md:overflow-hidden justify-between">
              {sponsors02.map((sponsor) => (
                <img src={sponsor.url} alt={sponsor.alt} className="h-7 lg:h-10" />
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-[80px] lg:pt-[181px] lg:pb-[239px]">
          <div className="container px-4 m-auto">

            <div className="flex flex-row">
              {/* Left Content */}
              <div className="hidden lg:flex flex-col">
                <img src="/images/logos/box.svg" alt="" className="size-12 mt-2" />
                <div className="w-[2px] h-full self-center bg-linear-to-b from-white via-[#ECEDF0] to-white"></div>
              </div>
              {/* Right Content */}
              <div className="flex-1">
                <h2 className="flex flex-col items-start text-3xl font-bold md:text-4xl lg:text-[49px] pb-4 lg:ml-14"><span>Deploy on servers</span> that's trully your own.</h2>
                <p className="text-[#31373D] font-medium text-base md:text-lg lg:text-[22px] sm:pr-20 md:pr-40 lg:pr-80 xl:pr-[640px] 2xl:pr-[800px] lg:ml-14">Deploy your applications on Arctic for low latency and high performance with cutting edge technologies.</p>

                <div className="ring-1 ring-[#E4E5E9] rounded-[20px] px-4 pt-4 pb-0 mt-10 lg:mt-20">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-6 xl:gap-8 gap-y-6 pb-16 lg:pt-9 p-4 lg:px-10">
                    <div className="flex flex-col items-start gap-y-2">
                      <div className="flex items-center text-[#24292F] gap-x-1">
                        <span className=""><PackageOpen className="h-[19px]" /></span>
                        <span className="text-[18px] font-semibold">Deploy</span>
                      </div>
                      <span className="text-[#57606A] font-medium">Deploy your server on Arctic with one click, easy fast and scallable with zero extra efforts.</span>
                    </div>
                    <div className="flex flex-col items-start gap-y-2">
                      <div className="flex items-center text-[#99A2AF] gap-x-1">
                        <span className=""><Bolt className="h-[19px]" /></span>
                        <span className="text-[18px] font-semibold">Configure</span>
                      </div>
                      <span className="text-[#99A2AF] font-medium">Arctic provides a clean user interface for configuring and managing servers at large scale.</span>
                    </div>
                    <div className="flex flex-col items-start gap-y-2">
                      <div className="flex items-center text-[#99A2AF] gap-x-1">
                        <span className=""><Activity className="h-[19px]" /></span>
                        <span className="text-[18px] font-semibold">Monitor</span>
                      </div>
                      <span className="text-[#99A2AF] font-medium">Arctic provides a clean dashboard for monitoring your servers and show detailed logs.</span>
                    </div>
                    <div className="flex flex-col items-start gap-y-2">
                      <div className="flex items-center text-[#99A2AF] gap-x-1">
                        <span className=""><Server className="h-[19px]" /></span>
                        <span className="text-[18px] font-semibold">Scale</span>
                      </div>
                      <span className="text-[#99A2AF] font-medium">Scale your servers with Arctic's on demand scaling feature, exclusivly for enterprises.</span>
                    </div>
                  </div>
                  <div className="h-[400px] md:h-[500px] bg-accent/10 lg:mx-10 rounded-tl-[20px] rounded-tr-[20px]"></div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* features Section */}
        <section className="pb-[80px] lg:pb-[181px]">
          <div className="container px-4 m-auto">

            <div className="flex flex-row">

              {/* Left Content */}
              <div className="hidden lg:flex flex-col">
                <img src="/images/logos/box.svg" alt="" className="size-12 mt-2" />
                <div className="w-[2px] h-full self-center bg-linear-to-b from-white via-[#ECEDF0] to-white"></div>
              </div>

              {/* Right Content */}
              <div className="flex-1">
                <h2 className="flex flex-col items-start text-3xl font-bold md:text-4xl lg:text-[49px] pb-4 lg:ml-14"><span>Scale your Business</span> with a click of a button.</h2>
                <p className="text-[#31373D] font-medium text-base md:text-lg lg:text-[22px] sm:pr-20 md:pr-40 lg:pr-80 xl:pr-[640px] 2xl:pr-[800px] lg:ml-14">Arctic helps your Business to grow with one click setup and 24x7 support team to resolve your issues.</p>

                <div className="pt-4 pb-0 mt-10 lg:mt-20">
                  <div className="grid gap-6 lg:grid-cols-2">

                    {/* box 1 */}
                    <div className="h-[450px] lg:h-[504px] ring-1 ring-[#E4E5E9] rounded-[20px] lg:col-span-2 shadow-xs drop-shadow-xs grid grid-cols-1 p-8 pb-0 lg:grid-cols-2 lg:gap-20 lg:px-0 lg:pt-10">
                      <div className="lg:ml-12 text-lg flex items-start gap-y-2 flex-col">
                        <h4 className="font-semibold text-[#31373D]">Clean and minimal user interface.</h4>
                        <p className="font-medium text-[#555E67]">Arctic provides a clean and minimal user inteface to manage you infrastructure and plans.</p>
                      </div>
                      <div className="bg-accent/20 lg:rounded-tl-[20px] lg:rounded-br-[20px] rounded-t-[20px] lg:rounded-tr-none"></div>
                    </div>

                    {/* box 2 */}
                    <div className="h-[450px] lg:h-[540px] ring-1 ring-[#E4E5E9] rounded-[20px] shadow-xs drop-shadow-xs flex flex-col gap-[60px]">
                      <div className="flex flex-col lg:mx-12 text-lg items-start gap-y-2 p-8 pb-0 lg:px-0 lg:pt-10">
                        <h4 className="font-semibold text-[#31373D]">Secure your server with Arctics firewall.</h4>
                        <p className="font-medium text-[#555E67]">On top of server's firewall if any Arctic provides its own firewall per server which can be configured from dashboard.</p>
                      </div>
                      <div className="bg-accent/20 flex-1 h-full rounded-t-none rounded-b-[20px] lg:rounded-tl-[20px] lg:rounded-bl-none lg:ml-12 lg:rounded-r-none lg:rounded-br-[20px]"></div>
                    </div>

                    {/* box 3 */}
                    <div className="h-[450px] lg:h-[540px] ring-1 ring-[#E4E5E9] rounded-[20px] shadow-xs drop-shadow-xs flex flex-col gap-[60px] ">
                      <div className="flex flex-col lg:mx-12 text-lg items-start gap-y-2 p-8 pb-0 lg:px-0 lg:pt-10">
                        <h4 className="font-semibold text-[#31373D]">Automatic snapshots for enterprises.</h4>
                        <p className="font-medium text-[#555E67]">We provide automatic snapshot feature to enterprises who are enrolled in plan which include snapshots.</p>
                      </div>
                      <div className="bg-accent/20 flex-1 h-full rounded-b-[20px] lg:rounded-b-[20px] lg:rounded-t-none"></div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>


        {/* complaints section */}
        <section className="pb-[80px] lg:pb-[181px] mt-[100px] relative">
          <div className="container px-4 m-auto">

            <div className="flex flex-row">

              {/* Left Content */}
              <div className="hidden lg:flex flex-col opacity-0">
                <div className="w-12" />
              </div>

              {/* Right Content */}
              <div className="flex-1">

                <div className="grid grid-rows-2 gap-4 lg:grid-rows-1 lg:grid-cols-2 lg:ml-14">
                  {/* Left */}
                  <div className="">
                    <h3 className="font-bold text-2xl md:text-3xl lg:text-[38px]">Scale with <span className="text-[#727B84]">security</span></h3>
                    <p className="text-[#31373D] md:text-xl font-medium mt-0.5 md:mt-1.5 lg:pr-8 xl:pr-24 2xl:pr-44">Arctic is audited and certified by industry leading third-party standards</p>
                    <div className="flex items-center flex-col gap-3 md:flex-row justify-start text-sm md:text-base mt-6">
                      <button className="text-white bg-accent px-4 md:px-[18px] py-2 md:py-[13px] ring-1 ring-[#505967] rounded-xl w-full md:w-fit">Get started with Arctic</button>
                      <button className="text-[#31373D] bg-white px-4 md:px-[18px] py-2 md:py-[13px] ring-1 ring-[#CDD3DB] rounded-xl w-full md:w-fit">Talk to sales</button>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="grid grid-cols-2 items-center md:grid-cols-4 lg:mr-16 xl:mr-0 gap-4">
                    {complaiants.map((complaiant) => (
                      <img src={complaiant.url} alt={complaiant.alt} className="h-12 m-auto" />
                    ))}
                  </div>

                  {/* Absolutes */}
                  <div className="hidden lg:flex lg:absolute left-0 xl:right-0 xl:w-full -top-24">
                    <img src="/images/pattern_top.svg" alt="pattern_bottom" className="w-full" />
                  </div>
                  <div className="hidden lg:flex lg:absolute left-0 xl:right-0 xl:w-full bottom-20 overflow-hidden">
                    <img src="/images/pattern_bottom.svg" alt="pattern_top" className="w-full" />
                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>


      </main>
    </>
  );
}

export default Home;
