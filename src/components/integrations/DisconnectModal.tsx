import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DisconnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationName: string;
  onConfirm: () => void;
}

const DisconnectModal = ({ open, onOpenChange, integrationName, onConfirm }: DisconnectModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border/50 surface-glow">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Remove Integration</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to disconnect {integrationName} from your workspace?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs">
            Remove Connection
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DisconnectModal;
