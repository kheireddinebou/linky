import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Edit,
  Trash2,
  QrCode,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { format } from "date-fns";
import { deleteUrl, updateUrl } from "@/api/url";

interface URLListProps {
  urls: URLItem[];
  onUrlUpdated: (updatedUrl: URLItem) => void;
  onUrlDeleted: (deletedId: number) => void;
}

const URLList = ({ urls, onUrlUpdated, onUrlDeleted }: URLListProps) => {
  const [editingUrl, setEditingUrl] = useState<URLItem | null>(null);
  const [editData, setEditData] = useState({ title: "", original_url: "" });
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  const shortUrl = (shortCode: string) => `${SERVER_URL}/${shortCode}`;

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard! 📋");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

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

  const handleEdit = (url: URLItem) => {
    setEditingUrl(url);
    setEditData({ title: url.title || "", original_url: url.original_url });
  };

  const handleUpdate = async () => {
    if (!editingUrl) return;

    setIsLoading({ [`update-${editingUrl.id}`]: true });

    try {
      const response = await updateUrl(editingUrl.id.toString(), editData);
      onUrlUpdated(response);
      setEditingUrl(null);
      toast.success("URL updated successfully! ✨");
    } catch (error) {
      toast.error("Failed to update URL");
    } finally {
      setIsLoading({ [`update-${editingUrl.id}`]: false });
    }
  };

  const handleDelete = async (id: number) => {
    setIsLoading({ [`delete-${id}`]: true });

    try {
      const response = await deleteUrl(id.toString());
      onUrlDeleted(id);
      toast.success("URL deleted successfully");
    } catch (error) {
      toast.error("Failed to delete URL");
    } finally {
      setIsLoading({ [`delete-${id}`]: false });
    }
  };

  if (urls.length === 0) {
    return (
      <Card className="text-center py-12 border-dashed border-primary/30">
        <CardContent>
          <div className="text-muted-foreground mb-4">
            <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No URLs shortened yet</p>
            <p className="text-sm">
              Create your first short link above to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-xl font-semibold">
        Your Shortened URLs
      </h3>

      <AnimatePresence>
        {urls.map((url, index) => (
          <motion.div
            key={url.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="shadow-card hover:shadow-glow transition-all duration-300 border-primary/10">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-medium truncate">
                      {url.title || "Untitled Link"}
                    </CardTitle>
                    <CardDescription className="break-all">
                      {url.original_url}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <BarChart3 className="w-3 h-3" />
                    {url.clicks} clicks
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <code className="flex-1 text-primary font-mono text-sm">
                    {shortUrl(url.short_code)}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(shortUrl(url.short_code))}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Created {format(new Date(url.created_at), "MMM d, yyyy")}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(url.original_url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateQRCode(url.short_code)}
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

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(url)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit URL</DialogTitle>
                          <DialogDescription>
                            Update the title or original URL
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                              id="edit-title"
                              value={editData.title}
                              onChange={e =>
                                setEditData(prev => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                              placeholder="Enter a title for this URL"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-url">Original URL</Label>
                            <Input
                              id="edit-url"
                              value={editData.original_url}
                              onChange={e =>
                                setEditData(prev => ({
                                  ...prev,
                                  original_url: e.target.value,
                                }))
                              }
                              placeholder="Enter the original URL"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingUrl(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleUpdate}
                              disabled={isLoading[`update-${editingUrl?.id}`]}
                            >
                              {isLoading[`update-${editingUrl?.id}`]
                                ? "Updating..."
                                : "Update"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(url.id)}
                      disabled={isLoading[`delete-${url.id}`]}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default URLList;
