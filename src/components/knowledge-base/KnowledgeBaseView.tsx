"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KnowledgeBaseEntry } from "@/types";
import { getKnowledgeBaseEntries } from "@/lib/db"; // Import DB function
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { BrainCircuit } from "lucide-react"; // Import icon

export default function KnowledgeBaseView() {
  const [entries, setEntries] = React.useState<KnowledgeBaseEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const data = await getKnowledgeBaseEntries();
        setEntries(data);
      } catch (error) {
        console.error("Error fetching knowledge base entries:", error);
        toast({
          title: "Error",
          description: "Failed to load knowledge base.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [toast]);

  if (isLoading) {
    return (
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <BrainCircuit className="h-5 w-5" /> Learned Answers
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead><Skeleton className="h-4 w-3/4" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-1/2" /></TableHead>
                     <TableHead className="w-[180px]"><Skeleton className="h-4 w-24" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                         <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <BrainCircuit className="h-5 w-5" /> Learned Answers
          </CardTitle>
         </CardHeader>
         <CardContent>
            <div className="text-center py-10 text-muted-foreground border rounded-lg">
                <BrainCircuit className="mx-auto h-12 w-12 mb-4" />
                <p>The knowledge base is currently empty.</p>
                <p className="text-sm">Answers provided by supervisors will appear here.</p>
            </div>
         </CardContent>
       </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
           <BrainCircuit className="h-5 w-5" /> Learned Answers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Answer</TableHead>
                    <TableHead className="w-[180px]">Last Updated</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {entries.map((entry) => (
                    <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.question}</TableCell>
                    <TableCell>{entry.answer}</TableCell>
                    <TableCell>{format(new Date(entry.updatedAt), "PPp")}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
