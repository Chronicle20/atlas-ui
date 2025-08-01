"use client"

import { useTenant } from "@/context/tenant-context";
import { useCallback, useEffect, useState } from "react";
import {npcsService} from "@/services/api";
import {NPC, Commodity} from "@/types/models/npc";
import { tenantHeaders } from "@/lib/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, RefreshCw, Upload, Trash2, ShoppingBag, Plus, MessageCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {createErrorFromUnknown} from "@/types/api/errors";
import {PageLoader} from "@/components/common/PageLoader";
import {ErrorDisplay} from "@/components/common/ErrorDisplay";

export default function Page() {
    const { activeTenant } = useTenant();
    const [npcs, setNpcs] = useState<NPC[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateShopDialogOpen, setIsCreateShopDialogOpen] = useState(false);
    const [isDeleteAllShopsDialogOpen, setIsDeleteAllShopsDialogOpen] = useState(false);
    const [isBulkUpdateShopDialogOpen, setIsBulkUpdateShopDialogOpen] = useState(false);
    const [selectedNpcId, setSelectedNpcId] = useState<number | null>(null);
    const [createShopJson, setCreateShopJson] = useState("");
    const [bulkUpdateShopJson, setBulkUpdateShopJson] = useState("");

    const fetchDataAgain = useCallback(() => {
        if (!activeTenant) return;

        setLoading(true);

        npcsService.getAllNPCs(activeTenant)
            .then((npcData) => {
                setNpcs(npcData);
            })
            .catch((err: unknown) => {
                const errorInfo = createErrorFromUnknown(err, "Failed to fetch NPCs");
                setError(errorInfo.message);
            })
            .finally(() => setLoading(false));
    }, [activeTenant]);

    const handleCreateShop = async () => {
        if (!activeTenant) return;

        try {
            // Send the entire JSON as is to the server
            const jsonData = JSON.parse(createShopJson);

            if (!jsonData.data || !jsonData.data.attributes || !jsonData.data.attributes.npcId) {
                toast.error("Invalid JSON format. Missing npcId in data.attributes");
                return;
            }

            const npcId = parseInt(jsonData.data.attributes.npcId);
            if (isNaN(npcId)) {
                toast.error("Please provide a valid NPC ID in the JSON");
                return;
            }

            const rootUrl = process.env.NEXT_PUBLIC_ROOT_API_URL || window.location.origin;
            const response = await fetch(rootUrl + "/api/npcs/" + npcId + "/shop", {
                method: "POST",
                headers: tenantHeaders(activeTenant),
                body: createShopJson
            });

            if (!response.ok) {
                throw new Error("Failed to create shop.");
            }
            await response.json();
            toast.success("Shop created successfully");
            setIsCreateShopDialogOpen(false);
            setCreateShopJson("");
            fetchDataAgain();
        } catch (err: unknown) {
            toast.error("Failed to create shop: " + (err instanceof Error ? err.message : String(err)));
        }
    };

    const handleDeleteAllShops = async () => {
        if (!activeTenant) return;

        try {
            await npcsService.deleteAllShops(activeTenant);
            toast.success("All shops deleted successfully");
            setIsDeleteAllShopsDialogOpen(false);
            fetchDataAgain();
        } catch (err: unknown) {
            toast.error("Failed to delete all shops: " + (err instanceof Error ? err.message : String(err)));
        }
    };

    const handleBulkUpdateShop = async () => {
        if (!activeTenant || !selectedNpcId) return;

        try {
            const jsonData = JSON.parse(bulkUpdateShopJson);

            // Extract commodities from the included array if available
            let commoditiesToUpdate: Commodity[] = [];

            // Check for commodities in the root level included array (standard JSON:API format)
            if (jsonData.included && jsonData.included.length > 0) {
                commoditiesToUpdate = jsonData.included;
            }
            // Fallback to check for commodities in data.included (alternative format)
            else if (jsonData.data.included && jsonData.data.included.length > 0) {
                commoditiesToUpdate = jsonData.data.included;
            }

            // Get recharger value from JSON data if available
            const rechargerValue = jsonData.data.attributes?.recharger;

            await npcsService.updateShop(selectedNpcId, commoditiesToUpdate, activeTenant, rechargerValue);
            setIsBulkUpdateShopDialogOpen(false);
            setBulkUpdateShopJson("");
            fetchDataAgain();
            toast.success("Shop updated successfully");
        } catch (err: unknown) {
            toast.error("Failed to update shop: " + (err instanceof Error ? err.message : String(err)));
        }
    };

    useEffect(() => {
        fetchDataAgain();
    }, [activeTenant, fetchDataAgain]);

    // Prevent body scrolling when this page is mounted
    useEffect(() => {
        // Save the original styles
        const originalOverflow = document.documentElement.style.overflow;

        // Apply overflow: hidden to html element
        document.documentElement.style.overflow = 'hidden';

        // Cleanup function to restore original styles when component unmounts
        return () => {
            document.documentElement.style.overflow = originalOverflow;
        };
    }, []);

    if (loading) return <PageLoader />;
    if (error) return <ErrorDisplay error={error} retry={fetchDataAgain} />;

    return (
        <div className="flex flex-col flex-1 space-y-6 p-10 pb-4 h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">NPCs</h2>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchDataAgain}
                            className="hover:bg-accent cursor-pointer"
                            title="Refresh"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4 mr-2" />
                                    Actions
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsCreateShopDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Shop
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsDeleteAllShopsDialogOpen(true)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete All Shops
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="overflow-auto h-[calc(100vh-10rem)] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {npcs.map((npc) => (
                        <Card key={npc.id} className="overflow-hidden">
                            <CardHeader className="pb-2 flex justify-between items-start">
                                <CardTitle className="text-lg">NPC #{npc.id}</CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {npc.hasShop && (
                                            <DropdownMenuItem onClick={() => {
                                                setSelectedNpcId(npc.id);
                                                setIsBulkUpdateShopDialogOpen(true);
                                            }}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Bulk Update Shop
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="text-sm flex space-x-2">
                                    {npc.hasShop ? (
                                        <Button 
                                            variant="default" 
                                            size="sm"
                                            className="cursor-pointer"
                                            asChild
                                            title="Shop Active"
                                        >
                                            <Link href={`/npcs/${npc.id}/shop`}>
                                                <ShoppingBag className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="cursor-not-allowed opacity-50"
                                            disabled
                                            title="Shop Inactive"
                                        >
                                            <ShoppingBag className="h-4 w-4" />
                                        </Button>
                                    )}

                                    {npc.hasConversation ? (
                                        <Button 
                                            variant="default" 
                                            size="sm"
                                            className="cursor-pointer"
                                            asChild
                                            title="Conversation Available"
                                        >
                                            <Link href={`/npcs/${npc.id}/conversations`}>
                                                <MessageCircle className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="cursor-not-allowed opacity-50"
                                            disabled
                                            title="No Conversation"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {npcs.length === 0 && (
                        <div className="col-span-full text-center py-10">
                            No NPCs found.
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isCreateShopDialogOpen} onOpenChange={setIsCreateShopDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create Shop</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            placeholder="Paste JSON data here..."
                            value={createShopJson}
                            onChange={(e) => setCreateShopJson(e.target.value)}
                            className="min-h-[300px] font-mono"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateShopDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateShop}>
                            Create Shop
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteAllShopsDialogOpen} onOpenChange={setIsDeleteAllShopsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete All Shops</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-destructive font-semibold">Warning: This action cannot be undone.</p>
                        <p>Are you sure you want to delete all shops for the current tenant?</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteAllShopsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAllShops}>
                            Delete All Shops
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isBulkUpdateShopDialogOpen} onOpenChange={setIsBulkUpdateShopDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Bulk Update Shop</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            placeholder="Paste JSON data here..."
                            value={bulkUpdateShopJson}
                            onChange={(e) => setBulkUpdateShopJson(e.target.value)}
                            className="min-h-[300px] font-mono"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkUpdateShopDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleBulkUpdateShop}>
                            Update Shop
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Toaster richColors />
        </div>
    );
}
