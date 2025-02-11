
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface AddOpponentDialogProps {
  onAdd: (name: string) => Promise<void>;
}

export const AddOpponentDialog = ({ onAdd }: AddOpponentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(name);
    setName("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Key Opponent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Key Opponent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="opponentName">Opponent Name</Label>
            <Input
              id="opponentName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter opponent name"
              required
            />
          </div>
          <Button type="submit" className="w-full">Add Opponent</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
