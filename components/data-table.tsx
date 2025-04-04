"use client"

import {ColumnDef, flexRender, getCoreRowModel, useReactTable, VisibilityState,} from "@tanstack/react-table"

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import React from "react";
import {Button} from "./ui/button";
import {RefreshCw} from "lucide-react";

interface DataTableProps<TData, TValue> {
    initialVisibilityState?: string[]
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRefresh?: () => void
}

export function DataTable<TData, TValue>({
                                             initialVisibilityState,
                                             columns,
                                             data,
                                             onRefresh,
                                         }: DataTableProps<TData, TValue>) {
    const state = Object.fromEntries((initialVisibilityState || []).map((col) => [col.replaceAll(".", "_"), false]));
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(state)

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            columnVisibility,
        }
    })

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                    {onRefresh && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onRefresh}
                            className="hover:bg-accent cursor-pointer"
                            title="Refresh"
                        >
                            <RefreshCw className="h-4 w-4"/>
                        </Button>
                    )}
                </div>
                <div className="text-sm text-muted-foreground"></div>
            </div>

            <div className="w-full">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
