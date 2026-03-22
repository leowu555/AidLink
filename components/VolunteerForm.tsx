"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SKILLS } from "@/types";
import { useLanguageStore } from "@/lib/language-store";
import { t } from "@/lib/translations";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  skills: z.array(z.string()).min(1),
  hasVehicle: z.boolean(),
  availableNow: z.boolean(),
  travelRadius: z.number().min(5).max(500),
});

type FormData = z.infer<typeof schema>;

interface VolunteerFormProps {
  onSuccess: (volunteerId: string) => void;
}

export function VolunteerForm({ onSuccess }: VolunteerFormProps) {
  const { lang } = useLanguageStore();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      skills: [],
      hasVehicle: false,
      availableNow: true,
      travelRadius: 50,
    },
  });

  const skills = watch("skills");

  const toggleSkill = (s: string) => {
    const next = skills.includes(s)
      ? skills.filter((x) => x !== s)
      : [...skills, s];
    setValue("skills", next);
  };

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        status: "AVAILABLE",
      }),
    });
    const json = await res.json();
    if (json.volunteer?.id) onSuccess(json.volunteer.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(lang, "createVolunteerProfile")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t(lang, "createVolunteerHint")}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fullName">{t(lang, "fullName")}</Label>
            <Input id="fullName" {...register("fullName")} className="mt-1" />
            {errors.fullName && (
              <p className="text-sm text-destructive mt-0.5">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">{t(lang, "email")}</Label>
            <Input id="email" type="email" {...register("email")} className="mt-1" />
            {errors.email && (
              <p className="text-sm text-destructive mt-0.5">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">{t(lang, "phoneOptional")}</Label>
            <Input id="phone" {...register("phone")} className="mt-1" />
          </div>
          <div>
            <Label>{t(lang, "skills")} ({t(lang, "skillsHint")})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SKILLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    skills.includes(s)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
            {errors.skills && (
              <p className="text-sm text-destructive mt-0.5">{errors.skills.message}</p>
            )}
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("hasVehicle")}
                className="rounded border"
              />
              <span className="text-sm">{t(lang, "hasVehicle")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("availableNow")}
                className="rounded border"
              />
              <span className="text-sm">{t(lang, "availableNow")}</span>
            </label>
          </div>
          <div>
            <Label htmlFor="travelRadius">{t(lang, "canTravelKm")}</Label>
            <Input
              id="travelRadius"
              type="number"
              {...register("travelRadius", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.travelRadius && (
              <p className="text-sm text-destructive mt-0.5">{errors.travelRadius.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t(lang, "creating") : t(lang, "createProfile")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
