import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/layout/header';
import { Zap, Link2, QrCode, BarChart3, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

const Home = () => {
  const [url, setUrl] = useState('');
  const [generateQR, setGenerateQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleShortenUrl = () => {
    if (!url.trim()) {
      toast.error('Please enter a URL to shorten');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login or register to shorten URLs');
      navigate('/login');
      return;
    }

    // Redirect to dashboard with the URL
    navigate('/dashboard', { state: { urlToShorten: url, generateQR } });
  };

  const handleGenerateQR = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL to generate QR code');
      return;
    }

    try {
      const qrDataURL = await QRCode.toDataURL(url);
      setQrCodeUrl(qrDataURL);
      toast.success('QR Code generated successfully!');
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const features = [
    {
      icon: Link2,
      title: 'Instant URL Shortening',
      description: 'Transform long URLs into short, shareable links in seconds',
    },
    {
      icon: QrCode,
      title: 'QR Code Generation',
      description: 'Generate beautiful QR codes for easy mobile sharing',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track clicks, geographic data, and engagement metrics',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div
              className="mb-8"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="mx-auto h-16 w-16 text-primary animate-glow" />
            </motion.div>
            
            <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Welcome to{' '}
              <span className="text-gradient animate-shimmer">Linky</span>
            </h1>
            
            <p className="mb-12 text-xl text-muted-foreground sm:text-2xl lg:text-xl">
              Transform your lengthy URLs into powerful, trackable short links.
              <br />
              <span className="text-primary font-medium">Cast your web presence spell today!</span>
            </p>

            {/* URL Shortener Input */}
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
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 h-14 text-lg bg-background/50 border-primary/20 focus:border-primary"
                      onKeyPress={(e) => e.key === 'Enter' && handleShortenUrl()}
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

            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center"
              >
                <Button variant="hero" size="lg" asChild>
                  <Link to="/register">Create Free Account</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">Already have an account?</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl font-bold mb-4 sm:text-4xl">
              Powerful Features for Modern Marketers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage, track, and optimize your links
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1 border-primary/10">
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;