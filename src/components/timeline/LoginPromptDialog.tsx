import { useNavigate } from "react-router-dom";
import { Milestone } from "@/data/timelineData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface LoginPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone | null;
}

const LoginPromptDialog = ({ isOpen, onClose, milestone }: LoginPromptDialogProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate("/auth");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Đăng nhập để tiếp tục
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Để xem chi tiết về{" "}
            <span className="font-medium text-foreground">
              "{milestone?.title}"
            </span>
            , bạn cần đăng nhập vào hệ thống.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto uppercase tracking-widest text-xs"
          >
            Đóng
          </Button>
          <Button
            onClick={handleLogin}
            className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest text-xs group"
          >
            Đăng nhập
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPromptDialog;
