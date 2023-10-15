import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "./ui/button";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { api } from "~/utils/api";
import es from "date-fns/locale/es";
import { useState } from "react";

const formSchema = z.object({
  name: z.string(),
  description: z.string(),
  startDate: z.date().min(new Date()),
  startTime: z.string(),
  price: z.string().regex(/^[0-9]+/),
  location: z.string().url().optional(),
});

export interface eventModalProps {
  triggerToast: (success: boolean) => void;
  userLocation: string;
}
export const CreateEventModal = (props: eventModalProps) => {
  const { mutate, isLoading } = api.events.create.useMutation({
    onSuccess: () => {
      setOpen(false);
      props.triggerToast(true);
    },
    onError: (error) => {
      console.log(error);
      props.triggerToast(false);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: props.userLocation ? props.userLocation : "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const startDate = new Date(values.startDate);
    const time = values.startTime.split(":");
    startDate.setHours(parseInt(time[0]!));
    startDate.setMinutes(parseInt(time[1]!));

    const eventParams = {
      ...values,
      startDate: startDate,
      price: parseInt(values.price),
    };
    mutate(eventParams);
  };

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="rounded-lg bg-green-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
        Crear evento
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear un evento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={void form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Liga Pokémon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Liga Pokémon divertida" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://maps.app.goo.gl/2vdFYc7U1PgkQL9y7"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Añade un link de google maps aquí
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha del torneo</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Escoge una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        locale={es}
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full sm:w-36"
                      type="time"
                      placeholder="14:00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <div className="relative mb-6">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        $
                      </div>
                      <Input
                        className="w-full pl-8 sm:w-36"
                        type="number"
                        placeholder="100"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <div>
                <Button disabled={isLoading} type="submit">
                  {!!isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Crear evento
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
