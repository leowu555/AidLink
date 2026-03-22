"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AidLinkLogo } from "@/components/AidLinkLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/lib/auth-store";
import { useLanguageStore } from "@/lib/language-store";
import { REGIONS } from "@/lib/regions";
import type { RegionId, LangCode } from "@/lib/region-types";
import { t } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, ArrowLeft } from "lucide-react";

interface RegionReport {
  region: string;
  overall_state: string;
  priority_incidents: string[];
  resource_allocation: string;
  manpower_summary: string;
  additional_support: string;
  confidence_in_data: string | null;
  generated_at: string | null;
}

const LANG_LABELS: Record<LangCode, string> = {
  en: "English",
  ar: "العربية",
  uk: "Українська",
};

const VALID_REGIONS = ["gaza", "ukraine"] as const;

function RegionSummaryContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawRegion = (params?.region as string) ?? "gaza";
  const region = VALID_REGIONS.includes(rawRegion as (typeof VALID_REGIONS)[number])
    ? rawRegion
    : "gaza";
  const langParam = searchParams.get("lang") as LangCode | null;
  const { role, loginAsOrganizer } = useAuthStore();
  const { lang, setLang } = useLanguageStore();

  const regionConfig = REGIONS[region as RegionId];
  const langResolved: LangCode =
    langParam && regionConfig?.languages.includes(langParam) ? langParam : lang;

  const [report, setReport] = useState<RegionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!VALID_REGIONS.includes(region as (typeof VALID_REGIONS)[number])) {
      router.replace("/dashboard?region=gaza");
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/region-reports?region=${region}`)
      .then((r) => r.json())
      .then((data) => {
        setReport(data.report ?? null);
      })
      .catch((e) => {
        setError(e.message);
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [region, router]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (role !== "organizer") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t(langResolved, "organizerLoginTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t(langResolved, "organizerLoginDesc")}</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Button onClick={loginAsOrganizer} size="lg" className="gap-2 w-full sm:w-auto">
              <LogIn className="h-4 w-4" />
              {t(langResolved, "loginAsOrganizer")}
            </Button>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              {t(langResolved, "backToHome")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const regionName = regionConfig?.name[langResolved] ?? regionConfig?.name.en ?? region;
  const availableLangs = regionConfig?.languages ?? ["en"];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <AidLinkLogo className="ml-2 sm:ml-4" />
          <nav className="flex items-center justify-end gap-2 sm:gap-3">
            <Link href="/" className="shrink-0">
              <Button variant="outline" size="sm" className="h-9">
                {t(langResolved, "home")}
              </Button>
            </Link>
            <Link href={`/map?region=${region}&lang=${langResolved}`} className="shrink-0">
              <Button variant="outline" size="sm" className="h-9">
                {t(langResolved, "crisisMap")}
              </Button>
            </Link>
            <Link href={`/dashboard?region=${region}&lang=${langResolved}`} className="shrink-0">
              <Button variant="outline" size="sm" className="h-9">
                {t(langResolved, "organizerMap")}
              </Button>
            </Link>
            <Select
              value={langResolved}
              onValueChange={(v) => {
                const newLang = v as LangCode;
                setLang(newLang);
                router.replace(`/dashboard/summary/${region}?lang=${newLang}`);
              }}
            >
              <SelectTrigger className="w-[100px] sm:w-[110px] h-9 shrink-0" aria-label={t(langResolved, "selectLanguage")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLangs.map((code) => (
                  <SelectItem key={code} value={code}>
                    {LANG_LABELS[code] ?? code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 sm:px-6 lg:px-8 max-w-3xl">
        <Link
          href={`/dashboard?region=${region}&lang=${langResolved}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t(langResolved, "backToOrganizerMap")}
        </Link>

        <h1 className="text-2xl font-bold mb-2">
          {t(langResolved, "regionSummary")} — {regionName}
        </h1>

        {loading && (
          <div className="py-12 text-center text-muted-foreground">
            {t(langResolved, "loading")}
          </div>
        )}

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6 text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {!loading && !error && !report && (
          <Card>
            <CardContent className="pt-6 text-muted-foreground">
              {t(langResolved, "noRegionReport")}
            </CardContent>
          </Card>
        )}

        {!loading && !error && report && (
          <div className="space-y-6">
            {report.generated_at && (
              <p className="text-sm text-muted-foreground">
                {t(langResolved, "lastUpdated")}: {new Date(report.generated_at).toLocaleString()}
              </p>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t(langResolved, "overallState")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{report.overall_state}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t(langResolved, "priorityIncidents")}</CardTitle>
              </CardHeader>
              <CardContent>
                {report.priority_incidents.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {report.priority_incidents.map((id) => (
                      <li key={id} className="font-mono text-sm">
                        {id}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">—</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t(langResolved, "resourceAllocation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{report.resource_allocation || "—"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t(langResolved, "manpowerSummary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{report.manpower_summary || "—"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t(langResolved, "additionalSupport")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{report.additional_support || "—"}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default function RegionSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
      }
    >
      <RegionSummaryContent />
    </Suspense>
  );
}
