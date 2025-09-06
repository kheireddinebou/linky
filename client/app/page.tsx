"use client";

import Header from "@/components/layout/header";
import FeaturesSection from "@/components/page/features-section";
import URLShortener from "@/components/page/url-shortener";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container mx-auto relative z-10">
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
              Welcome to{" "}
              <span className="text-gradient animate-shimmer">Linky</span>
            </h1>

            <p className="mb-12 text-xl text-muted-foreground sm:text-2xl lg:text-xl">
              Transform your lengthy URLs into powerful, trackable short links.
              <br />
              <span className="text-primary font-medium">
                Cast your web presence spell today!
              </span>
            </p>

            <URLShortener />

            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center"
              >
                <Button variant="hero" size="lg" asChild>
                  <Link href="/register">Create Free Account</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Already have an account?</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <FeaturesSection />
    </div>
  );
};

export default Home;
