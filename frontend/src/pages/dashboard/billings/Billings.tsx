import { Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';


interface UserPlan {
    id: string;
    in_use: number;
    purchased_at: string;
    expires_at: string;
    name: string;
    vCPU: number;
    storage: number;
    backups: number;
    memory: number;
}

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
        const res = await (await fetch(`/api/v1/profile/me/plans/${id}/renew`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })).json();

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
        const month = givenDate.toLocaleDateString('default', { month: "long" }); // gets month name eg. march
        const year = givenDate.getFullYear();
        return `${month + " " + date + ", " + year}`;
    };

    useEffect(() => {
        getAllPlans();
    }, []);



    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mt-4 mb-8">
                <h3 className="scroll-m-20 text-xl lg:text-2xl font-semibold tracking-tight text-primary">
                    Subscriptions
                </h3>
                <button className="flex items-center gap-2 bg-white border border-border-primary py-2 text-secondary-foreground hover:text-primary px-4 rounded text-sm font-medium hover:bg-accent/[2%] cursor-pointer" onClick={() => {
                }}> <Filter className="size-5 hidden lg:flex" />Filter</button>
            </div>

            {/* Table */}
            <div className="w-full bg-white border-[1px] border-border-primary mt-8 rounded-xl">
                {/* table head  */}
                <div className="grid xl:grid-cols-4 grid-cols-1 px-8">
                    <div className="flex items-center justify-center xl:justify-start gap-2 py-4">
                        <span className="text-sm font-semibold text-accent ">Subscriptions</span>
                    </div>
                    <div className="hidden xl:flex items-center justify-center gap-2 py-4">
                        <span className="text-sm font-semibold text-accent ">Purchase date</span>
                    </div>
                    <div className="hidden xl:flex items-center justify-center gap-2 py-4">
                        <span className="text-sm font-semibold text-accent ">Expiration date</span>
                    </div>
                </div>
                {/* Table body */}

                {/* subscription Box */}
                {plans?.map((plan: UserPlan) => (
                    <div className="px-8 py-6 grid xl:grid-cols-4 border-t-[1px] border-border-primary text-sm" key={plan.id}>

                        {/* grid 1 - Plan name */}
                        <div className="flex gap-x-4 grid-rows-2 items-center">
                            <h4 className="scroll-m-20 text-lg font-semibold tracking-tight text-accent wrap-anywhere">{plan.name}</h4>

                            <div className={plan.in_use === 1 ? "flex" : " hidden"}>
                                <p className="col-end-3 text-muted flex items-center gap-3 text-xs font-medium"> <span className="bg-primary-background text-primary/80 font-medium ring-1 ring-border-primary rounded-full text-xs px-2 py-1 xl:hidden 2xl:flex">in use</span></p>
                            </div>
                        </div>

                        {/* grid 2 - Purchased at */}
                        <div className="hidden xl:flex items-center justify-center text-primary gap-3">
                            {formatDate(plan.purchased_at)}
                        </div>

                        {/* grid 3 - Expires at  */}
                        <div className="hidden xl:flex items-center justify-center text-primary gap-2">
                            {formatDate(plan.expires_at)}
                        </div>

                        {/* grid 4 - Renew plan button */}
                        <div className="flex items-center justify-end gap-6 relative">
                            <button className="text-accent px-4 py-2 ring-1 rounded ring-accent text-sm font-medium hover:bg-accent hover:text-white transition-all duration-300 cursor-pointer w-full xl:w-fit mt-6 xl:mt-0" onClick={() => {
                                renewPlan(plan.id);
                            }}>Renew</button>
                        </div>
                    </div>
                ))}

            </div>
        </>
    );
}
