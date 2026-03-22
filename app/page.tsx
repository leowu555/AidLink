"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SafetyNotice } from "@/components/SafetyNotice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Map, LayoutDashboard, Shield, Users } from "lucide-react";
import { REGIONS, REGION_IDS } from "@/lib/regions";
import { useLanguageStore } from "@/lib/language-store";
import { t } from "@/lib/translations";

export default function LandingPage() {
  const { lang, region, setLang, setRegion } = useLanguageStore();
  const regionConfig = REGIONS[region];
  const mapHref = `/map?region=${region}&lang=${lang}`;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        navItems={[
          { href: mapHref, label: t(lang, "crisisMap") },
        ]}
      />

      <main className="flex-1">
        <section className="container py-24 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {t(lang, "heroTitle")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              {t(lang, "heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="region-select" className="text-sm font-medium">
                  {t(lang, "selectRegion")}
                </Label>
                <Select value={region} onValueChange={(v) => setRegion(v as "gaza" | "ukraine")}>
                  <SelectTrigger id="region-select" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGION_IDS.map((id) => (
                      <SelectItem key={id} value={id}>
                        {REGIONS[id].name.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="lang-select" className="text-sm font-medium">
                  {t(lang, "selectLanguage")}
                </Label>
                <Select value={lang} onValueChange={(v) => setLang(v as "en" | "ar" | "uk")}>
                  <SelectTrigger id="lang-select" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regionConfig.languages.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code === "en" ? t(lang, "english") : code === "ar" ? t(lang, "arabic") : t(lang, "ukrainian")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href={mapHref}>
                <Button size="lg" className="gap-2">
                  <Map className="h-4 w-4" />
                  {t(lang, "viewCrisisMap")}
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  {t(lang, "organizerMap")}
                </Button>
              </Link>
            </div>
            <div className="mt-12">
              <SafetyNotice textKey="safetyNoticeDefault" />
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-16">
          <div className="container px-4">
            <h2 className="text-center text-2xl font-semibold mb-12">
              {t(lang, "howItWorks")}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Map className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{t(lang, "reportsMap")}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t(lang, "reportsMapDesc")}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{t(lang, "triageVerify")}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t(lang, "triageVerifyDesc")}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{t(lang, "assignTrack")}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t(lang, "assignTrackDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          {t(lang, "footerTagline")}
        </div>
      </footer>
    </div>
  );
}
