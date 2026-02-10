import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateCallerUserProfile } from '../../hooks/queries/useUserProfile';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ProfileSetupModal() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const createProfileMutation = useCreateCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim() || !nameConfirmed) return;

    setErrorMessage('');
    try {
      await createProfileMutation.mutateAsync({
        username: username.trim(),
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      // Extract user-friendly error message
      const message = error?.message || String(error);
      if (message.includes('already taken')) {
        setErrorMessage('This username is already taken. Please choose a different one.');
      } else if (message.includes('cannot contain spaces')) {
        setErrorMessage('Username cannot contain spaces.');
      } else if (message.includes('too long')) {
        setErrorMessage('Username is too long. Maximum 20 characters.');
      } else {
        setErrorMessage('Failed to create profile. Please try again.');
      }
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to StonkSquad! 🚀</DialogTitle>
          <DialogDescription>
            Create your profile to get started. Your username will be your unique identifier on the platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              placeholder="cooltrader"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              required
            />
            <p className="text-xs text-muted-foreground">
              Your unique identifier: <span className="font-mono">{username || '...'}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              placeholder="Cool Trader"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">This is how others will see your name</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
              <Checkbox
                id="name-confirmation"
                checked={nameConfirmed}
                onCheckedChange={(checked) => setNameConfirmed(checked === true)}
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="name-confirmation"
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  I confirm this is my real name and I'm not impersonating anyone else
                </Label>
                <p className="text-xs text-muted-foreground">
                  Usernames are unique and cannot be changed after creation
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createProfileMutation.isPending || !username || !displayName || !nameConfirmed}
          >
            {createProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
