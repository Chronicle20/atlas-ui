"use client"

import { Button } from "@/components/ui/button"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import { Input } from "@/components/ui/input"
import { z } from "zod"
import {useParams} from "next/navigation";
import { Switch } from "@/components/ui/switch";
import {useEffect, useState} from "react";
import {fetchTemplates, Template, updateTemplate} from "@/lib/templates";

const propertiesFormSchema = z.object({
    region: z
        .string()
        .min(3, {
            message: "Region must be 3 characters.",
        })
        .max(3, {
            message: "Region must be 3 characters.",
        }),
    major: z.number(),
    minor: z.number(),
    usesPin: z.boolean(),
})

type PropertiesFormValues = z.infer<typeof propertiesFormSchema>

export function PropertiesForm() {
    const { id } = useParams(); // Get templates ID from URL

    const [template, setTemplate] = useState<Template>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTemplates = async () => {
            if (!id) return; // Ensure id is available

            setLoading(true); // Show loading while fetching

            try {
                const data: Template[] = await fetchTemplates();

                const template = data.data.find((t) => String(t.id) === String(id));
                setTemplate(template);

                form.reset({
                    region: template.region || "",
                    major: template.majorVersion || "",
                    minor: template.minorVersion || "",
                    usesPin: template.usesPin,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadTemplates();
    }, [id]);

    const form = useForm<PropertiesFormValues>({
        resolver: zodResolver(propertiesFormSchema),
        defaultValues: {
            region: "",
            major: 0,
            minor: 0,
            usesPin: false,
        },
        mode: "onChange",
    })

    const onSubmit = async (data : PropertiesFormValues) => {
        await updateTemplate(template, {
            region: data.region,
            majorVersion: data.major,
            minorVersion: data.minor,
            usesPin: data.usesPin,
        });
        form.reset({
            region: template?.attributes.region,
            major: template?.attributes.majorVersion,
            minor: template?.attributes.minorVersion,
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="region"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Region</FormLabel>
                            <FormControl>
                                <Input placeholder={template?.attributes.region} {...field} />
                            </FormControl>
                            <FormDescription>
                                The MapleStory region.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="major"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Major Version</FormLabel>
                            <FormControl>
                                <Input placeholder={template?.attributes.majorVersion} {...field} />
                            </FormControl>
                            <FormDescription>
                                The MapleStory major version.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="minor"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Minor Version</FormLabel>
                            <FormControl>
                                <Input placeholder={template?.attributes.minorVersion} {...field} />
                            </FormControl>
                            <FormDescription>
                                The MapleStory minor version.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="usesPin"
                    render={({field}) => (
                        <FormItem
                            className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Uses PIN system</FormLabel>
                                <FormDescription>
                                    Receive emails about new products, features, and more.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="flex flex-row gap-2 justify-end">
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Form>
    );
}