import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

interface UrlTitleSuggestionsProps {
  titleSuggestions: string[];
  handleDismissSuggestions: () => void;
  handleSelectSuggestion: (suggestions: string) => void;
}

const UrlTitleSuggestions = ({
  titleSuggestions,
  handleDismissSuggestions,
  handleSelectSuggestion,
}: UrlTitleSuggestionsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg"
    >
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-1 text-xs font-medium text-primary">
          <Sparkles className="w-3 h-3" />
          Suggested Titles
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleDismissSuggestions}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      <div className="p-1">
        {titleSuggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            type="button"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelectSuggestion(suggestion)}
            className="w-full text-left p-2 text-sm hover:bg-accent rounded-sm transition-colors"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default UrlTitleSuggestions;
