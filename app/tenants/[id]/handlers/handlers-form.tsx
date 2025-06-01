"use client"

import {useEffect} from "react";
import {useFieldArray, useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useParams} from "next/navigation";
import {useTenant} from "@/context/tenant-context";
import {X} from "lucide-react";
import {updateTenant} from "@/lib/tenants";
import {OptionsField} from "@/components/unknown-options";
import {toast} from "sonner";
import {ScrollToBottomButton} from "@/components/scroll-to-bottom-button";
import {ScrollToTopButton} from "@/components/scroll-to-top-button";

export function HandlersForm() {
    const {id} = useParams(); // Get tenants ID from URL
    const {tenants} = useTenant()
    let tenant = tenants.find((t) => t.id === id);

    interface FormValues {
        handlers: {
            opCode: string;
            validator: string;
            handler: string;
            options: unknown;
        }[];
    }

    const form = useForm<FormValues>({
        defaultValues: {
            handlers: tenant?.attributes.socket.handlers.map(handler => ({
                opCode: handler.opCode || "",
                validator: handler.validator || "",
                handler: handler.handler || "",
                options: handler.options,
            }))
        }
    });

    const {fields, append, remove} = useFieldArray({
        control: form.control,
        name: "handlers"
    });

    // Reset form values when `handlers` data changes
    useEffect(() => {
        form.reset({
            handlers: tenant?.attributes.socket.handlers.map(handler => ({
                opCode: handler.opCode || "",
                validator: handler.validator || "",
                handler: handler.handler || "",
                options: handler.options,
            }))
        });
    }, [tenant, form.reset, form]);

    const onSubmit = async (data: FormValues) => {
        tenant = await updateTenant(tenant, {
            socket: {
                handlers: data.handlers,
                writers: tenant?.attributes.socket.writers || [],
            },
        });
        toast.success("Successfully saved tenant.");
        form.reset({
            handlers: tenant?.attributes.socket.handlers,
        });


        updateTenant(tenant, {}).then(() => {
            toast.success("Successfully saved tenant.");
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <ScrollToBottomButton />
                <ScrollToTopButton />
                {fields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-md gap-2 relative flex flex-col justify-stretch">
                        <div className="gap-2 flex flex-row justify-stretch">
                            <FormField
                                control={form.control}
                                name={`handlers.${index}.opCode`}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Operation Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0x00" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`handlers.${index}.validator`}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Validator</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`handlers.${index}.handler`}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Handler</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <OptionsField form={form} path={`handlers.${index}.options`}/>
                        <Button type="button" className="absolute top-0 right-0" variant="ghost" size="icon"
                                onClick={() => remove(index)}>
                            <X/>
                        </Button>
                    </div>
                ))}
                <div className="flex flex-row gap-2 justify-between">
                    <Button type="button"
                            onClick={() => append({opCode: "", validator: "", handler: "", options: null})}>
                        Add
                    </Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Form>
    );
}
