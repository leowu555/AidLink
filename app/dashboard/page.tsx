"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth-store";
import { useLanguageStore } from "@/lib/language-store";
import { t } from "@/lib/translations";
import { OrganizerMap } from "@/components/OrganizerMap";
import { LogIn } from "lucide-react";

export default function DashboardPage() {
  const { role, loginAsOrganizer } = useAuthStore();
  const { lang } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" aria-hidden />
        <span className="sr-only">{t(lang, "loading")}</span>
      </div>
    );
  }

  if (role !== "organizer") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t(lang, "organizerLoginTitle")}</CardTitle>
            <CardDescription>
              {t(lang, "organizerLoginDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Button onClick={loginAsOrganizer} size="lg" className="gap-2 w-full sm:w-auto">
              <LogIn className="h-4 w-4" />
              {t(lang, "loginAsOrganizer")}
            </Button>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              {t(lang, "backToHome")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <OrganizerMap />;
}
