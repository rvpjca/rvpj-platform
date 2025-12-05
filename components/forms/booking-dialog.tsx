"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const bookingSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(10, "Enter a valid mobile number"),
  address: z.string().min(5, "Address is required"),
  service: z.string().min(2, "Please select a service"),
});

type BookingForm = z.infer<typeof bookingSchema>;

const serviceOptions = [
  "Audit & Assurance",
  "Direct Tax",
  "Indirect Tax / GST",
  "Corporate Laws & Secretarial",
  "Project Finance",
  "Management Consultancy",
];

export function BookingDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      service: "",
    },
  });

  const onSubmit = (values: BookingForm) => {
    console.info("Booking enquiry received:", values);
    setSuccessMessage("Thank you! Our team will reach out shortly.");
    form.reset();
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          Book a consultation <span aria-hidden>→</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule a consultation</DialogTitle>
          <DialogDescription>
            Share your contact details and the service you need. We usually respond within one business day.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Client name</label>
            <Input placeholder="Your full name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mobile number</label>
            <Input placeholder="+91 98765 12345" type="tel" {...form.register("phone")} />
            {form.formState.errors.phone ? (
              <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Address / City</label>
            <Textarea placeholder="Write your city and brief address" rows={3} {...form.register("address")} />
            {form.formState.errors.address ? (
              <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Service required</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue=""
              {...form.register("service")}
            >
              <option value="" disabled>
                Select a service
              </option>
              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            {form.formState.errors.service ? (
              <p className="text-xs text-destructive">{form.formState.errors.service.message}</p>
            ) : null}
          </div>

          {successMessage ? (
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 size={16} />
              {successMessage}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="submit" className="w-full">
              Submit enquiry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



