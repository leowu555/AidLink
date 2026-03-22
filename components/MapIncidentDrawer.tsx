"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Trash2 } from "lucide-react";
import type { MapIncident } from "@/types/incident-json";
import { CRITICALITY_META } from "@/lib/criticality-meta";
import { useLanguageStore } from "@/lib/language-store";
import { t, getCriticalityLabel, type TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

const VERIFICATION_KEYS: Record<string, "verificationInitial" | "verificationConfident" | "verificationVerified"> = {
  initial_reports: "verificationInitial",
  confident: "verificationConfident",
  verified: "verificationVerified",
};

interface MapIncidentDrawerProps {
  incident: MapIncident;
  onClose: () => void;
  /** When provided (organizer context), shows Remove Incident button */
  onRemove?: (incidentId: string) => void;
  /** When provided (organizer context), makes Summary editable and persists to backend */
  onSummarySave?: (incidentId: string, summary: string) => void | Promise<void>;
}

export function MapIncidentDrawer({ incident, onClose, onRemove, onSummarySave }: MapIncidentDrawerProps) {
  const { lang } = useLanguageStore();
  const meta = CRITICALITY_META[incident.criticality];
  const [summaryDraft, setSummaryDraft] = useState<string>(incident.summary ?? "");
  const [isSavingSummary, setIsSavingSummary] = useState(false);

  useEffect(() => {
    setSummaryDraft(incident.summary ?? "");
  }, [incident.summary]);

  const saveSummary = useCallback(async () => {
    if (!onSummarySave || summaryDraft === (incident.summary ?? "")) return;
    setIsSavingSummary(true);
    try {
      await onSummarySave(incident.id, summaryDraft);
    } finally {
      setIsSavingSummary(false);
    }
  }, [incident.id, incident.summary, onSummarySave, summaryDraft]);

  const handleSummaryBlur = () => {
    if (summaryDraft !== (incident.summary ?? "")) saveSummary();
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col overflow-y-auto border-l bg-gradient-to-b from-background to-muted/20 shadow-2xl",
        "animate-in slide-in-from-right duration-200"
      )}
    >
      <div className="sticky top-0 z-10 flex shrink-0 flex-col gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 flex-1 text-lg font-semibold">{incident.title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0" aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span
            className="rounded-md border px-2.5 py-1.5 text-xs font-semibold"
            style={{ borderColor: meta.stroke, color: meta.stroke, backgroundColor: `${meta.stroke}15` }}
          >
            {getCriticalityLabel(lang, incident.criticality)}
          </span>
          <span
            className="rounded-md border px-2.5 py-1.5 text-xs font-semibold"
            style={{
              borderColor: "var(--border)",
              color: "hsl(var(--foreground))",
              backgroundColor: "hsl(var(--muted))",
            }}
          >
            {t(lang, (VERIFICATION_KEYS[incident.verification] ?? "verificationInitial") as TranslationKey)}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5">

        <div className="rounded-xl border bg-card/50 p-4 text-sm shadow-sm">
          <p className="font-medium text-muted-foreground mb-2">{t(lang, "summary")}</p>
          {onSummarySave ? (
            <>
              <textarea
                value={summaryDraft}
                onChange={(e) => setSummaryDraft(e.target.value)}
                onBlur={handleSummaryBlur}
                placeholder="Add or edit the incident summary…"
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-y"
              />
              {summaryDraft !== (incident.summary ?? "") && (
                <Button
                  size="sm"
                  className="mt-2"
                  disabled={isSavingSummary}
                  onClick={saveSummary}
                >
                  {isSavingSummary ? "Saving…" : "Save summary"}
                </Button>
              )}
            </>
          ) : (
            <p className="mt-1">{incident.summary ?? "—"}</p>
          )}
        </div>

        <div className="rounded-xl border bg-card/50 p-4 text-sm shadow-sm">
          <p className="font-medium text-muted-foreground">{t(lang, "timeOfIncident")}</p>
          <p className="font-medium">{new Date(incident.reportedAt).toLocaleString()}</p>
          {incident.timeSince && (
            <p className="mt-1 text-xs text-muted-foreground">
              {incident.timeSince} {t(lang, "sinceIncident")}
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-card/50 p-4 text-sm shadow-sm">
          <p className="font-medium text-muted-foreground">{t(lang, "location")}</p>
          <p className="font-medium">
            {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
          </p>
          {incident.radiusKm != null && incident.radiusKm > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t(lang, "radiusTriangulated", { n: String(incident.radiusKm) })}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border bg-muted/30 p-4 shadow-sm">
            <p className="text-muted-foreground">{t(lang, "casualtiesEst")}</p>
            <p className="text-lg font-semibold">{incident.casualtiesEstimate}</p>
            <p className="text-xs text-muted-foreground capitalize">{incident.casualtiesCategory}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4 shadow-sm">
            <p className="text-muted-foreground">{t(lang, "manpowerNeeded")}</p>
            <p className="text-lg font-semibold">{incident.manpowerEstimate}</p>
            <p className="text-xs text-muted-foreground capitalize">{incident.manpowerCategory}</p>
          </div>
        </div>

        {incident.media.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">{t(lang, "media")}</p>
            <div className="grid grid-cols-2 gap-2">
              {incident.media
                .filter((m) => m.type === "image")
                .slice(0, 6)
                .map((m, i) => (
                  <a
                    key={i}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-video overflow-hidden rounded-lg border bg-muted"
                  >
                    <img
                      src={m.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </a>
                ))}
              {incident.media
                .filter((m) => m.type === "video")
                .slice(0, 4)
                .map((m, i) => (
                  <a
                    key={`v-${i}`}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs transition-colors hover:bg-accent/50"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Video {i + 1}</span>
                  </a>
                ))}
            </div>
          </div>
        )}

        {incident.posts.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">{t(lang, "sourcePosts")}</p>
            <ul className="space-y-2">
              {incident.posts.slice(0, 5).map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border bg-card/50 px-3 py-2 text-xs transition-colors hover:bg-accent/50"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{url}</span>
                  </a>
                </li>
              ))}
              {incident.posts.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{incident.posts.length - 5} more
                </p>
              )}
            </ul>
          </div>
        )}

        <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
          <span className="text-muted-foreground">{t(lang, "offerToHelp")}: </span>
          <a
            href="tel:02-2929984"
            className="font-medium text-primary hover:underline"
          >
            Tel: 02-2929984
          </a>
        </div>

        {onRemove && (
          <div className="border-t pt-4">
            <Button
              variant="destructive"
              className="w-full gap-2 bg-red-600 hover:bg-red-700"
              onClick={() => onRemove(incident.id)}
            >
              <Trash2 className="h-4 w-4" />
              {t(lang, "removeIncident")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
