"use client";

import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import RegisterForm from "./components/register-form";

const Register = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mb-4"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold font-heading text-gradient">
              Join URL Wizardry
            </h1>
            <p className="mt-2 text-muted-foreground">
              Create your account and start shortening URLs
            </p>
          </div>

          <Card className="shadow-magic border-primary/20">
            <RegisterForm />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
