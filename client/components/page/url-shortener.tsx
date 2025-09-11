"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth";
import { motion } from "framer-motion";
import { QrCode, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useState } from "react";
import { toast } from "sonner";

const URLShortener = () => {
  const [url, setUrl] = useState("");
  const [generateQR, setGenerateQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleShortenUrl = () => {
    if (!url.trim()) {
      toast.error("Please enter a URL to shorten");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login or register to shorten URLs");
      router.push("/login");
      return;
    }

    // Redirect to dashboard with the URL
    router.push(`/dashboard?urlToShorten=${url}&generateQR=${generateQR}`);
  };

  const handleGenerateQR = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL to generate QR code");
      return;
    }

    try {
      const qrDataURL = await QRCode.toDataURL(url);
      setQrCodeUrl(qrDataURL);
      toast.success("QR Code generated successfully!");
    } catch (error) {
      toast.error("Failed to generate QR code");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mx-auto max-w-2xl"
    >
      <Card className="shadow-magic bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              type="url"
              placeholder="Enter your long URL here... ✨"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="flex-1 h-14 text-lg bg-background/50 border-primary/20 focus:border-primary"
              onKeyPress={e => e.key === "Enter" && handleShortenUrl()}
            />
            <Button
              onClick={handleShortenUrl}
              size="lg"
              variant="magic"
              className="h-14 px-8 text-lg font-semibold"
            >
              <Zap className="mr-2 h-5 w-5" />
              Shorten URL
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="generate-qr"
                checked={generateQR}
                onCheckedChange={setGenerateQR}
              />
              <Label htmlFor="generate-qr" className="text-sm">
                Generate QR Code with shortened URL
              </Label>
            </div>

            <Button
              onClick={handleGenerateQR}
              size="lg"
              variant="outline"
              className="h-12 px-6"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Only
            </Button>
          </div>

          {qrCodeUrl && (
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default URLShortener;
