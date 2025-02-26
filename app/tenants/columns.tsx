"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreHorizontal} from "lucide-react";
import Link from "next/link";

export type Tenant = {
    id: string
    attributes: {
        region: string
        majorVersion: number
        minorVersion: number
    }
}

export const columns: ColumnDef<Tenant>[] = [
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "attributes.region",
        header: "Region",
    },
    {
        accessorKey: "attributes.majorVersion",
        header: "Major",
    },
    {
        accessorKey: "attributes.minorVersion",
        header: "Minor",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Link href={"/tenants/" + row.getValue("id") + "/properties"}>
                                <span>View Tenant</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
