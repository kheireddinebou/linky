"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BarChart3, Link2, QrCode, Shield } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Link2,
      title: "Instant URL Shortening",
      description: "Transform long URLs into short, shareable links in seconds",
    },
    {
      icon: QrCode,
      title: "QR Code Generation",
      description: "Generate beautiful QR codes for easy mobile sharing",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track clicks, geographic data, and engagement metrics",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto">
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
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
