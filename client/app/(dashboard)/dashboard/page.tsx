"use client";

import { getUrls } from "@/api/url";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, Link2, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import URLForm from "./components/url-form";
import URLList from "./components/url-list";
import { useSearchParams } from "next/navigation";

const Dashboard = () => {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [urls, setUrls] = useState<URLItem[]>([]);

  // Get URL from navigation state if coming from home page
  const initialUrl = searchParams.get("urlToShorten") || "";

  const {
    data: urlsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["urls"],
    queryFn: getUrls,
    retry: false,
  });

  useEffect(() => {
    setUrls(urlsData || []);
  }, [urlsData]);

  const handleUrlCreated = (newUrl: URLItem) => {
    setUrls(prev => [newUrl, ...prev]);
  };

  const handleUrlUpdated = (updatedUrl: URLItem) => {
    setUrls(prev =>
      prev.map(url => (url.id === updatedUrl.id ? updatedUrl : url))
    );
  };

  const handleUrlDeleted = (deletedId: number) => {
    setUrls(prev => prev.filter(url => url.id !== deletedId));
  };

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);

  const stats = [
    {
      title: "Total Links",
      value: urls.length.toString(),
      icon: Link2,
      description: "URLs shortened",
    },
    {
      title: "Total Clicks",
      value: totalClicks.toString(),
      icon: BarChart3,
      description: "Across all links",
    },
    {
      title: "Active Today",
      value: "0", // This would come from API in real app
      icon: Zap,
      description: "Links clicked today",
    },
    {
      title: "Engagement",
      value: urls.length > 0 ? (totalClicks / urls.length).toFixed(1) : "0",
      icon: Users,
      description: "Avg clicks per link",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold mb-2">
            Welcome back,{" "}
            <span className="text-gradient">
              {user?.first_name || user?.username}
            </span>
            ! ✨
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your URLs and track their performance from your magical
            dashboard.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          {stats.map((stat, index) => (
            <Card
              key={stat.title}
              className="shadow-card hover:shadow-glow transition-all duration-300 border-primary/10"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* URL Form */}
          <div className="lg:col-span-1">
            <URLForm onUrlCreated={handleUrlCreated} initialUrl={initialUrl} />
          </div>

          {/* URL List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <Card className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mx-auto mb-4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                </div>
              </Card>
            ) : (
              <URLList
                urls={urls}
                onUrlUpdated={handleUrlUpdated}
                onUrlDeleted={handleUrlDeleted}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
