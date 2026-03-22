"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/lib/language-store";
import { t } from "@/lib/translations";
import type { TranslationKey } from "@/lib/translations";

interface SafetyNoticeProps {
  text?: string;
  textKey?: TranslationKey;
  className?: string;
}

export function SafetyNotice({
  text,
  textKey,
  className,
}: SafetyNoticeProps) {
  const { lang } = useLanguageStore();
  const displayText =
    text ?? (textKey ? t(lang, textKey) : t(lang, "safetyNoticeDefault"));

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="text-sm font-medium">{displayText}</p>
    </div>
  );
}
