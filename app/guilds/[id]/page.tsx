"use client"

import {useEffect, useState} from "react"
import {useParams} from "next/navigation"
import {Badge} from "@/components/ui/badge"
import {DataTableWrapper} from "@/components/common/DataTableWrapper"
import {Toaster} from "@/components/ui/sonner"
import {guildsService} from "@/services/api/guilds.service";
import {Guild, GuildMember, GuildTitle} from "@/types/models/guild";
import {ColumnDef} from "@tanstack/react-table";
import {useTenant} from "@/context/tenant-context";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getJobNameById} from "@/lib/jobs";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {TenantConfig} from "@/types/models/tenant";
import { PageLoader, ErrorDisplay } from "@/components/common";

export default function GuildDetailPage() {
    const {id} = useParams()
    const {activeTenant, fetchTenantConfiguration} = useTenant()

    const [guild, setGuild] = useState<Guild | null>(null)
    const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!activeTenant || !id) return

        setLoading(true)

        // Fetch both guild data and tenant configuration
        Promise.all([
            guildsService.getById(activeTenant, String(id)),
            fetchTenantConfiguration(activeTenant.id)
        ])
            .then(([guildData, tenantConfigData]) => {
                setGuild(guildData)
                setTenantConfig(tenantConfigData)
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [activeTenant, id, fetchTenantConfiguration])

    if (loading) return <PageLoader />
    if (error || !guild || !tenantConfig) return <ErrorDisplay error={error || "Guild or tenant configuration not found"} className="p-4" />;

    return (
        <div className="flex flex-col flex-1 space-y-6 p-10 pb-16 h-screen">
            <div className="items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{guild.attributes.name}</h2>
                </div>
            </div>
            <div className="flex flex-row h-[25%] gap-6">
                <Card className="w-[80%]">
                    <CardHeader>
                        <CardTitle>Attributes</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>
                            <strong>Leader:</strong>{" "}
                            {guild.attributes.members.find(m => m.characterId === guild.attributes.leaderId)?.name ?? "Unknown"}
                        </div>
                        <div><strong>World:</strong> {tenantConfig.attributes.worlds[guild.attributes.worldId]?.name || 'Unknown'}
                        </div>
                        <div><strong>Members:</strong> {guild.attributes.members.length}</div>
                        <div><strong>Capacity:</strong> {guild.attributes.capacity}</div>
                        <div className="col-span-4"><strong>Notice:</strong> {guild.attributes.notice}</div>
                        <div className="col-span-4"><strong>Points:</strong> {guild.attributes.points}</div>
                        <div><strong>Logo:</strong> {guild.attributes.logo}</div>
                        <div><strong>Logo Color:</strong> {guild.attributes.logoColor}</div>
                        <div><strong>Background:</strong> {guild.attributes.logoBackground}</div>
                        <div><strong>Background Color:</strong> {guild.attributes.logoBackgroundColor}</div>
                    </CardContent>
                </Card>
                <Card className="w-[20%] overflow-y-auto">
                <CardHeader>
                        <CardTitle>Titles</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        {guild.attributes.titles.map((title) => (
                            <TooltipProvider key={title.index}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge title={`Index: ${title.index}`}>
                                            {title.name}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{String(title.index)}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <div className="flex-1">
                <DataTableWrapper
                    data={guild.attributes.members}
                    columns={getMemberColumns(guild.attributes.titles)}
                    initialVisibilityState={[]}
                    emptyState={{
                        title: "No guild members found",
                        description: "This guild currently has no members."
                    }}
                />
            </div>
            <Toaster richColors/>
        </div>
    )
}

function getMemberColumns(titles: GuildTitle[]): ColumnDef<GuildMember>[] {
    return [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "level",
            header: "Level",
        },
        {
            accessorKey: "jobId",
            header: "Job",
            cell: ({getValue}) => {
                const value = getValue();
                const id = Number(value);
                let name = String(value);
                if (!isNaN(id)) {
                    name = getJobNameById(id) || String(value)
                }
                return (
                    <div className="flex flex-rows justify-start gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="secondary">
                                        {name}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{String(value)}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            }
        },
        {
            header: "Title",
            cell: ({row}) => {
                const titleIndex = row.original.title
                const title = titles.find(t => t.index === titleIndex)
                return title?.name ?? `#${titleIndex}`
            }
        },
        {
            accessorKey: "allianceTitle",
            header: "Alliance Title",
        },
        {
            accessorKey: "online",
            header: "Online"
        },
    ]
}
