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
import { Lock } from "lucide-react";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10">
            <Lock className="w-6 h-6 text-accent" />
          </div>
          <DialogTitle className="text-center font-serif">
            Yêu cầu đăng nhập
          </DialogTitle>
          <DialogDescription className="text-center">
            Để xem nội dung chi tiết về{" "}
            <span className="font-medium text-foreground">
              "{milestone?.title}"
            </span>
            , bạn cần đăng nhập vào hệ thống.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Đóng
          </Button>
          <Button
            variant="gold"
            onClick={handleLogin}
            className="w-full sm:w-auto"
          >
            Đăng nhập ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPromptDialog;
