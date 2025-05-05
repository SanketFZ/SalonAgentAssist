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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { HelpRequest } from "@/types";
import { format } from "date-fns";
import { CheckCircle, XCircle, AlertCircle, History } from 'lucide-react'; // Import icons

interface RequestHistoryProps {
  requests: HelpRequest[];
  isLoading: boolean;
}

const StatusBadge = ({ status }: { status: HelpRequest["status"] }) => {
  switch (status) {
    case "resolved":
      return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle className="mr-1 h-3 w-3" />Resolved</Badge>;
    case "unresolved":
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Unresolved</Badge>;
    case "pending": // Should not appear here, but handle just in case
       return <Badge variant="outline"><AlertCircle className="mr-1 h-3 w-3" />Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};


export default function RequestHistory({ requests, isLoading }: RequestHistoryProps) {
  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead><Skeleton className="h-4 w-32" /></TableHead>
               <TableHead><Skeleton className="h-4 w-32" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
               <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                 <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

    if (requests.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border rounded-lg">
         <History className="mx-auto h-12 w-12 mb-4" />
        <p>No historical requests found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
             <TableHead className="w-[150px]">Status</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Answer</TableHead>
            <TableHead className="w-[180px]">Created</TableHead>
            <TableHead className="w-[180px]">Resolved/Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.id}</TableCell>
              <TableCell><StatusBadge status={request.status} /></TableCell>
              <TableCell>{request.question}</TableCell>
              <TableCell>{request.supervisorAnswer ?? "N/A"}</TableCell>
              <TableCell>{format(new Date(request.createdAt), "PPp")}</TableCell>
              <TableCell>
                {request.resolvedAt
                  ? format(new Date(request.resolvedAt), "PPp")
                  : request.status === 'unresolved' ? 'Timed Out' : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
