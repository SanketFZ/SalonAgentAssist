
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, UserCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">Welcome to Agent Assist</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            A human-in-the-loop system designed to enhance AI agent capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 pt-6">
          <p className="text-center max-w-prose">
            Agent Assist connects your AI agents with human supervisors for tasks requiring oversight, verification, or complex decision-making. Improve accuracy, handle edge cases, and build trust in your AI solutions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md pt-4">
            <Link href="/supervisor" passHref>
              <Button className="w-full justify-between" size="lg">
                <span>Supervisor View</span>
                <UserCheck className="h-5 w-5" />
              </Button>
            </Link>
             <Link href="/knowledge-base" passHref>
               <Button variant="outline" className="w-full justify-between" size="lg">
                 <span>Knowledge Base</span>
                 <BrainCircuit className="h-5 w-5" />
              </Button>
             </Link>
          </div>
           <p className="text-sm text-muted-foreground pt-4">
            Navigate using the sidebar or the buttons above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
