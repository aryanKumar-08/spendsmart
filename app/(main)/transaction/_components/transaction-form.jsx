'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { transactionSchema } from "@/app/lib/schema";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { createTransaction, updateTransaction } from "@/actions/transaction";
import { ReceiptScanner } from "./recipt-scanner";

export function AddTransactionForm({
  accounts,
  categories,
  editMode,
  initialData,
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Allow client-only rendering
    setIsClient(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: initialData?.accountId || "",
      amount: initialData?.amount || 0,
      description: initialData?.description || "",
      category: initialData?.category || "",
      type: initialData?.type || "EXPENSE",
      date: initialData?.date ? new Date(initialData.date) : undefined,
      receiptUrl: initialData?.receiptUrl || "",
      isPaid: initialData?.isPaid ?? true,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (values) => {
    try {
      if (editMode && initialData?.id) {
        await updateTransaction(initialData.id, values);
      } else {
        await createTransaction(values);
      }
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    }
  };

  if (!isClient) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Amount */}
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-red-500">{errors.amount.message}</p>
          )}
        </div>

        {/* Account */}
        <div className="space-y-2">
          <Label>Account</Label>
          <Select
            value={watch("accountId")}
            onValueChange={(val) => setValue("accountId", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc._id} value={acc._id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={watch("category")}
            onValueChange={(val) => setValue("category", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={watch("type")}
            onValueChange={(val) => setValue("type", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-2">
          <Label>Description</Label>
          <Input placeholder="Enter description" {...register("description")} />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watch("date") && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watch("date")
                  ? format(watch("date"), "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watch("date")}
                onSelect={(date) => setValue("date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Paid */}
        <div className="space-y-2">
          <Label>Paid?</Label>
          <Switch
            checked={watch("isPaid")}
            onCheckedChange={(val) => setValue("isPaid", val)}
          />
        </div>

        {/* Receipt Scanner */}
        <div className="md:col-span-2">
          <ReceiptScanner form={form} />
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}
