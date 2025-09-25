"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  revokeOtherSessionsAction,
  revokeSessionAction,
} from "@/app/dashboard/settings/actions";
import { Button } from "@/components/ui/button";

export type SessionPreview = {
  token: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
};

type Feedback = {
  status: "success" | "error";
  message: string;
};

type SessionsClientCardProps = {
  sessions: SessionPreview[];
};

export function SessionsClientCard({ sessions }: SessionsClientCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        if (a.isCurrent) return -1;
        if (b.isCurrent) return 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }),
    [sessions],
  );

  const handleRevoke = (token: string) => {
    setActiveToken(token);
    setFeedback(null);
    startTransition(async () => {
      const result = await revokeSessionAction(token);
      setFeedback(result);
      if (result.status === "success") {
        router.refresh();
      }
      setActiveToken(null);
    });
  };

  const handleRevokeOthers = () => {
    setActiveToken("__all__");
    setFeedback(null);
    startTransition(async () => {
      const result = await revokeOtherSessionsAction();
      setFeedback(result);
      if (result.status === "success") {
        router.refresh();
      }
      setActiveToken(null);
    });
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Vous etes actuellement connecte sur {sessions.length} session
            {sessions.length === 1 ? "" : "s"}.
          </p>
          {feedback ? (
            <p
              className={`text-sm ${feedback.status === "success" ? "text-emerald-600 dark:text-emerald-500" : "text-destructive"}`}
            >
              {feedback.message}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleRevokeOthers}
          disabled={isPending}
        >
          {isPending && activeToken === "__all__"
            ? "Deconnexion..."
            : "Deconnecter les autres sessions"}
        </Button>
      </div>

      <div className="grid gap-3">
        {sortedSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune session active.
          </p>
        ) : (
          sortedSessions.map((session) => (
            <div
              key={session.token}
              className="rounded-lg border bg-muted/30 p-4 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-muted/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {session.isCurrent
                      ? "Cet appareil"
                      : session.userAgent || "Appareil inconnu"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.ipAddress || "Adresse IP indisponible"} · Derniere activite{" "}
                    {formatRelative(session.updatedAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Debut {formatDate(session.createdAt)} · Expire le{" "}
                    {formatDate(session.expiresAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={session.isCurrent ? "ghost" : "outline"}
                  disabled={session.isCurrent || isPending}
                  onClick={() => handleRevoke(session.token)}
                >
                  {session.isCurrent
                    ? "Active"
                    : isPending && activeToken === session.token
                      ? "Suppression..."
                      : "Deconnecter"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatRelative(value: string) {
  try {
    const formatter = new Intl.RelativeTimeFormat("fr-FR", {
      style: "short",
    });
    const target = new Date(value);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    if (Math.abs(diffMinutes) < 60) {
      return formatter.format(diffMinutes, "minute");
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
      return formatter.format(diffHours, "hour");
    }

    const diffDays = Math.round(diffHours / 24);
    return formatter.format(diffDays, "day");
  } catch (error) {
    console.error("formatRelative", error);
    return new Date(value).toLocaleString();
  }
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(value));
  } catch (error) {
    console.error("formatDate", error);
    return new Date(value).toLocaleString();
  }
}
