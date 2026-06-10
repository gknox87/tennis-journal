import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { AlertTriangle, Trash2 } from "lucide-react";

const CONFIRM_TEXT = "DELETE";

export const DeleteAccountSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteAccount, isDeleting } = useDeleteAccount();
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_TEXT) return;

    const result = await deleteAccount();
    if (!result.success) {
      toast({
        title: "Could not delete account",
        description: result.error ?? "Please try again or contact support.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account deleted",
      description: "Your account and data have been permanently removed.",
    });
    setOpen(false);
    setConfirmText("");
    navigate("/login", { replace: true });
  };

  return (
    <Card className="p-6 border-2 border-red-200 bg-red-50/50">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-100 flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">Delete account</h3>
          <p className="text-sm text-gray-600 mt-1">
            Permanently remove your account, matches, training history, wellness logs, goals, and all
            journal data. This cannot be undone.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Export your data first from{" "}
            <button
              type="button"
              className="text-blue-600 underline underline-offset-2"
              onClick={() => navigate("/data-export")}
            >
              Data Export & Privacy
            </button>{" "}
            if you want a copy.
          </p>

          <AlertDialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) setConfirmText("");
            }}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-4" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete my account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>This will permanently delete:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>All matches and statistics</li>
                      <li>Training sessions and notes</li>
                      <li>Wellness and injury records</li>
                      <li>Goals, badges, and opponent profiles</li>
                      <li>Your profile and login</li>
                    </ul>
                    <p className="font-medium text-red-600">This action cannot be undone.</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-2 py-2">
                <Label htmlFor="delete-confirm">
                  Type <span className="font-mono font-semibold">{CONFIRM_TEXT}</span> to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={CONFIRM_TEXT}
                  autoComplete="off"
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || confirmText !== CONFIRM_TEXT}
                >
                  {isDeleting ? "Deleting..." : "Permanently delete account"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};
