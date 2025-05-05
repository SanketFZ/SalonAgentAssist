"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { HelpRequest } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Bot, User, Wand2, MessagesSquare } from "lucide-react"; // Import icons

interface PendingRequestsProps {
  requests: HelpRequest[];
  isLoading: boolean;
  onResolve: (requestId: string, answer: string) => Promise<void>;
  onSuggestAnswer: (question: string) => Promise<string>; // AI suggestion
  onSummarizeContext: (callerId: string, question: string) => Promise<string>; // AI summary
}

export default function PendingRequests({
  requests,
  isLoading,
  onResolve,
  onSuggestAnswer,
  onSummarizeContext,
}: PendingRequestsProps) {
  const [answers, setAnswers] = React.useState<{ [key: string]: string }>({});
  const [isResolving, setIsResolving] = React.useState<{ [key: string]: boolean }>({});
  const [isSuggesting, setIsSuggesting] = React.useState<{ [key: string]: boolean }>({});
  const [isSummarizing, setIsSummarizing] = React.useState<{ [key: string]: boolean }>({});
   const [summaries, setSummaries] = React.useState<{ [key: string]: string }>({});

  const handleAnswerChange = (requestId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [requestId]: value }));
  };

  const handleResolveClick = async (requestId: string) => {
    setIsResolving((prev) => ({ ...prev, [requestId]: true }));
    await onResolve(requestId, answers[requestId] || "");
    setIsResolving((prev) => ({ ...prev, [requestId]: false }));
    // Clear answer input after resolving
    setAnswers((prev) => ({ ...prev, [requestId]: "" }));
  };

 const handleSuggestClick = async (requestId: string, question: string) => {
    setIsSuggesting(prev => ({ ...prev, [requestId]: true }));
    const suggestedAnswer = await onSuggestAnswer(question);
    if (suggestedAnswer) {
        setAnswers(prev => ({ ...prev, [requestId]: suggestedAnswer }));
    }
    setIsSuggesting(prev => ({ ...prev, [requestId]: false }));
 };

 const handleSummarizeClick = async (requestId: string, callerId: string, question: string) => {
    setIsSummarizing(prev => ({ ...prev, [requestId]: true }));
    const summary = await onSummarizeContext(callerId, question);
     if (summary) {
       setSummaries(prev => ({ ...prev, [requestId]: summary }));
     }
    setIsSummarizing(prev => ({ ...prev, [requestId]: false }));
  };


  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-24" />
               <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <MessagesSquare className="mx-auto h-12 w-12 mb-4" />
        <p>No pending requests right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Request ID: {request.id}</span>
              <Badge variant="outline">Pending</Badge>
            </CardTitle>
            <CardDescription>
              Received {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })} from {request.callerId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-1"><User className="w-4 h-4" /> Question:</label>
                <p className="text-sm p-2 bg-muted rounded">{request.question}</p>
            </div>
             {summaries[request.id] && (
                <div className="space-y-1 p-2 border border-dashed border-accent rounded bg-accent/10">
                    <label className="text-sm font-medium flex items-center gap-1 text-accent"><Wand2 className="w-4 h-4" /> AI Summary:</label>
                    <p className="text-sm">{summaries[request.id]}</p>
                </div>
             )}
            <div className="space-y-1">
              <label htmlFor={`answer-${request.id}`} className="text-sm font-medium flex items-center gap-1">
                <Bot className="w-4 h-4" /> Your Answer:
              </label>
              <Textarea
                id={`answer-${request.id}`}
                placeholder="Type your response here..."
                value={answers[request.id] || ""}
                onChange={(e) => handleAnswerChange(request.id, e.target.value)}
                rows={3}
                disabled={isResolving[request.id]}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
             <div className="flex gap-2">
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSummarizeClick(request.id, request.callerId, request.question)}
                    disabled={isSummarizing[request.id] || !!summaries[request.id]} // Disable if already summarized
                 >
                    {isSummarizing[request.id] ? "Summarizing..." : "Summarize Context"}
                    <Wand2 />
                 </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestClick(request.id, request.question)}
                    disabled={isSuggesting[request.id] || isResolving[request.id]}
                >
                    {isSuggesting[request.id] ? "Suggesting..." : "Suggest Answer"}
                    <Wand2 />
                </Button>
             </div>

            <Button
              onClick={() => handleResolveClick(request.id)}
              disabled={!answers[request.id]?.trim() || isResolving[request.id] || isSuggesting[request.id]}
              size="sm"
            >
              {isResolving[request.id] ? "Resolving..." : "Resolve & Send"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
