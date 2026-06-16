"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addJobApplication } from "@/action/job-tracker";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddJobDialog({ onAdd }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "APPLIED",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role) {
      toast.error("Company and Role are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addJobApplication(formData);
      if (onAdd) onAdd();
      router.refresh();
      setOpen(false);
      setFormData({ company: "", role: "", status: "APPLIED", notes: "" });
      toast.success("Job application added!");
    } catch (error) {
      toast.error(error.message || "Failed to add job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Job Application</DialogTitle>
            <DialogDescription>
              Track a new job opportunity in your application board.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                placeholder="e.g. Google, Microsoft"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
                  <SelectItem value="OFFERED">Offered</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific details or links..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-[150px] cursor-pointer">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Save Application"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
