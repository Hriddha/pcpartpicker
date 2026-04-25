'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface SaveBuildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (buildName: string) => Promise<void>;
  initialName?: string;
  isUpdate?: boolean;
}

export function SaveBuildDialog({
  open,
  onOpenChange,
  onSave,
  initialName = '',
  isUpdate = false,
}: SaveBuildDialogProps) {
  const [buildName, setBuildName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  // Sync name when dialog opens with an existing build
  useEffect(() => {
    if (open) {
      setBuildName(initialName);
    }
  }, [open, initialName]);

  const handleSave = async () => {
    if (!buildName.trim()) return;
    setIsSaving(true);
    try {
      await onSave(buildName.trim());
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isUpdate ? 'Update Build' : 'Save Build'}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? 'Update the name and save your changes.'
              : 'Give your build a name to save it.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="build-name">Build Name</Label>
            <Input
              id="build-name"
              placeholder="e.g. Gaming Beast, Work Machine..."
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!buildName.trim() || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUpdate ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              isUpdate ? 'Update Build' : 'Save Build'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}