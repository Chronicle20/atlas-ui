export type TenantAttributes = {
    region: string;
    majorVersion: number;
    minorVersion: number;
    usesPin: boolean;
    characters: {
        templates: {
            jobIndex: number;
            subJobIndex: number;
            gender: number;
            mapId: number;
            faces: number[];
            hairs: number[];
            hairColors: number[];
            skinColors: number[];
            tops: number[];
            bottoms: number[];
            shoes: number[];
            weapons: number[];
            items: number[];
            skills: number[];
        }[];
    };
    npcs: {
        npcId: number;
        impl: string;
    }[];
    socket: {
        handlers: {
            opCode: string;
            validator: string;
            handler: string;
            options: unknown;
        }[];
        writers: {
            opCode: string;
            writer: string;
            options: unknown;
        }[];
    }
    worlds: {
        name: string;
        flag: string;
        serverMessage: string;
        eventMessage: string;
        whyAmIRecommended: string;
    }[];
}

export type Tenant = {
    id: string;
    attributes: TenantAttributes;
};

export async function fetchTenants(): Promise<Tenant[]> {
    const rootUrl = process.env.NEXT_PUBLIC_ROOT_API_URL || window.location.origin;
    const response = await fetch(rootUrl + "/api/configurations/tenants");
    if (!response.ok) {
        throw new Error("Failed to fetch templates.");
    }

    const responseData = await response.json();
    return responseData.data
        .map((tenant: Tenant) => ({
            ...tenant,
            attributes: {
                ...tenant.attributes,
                socket: {
                    ...tenant.attributes.socket,
                    handlers: [...tenant.attributes.socket.handlers].sort(
                        (a, b) => parseInt(a.opCode, 16) - parseInt(b.opCode, 16)
                    ),
                    writers: [...tenant.attributes.socket.writers].sort(
                        (a, b) => parseInt(a.opCode, 16) - parseInt(b.opCode, 16)
                    ),
                },
            },
        }))
        .sort((a : Tenant, b : Tenant) => {
            if (a.attributes.region !== b.attributes.region) {
                return a.attributes.region.localeCompare(b.attributes.region);
            }
            if (a.attributes.majorVersion !== b.attributes.majorVersion) {
                return a.attributes.majorVersion - b.attributes.majorVersion;
            }
            return a.attributes.minorVersion - b.attributes.minorVersion;
        });
}

export const updateTenant = async (tenant: Tenant | undefined, updatedAttributes: Partial<TenantAttributes>) => {
    if (!tenant) return;

    const input = {
        data: {
            id: tenant.id,
            type: "tenants",
            attributes: {
                ...tenant.attributes,
                ...updatedAttributes,
            },
        },
    };

    const rootUrl = process.env.NEXT_PUBLIC_ROOT_API_URL || window.location.origin;
    const response = await fetch(`${rootUrl}/api/configurations/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(input),
    });

    if (!response.ok) throw new Error("Failed to submit data.");

    // If the request is successful, update the local tenant state
    return {...tenant, attributes: {...tenant.attributes, ...updatedAttributes}};
}

export const deleteTenant = async (tenantId: string) => {
    const rootUrl = process.env.NEXT_PUBLIC_ROOT_API_URL || window.location.origin;
    const response = await fetch(`${rootUrl}/api/configurations/tenants/${tenantId}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
    });

    if (!response.ok) throw new Error("Failed to delete tenant.");

    return true;
}

export const createTenant = async (attributes: TenantAttributes) => {
    const input = {
        data: {
            type: "tenants",
            attributes: attributes,
        },
    };

    const rootUrl = process.env.NEXT_PUBLIC_ROOT_API_URL || window.location.origin;
    const response = await fetch(`${rootUrl}/api/configurations/tenants`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(input),
    });

    if (!response.ok) throw new Error("Failed to create tenant.");

    const responseData = await response.json();
    return responseData.data;
};

export const createTenantFromTemplate = (template: import("@/lib/templates").Template): TenantAttributes => {
    // Create a deep copy of the template attributes
    const tenantAttributes: TenantAttributes = JSON.parse(JSON.stringify(template.attributes));

    return tenantAttributes;
};
