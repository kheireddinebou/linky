"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface State {
  title: string;
  value: string | undefined;
  icon: LucideIcon;
  description: string;
}

interface StateCardProps {
  state: State;
}

const StateCard = ({ state }: StateCardProps) => {
  return (
    <Card
      key={state.title}
      className="shadow-card hover:shadow-glow transition-all duration-300 border-primary/10"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {state.title}
        </CardTitle>
        <state.icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-heading">{state.value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {state.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default StateCard;
