"use client"

import {useTenant} from "@/context/tenant-context";
import {DataTable} from "@/components/data-table";
import {columns} from "@/app/accounts/columns";
import {act, useEffect, useState} from "react";

interface Account {
    id: string;
    attributes: {
        name: string;
        pin: string;
        pic: string;
        loggedIn: number;
        lastLogin: number;
        gender: number;
        banned: boolean;
        tos: boolean;
        language: string;
        country: string;
        characterSlots: number;
    };
}

export default function Page() {
    const {activeTenant} = useTenant();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!activeTenant) return;

        const fetchAccounts = async () => {
            try {
                const rootUrl = process.env.NEXT_PUBLIC_ROOT_API_URL || "http://localhost:3000";
                console.log(activeTenant?.id);
                const response = await fetch(rootUrl + "/api/accounts/", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "TENANT_ID": activeTenant?.id,
                        "REGION": activeTenant?.attributes.region,
                        "MAJOR_VERSION": activeTenant?.attributes.majorVersion,
                        "MINOR_VERSION": activeTenant?.attributes.minorVersion,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch accounts.");
                }
                const data = await response.json();
                setAccounts(data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, [activeTenant]);

    return (
        <div className="flex flex-col flex-1 container mx-auto p-5 h-full">
            <div className="items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
                </div>
            </div>
            <div className="mt-4">
                <DataTable columns={columns} data={accounts}/>
            </div>
        </div>
    );
}