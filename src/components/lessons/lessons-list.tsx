"use client";

import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type LessonStatus = "PENDING" | "IN_PROGRESS" | "FINISHED";

type RelatedUser = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

type RelatedHorse = {
  id: string;
  name?: string | null;
};

type Lesson = {
  id: string;
  date: string;
  desc: string;
  status: LessonStatus;
  monitor?: RelatedUser | null;
  customer?: RelatedUser | null;
  horse?: RelatedHorse | null;
};

type LessonsResponse = {
  success: boolean;
  data?: Lesson[] | Lesson | null;
  error?: string;
};

const statusVariant: Record<LessonStatus, "outline" | "secondary" | "default"> = {
  PENDING: "outline",
  IN_PROGRESS: "secondary",
  FINISHED: "default",
};

const statusLabel: Record<LessonStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  FINISHED: "Finished",
};

const mapToArray = (payload: LessonsResponse["data"]): Lesson[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") return [payload];
  return [];
};

const formatUser = (user?: RelatedUser | null) => {
  if (!user) return "—";
  const names = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (names) return names;
  return user.email ?? "—";
};

const formatDateTime = (date: string) => {
  try {
    return new Date(date).toLocaleString();
  } catch (error) {
    return date;
  }
};

export function LessonsList() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/lessons?take=100", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Unable to load lessons (status ${response.status})`);
        }

        const payload = (await response.json()) as LessonsResponse;

        if (!payload.success) {
          throw new Error(payload.error ?? "The lessons API returned an error");
        }

        setLessons(mapToArray(payload.data));
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unexpected error while loading lessons";
        setError(message);
        setLessons([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => controller.abort();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
        Loading lessons…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-destructive/40 bg-destructive/5 p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">Failed to load lessons</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <div>
          <Button size="sm" onClick={() => setRefreshKey((value) => value + 1)}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        No lessons found yet. Create your first lesson to see it listed here.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Horse</TableHead>
            <TableHead>Monitor</TableHead>
            <TableHead>Customer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.map((lesson) => (
            <TableRow key={lesson.id}>
              <TableCell>{formatDateTime(lesson.date)}</TableCell>
              <TableCell className="max-w-[260px] truncate" title={lesson.desc}>
                {lesson.desc}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[lesson.status] ?? "outline"}>
                  {statusLabel[lesson.status] ?? lesson.status}
                </Badge>
              </TableCell>
              <TableCell>{lesson.horse?.name ?? "—"}</TableCell>
              <TableCell>{formatUser(lesson.monitor)}</TableCell>
              <TableCell>{formatUser(lesson.customer)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
