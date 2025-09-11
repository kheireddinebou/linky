import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { shortUrl } from "@/utils/short-url";
import { QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useState } from "react";
import { toast } from "sonner";

interface URLQRCodeDialogProps {
  short_code: string;
}

const URLQRCodeDialog = ({ short_code }: URLQRCodeDialogProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const generateQRCode = async (shortCode: string) => {
    try {
      const url = shortUrl(shortCode);
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#8B5CF6",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrCodeDataURL);
    } catch (error) {
      toast.error("Failed to generate QR code");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          onClick={() => generateQRCode(short_code)}
        >
          <QrCode className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code to access your shortened URL
          </DialogDescription>
        </DialogHeader>
        {qrCodeUrl && (
          <div className="flex justify-center p-4">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="rounded-lg shadow-magic"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default URLQRCodeDialog;
