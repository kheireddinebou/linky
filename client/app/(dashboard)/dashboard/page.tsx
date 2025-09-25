"use client";

import { getUrls } from "@/api/url";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { useDashboardTour } from "@/hooks/useDashboardTour";
import { useQuery } from "@/hooks/useQuery";
import { useAuthStore } from "@/store/auth";
import { motion } from "framer-motion";
import { BarChart3, Link2, Users, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import StateCard from "./components/state-card";
import URLForm from "./components/url-form";
import URLList from "./components/url-list";

const Dashboard = () => {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  useDashboardTour();

  // Get URL from navigation state if coming from home page
  const initialUrl = searchParams.get("urlToShorten") || "";

  const { data: urls, isLoading } = useQuery({
    queryKey: ["urls"],
    queryFn: getUrls,
  });

  const totalClicks = urls?.reduce((sum, url) => sum + url.clicks, 0) || 0;

  const stats = [
    {
      title: "Total Links",
      value: urls?.length.toString(),
      icon: Link2,
      description: "URLs shortened",
      id: "total-links",
    },
    {
      title: "Total Clicks",
      value: totalClicks.toString(),
      icon: BarChart3,
      description: "Across all links",
      id: "total-clicks",
    },
    {
      title: "Active Today",
      value: "0", // This would come from API in real app
      icon: Zap,
      description: "Links clicked today",
      id: "active-today",
    },
    {
      title: "Engagement",
      value:
        (urls?.length ?? 0) > 0
          ? (totalClicks / (urls?.length ?? 0)).toFixed(1)
          : "0",
      icon: Users,
      description: "Avg clicks per link",
      id: "engagement",
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
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
            Welcome back,{" "}
            <span className="text-gradient max-w-ful">
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
          {stats.map(state => (
            <div id={state.id} key={state.id}>
              <StateCard state={state} />
            </div>
          ))}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* URL Form */}
          <div className="lg:col-span-1" id="shorten-url">
            <URLForm initialUrl={initialUrl} />
          </div>

          {/* URL List */}
          <div className="lg:col-span-2" id="your-urls">
            {isLoading ? (
              <Card className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mx-auto mb-4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                </div>
              </Card>
            ) : (
              <URLList urls={urls ?? []} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
