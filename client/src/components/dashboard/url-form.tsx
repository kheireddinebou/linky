import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { urlAPI, URLItem } from '@/lib/api';
import { Zap, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import * as yup from 'yup';

const urlSchema = yup.object({
  original_url: yup.string().url('Please enter a valid URL').required('URL is required'),
  title: yup.string().optional(),
});

interface URLFormProps {
  onUrlCreated: (url: URLItem) => void;
  initialUrl?: string;
}

const URLForm = ({ onUrlCreated, initialUrl = '' }: URLFormProps) => {
  const [formData, setFormData] = useState({
    original_url: initialUrl,
    title: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form
      await urlSchema.validate(formData, { abortEarly: false });

      // API call
      const response = await urlAPI.createUrl(formData);
      
      if (response.success && response.data) {
        toast.success('✨ URL shortened successfully!');
        onUrlCreated(response.data);
        setFormData({ original_url: '', title: '' });
      } else {
        toast.error(response.message || 'Failed to shorten URL');
      }
    } catch (error: any) {
      if (error.inner) {
        // Validation errors
        const validationErrors: Record<string, string> = {};
        error.inner.forEach((err: any) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        // API errors
        toast.error(error.response?.data?.message || 'Failed to shorten URL');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-magic border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Shorten New URL
          </CardTitle>
          <CardDescription>
            Transform your long URL into a magical short link
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="original_url">URL to Shorten *</Label>
              <Input
                id="original_url"
                type="url"
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                value={formData.original_url}
                onChange={(e) => setFormData(prev => ({ ...prev, original_url: e.target.value }))}
                className={errors.original_url ? 'border-destructive' : ''}
              />
              {errors.original_url && (
                <p className="text-sm text-destructive">{errors.original_url}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Give your link a memorable title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <Button 
              type="submit" 
              variant="magic" 
              disabled={isLoading}
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" />
              {isLoading ? 'Shortening...' : 'Shorten URL'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default URLForm;