"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingRequests from "./PendingRequests";
import RequestHistory from "./RequestHistory";
import type { HelpRequest } from "@/types";
import { getHelpRequests, resolveHelpRequest as resolveRequestInDb } from "@/lib/db"; // Import DB functions
import { useToast } from "@/hooks/use-toast";
import { improveKnowledgeBaseEntry, summarizeRequestContext, suggestAnswer } from "@/ai/flows"; // Import AI flows

export default function SupervisorDashboard() {
  const [pendingRequests, setPendingRequests] = React.useState<HelpRequest[]>([]);
  const [historicalRequests, setHistoricalRequests] = React.useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("pending");
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [pending, resolved, unresolved] = await Promise.all([
        getHelpRequests("pending"),
        getHelpRequests("resolved"),
        getHelpRequests("unresolved"),
      ]);
      setPendingRequests(pending);
      // Combine resolved and unresolved for history, sorted by resolvedAt or createdAt
      const history = [...resolved, ...unresolved].sort(
        (a, b) => (b.resolvedAt ?? b.createdAt) - (a.resolvedAt ?? a.createdAt)
      );
      setHistoricalRequests(history);
    } catch (error) {
      console.error("Error fetching help requests:", error);
      toast({
        title: "Error",
        description: "Failed to load help requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
    // Optional: Set up polling or real-time updates if needed
    // const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    // return () => clearInterval(interval);
  }, [fetchData]);

  const handleResolveRequest = async (requestId: string, answer: string) => {
      if (!answer.trim()) {
          toast({ title: "Error", description: "Answer cannot be empty.", variant: "destructive" });
          return;
      }
      try {
          // 1. Get original question for context
          const request = pendingRequests.find(r => r.id === requestId);
          if (!request) {
              throw new Error("Request not found");
          }

          // 2. (Optional but good) Improve the answer format using AI
          let finalAnswer = answer;
          try {
                // Find a knowledge base entry to compare style (if one exists)
                // For simplicity, just use the first resolved request's answer style if available
                const styleReference = historicalRequests.find(r => r.status === 'resolved' && r.supervisorAnswer)?.supervisorAnswer
                                      || "Default answer style."; // Fallback style

                const improvementResult = await improveKnowledgeBaseEntry({
                    originalEntry: styleReference, // Use a reference style
                    editedEntry: answer,
                });
                finalAnswer = improvementResult.improvedEntry;
                 toast({ title: "AI Assist", description: "Answer formatting improved." });
          } catch (aiError) {
              console.warn("AI knowledge base improvement failed:", aiError);
              // Proceed with the user's raw answer if AI fails
          }


          // 3. Resolve in DB (this also handles KB update and caller notification simulation)
          const resolved = await resolveRequestInDb(requestId, finalAnswer);

          if (resolved) {
              toast({ title: "Success", description: "Request resolved successfully." });
              // Refresh data after resolving
              fetchData();
              setActiveTab("history"); // Switch to history tab after resolving
          } else {
              throw new Error("Failed to resolve request in database.");
          }
      } catch (error) {
          console.error("Error resolving request:", error);
          toast({
              title: "Error",
              description: `Failed to resolve request: ${error instanceof Error ? error.message : 'Unknown error'}`,
              variant: "destructive",
          });
      }
  };

    // --- AI Helper Functions ---
  const handleSuggestAnswer = async (question: string): Promise<string> => {
        try {
            const result = await suggestAnswer({ question });
            toast({ title: "AI Suggestion", description: "Answer suggested." });
            return result.suggestedAnswer;
        } catch (error) {
            console.error("Error suggesting answer:", error);
            toast({ title: "AI Error", description: "Could not suggest an answer.", variant: "destructive" });
            return ""; // Return empty string on error
        }
    };

  const handleSummarizeContext = async (callerId: string, question: string): Promise<string> => {
        try {
            const result = await summarizeRequestContext({ callerId, question });
             toast({ title: "AI Summary", description: "Context summarized." });
            return result.summary;
        } catch (error) {
            console.error("Error summarizing context:", error);
            toast({ title: "AI Error", description: "Could not summarize context.", variant: "destructive" });
            return `Question from ${callerId}: ${question}`; // Fallback summary
        }
    };


  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-semibold mb-4">Supervisor Dashboard</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Requests ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <PendingRequests
            requests={pendingRequests}
            isLoading={isLoading}
            onResolve={handleResolveRequest}
            onSuggestAnswer={handleSuggestAnswer}
            onSummarizeContext={handleSummarizeContext}
          />
        </TabsContent>
        <TabsContent value="history">
          <RequestHistory requests={historicalRequests} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
