'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface SaveBuildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (buildName: string) => Promise<void>;
}

export function SaveBuildDialog({ open, onOpenChange, onSave }: SaveBuildDialogProps) {
  const [buildName, setBuildName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!buildName.trim()) {
      setError('Please enter a build name');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(buildName.trim());
      setBuildName('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save build');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Your Build</DialogTitle>
          <DialogDescription>
            Give your PC build a name to save it for later. You can access your saved builds anytime.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="build-name">Build Name</Label>
            <Input
              id="build-name"
              placeholder="e.g., Gaming Rig 2024"
              value={buildName}
              onChange={(e) => {
                setBuildName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Spinner className="mr-2 h-4 w-4" />}
            Save Build
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
