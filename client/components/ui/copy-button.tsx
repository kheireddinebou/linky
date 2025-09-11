import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./button";

interface CopyButtonProps {
  successMessage: string;
  failedMessage: string;
  text: string;
}

const CopyButton = ({
  successMessage,
  failedMessage,
  text,
}: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (error) {
      toast.error(failedMessage);
    }
  };

  const Icon = isCopied ? Check : Copy;

  return (
    <Button size="sm" variant="outline" onClick={copyToClipboard}>
      <Icon className="w-4 h-4" />
    </Button>
  );
};

export default CopyButton;
