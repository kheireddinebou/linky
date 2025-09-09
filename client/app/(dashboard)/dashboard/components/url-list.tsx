import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CopyButton from "@/components/ui/copy-button";
import { shortUrl } from "@/utils/short-url";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, ExternalLink, QrCode } from "lucide-react";
import DeleteURLDialog from "./delete-url-dialog";
import UpdateURLDialog from "./update-url-dialog";
import URLQRCodeDialog from "./url-qr-code-dialog";

const NoURLsCard = () => (
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

interface URLListProps {
  urls: URLItem[];
}

const URLList = ({ urls }: URLListProps) => {
  if (urls.length === 0) return <NoURLsCard />;

  return (
    <div className="space-y-4 flex-1 max-w-full">
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
            <Card className="shadow-card hover:shadow-glow transition-all duration-300 border-primary/10 max-w-full">
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
                <div className="flex flex-1 w-full justify-between items-center gap-2 p-3 max-sm:p-2 flex-wrap rounded-lg bg-primary/5 border border-primary/20">
                  <code className="text-primary font-mono text-sm max-sm:text-xs">
                    {shortUrl(url.short_code)}
                  </code>

                  <CopyButton
                    failedMessage="Failed to copy URL"
                    successMessage="URL copied to clipboard! 📋"
                    text={shortUrl(url.short_code)}
                  />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">
                    Created {format(new Date(url.created_at), "MMM d, yyyy")}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(shortUrl(url.short_code), "_blank")
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>

                    <URLQRCodeDialog short_code={url.short_code} />

                    <UpdateURLDialog url={url} />

                    <DeleteURLDialog url={url} />
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
