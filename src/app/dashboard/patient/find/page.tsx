"use client";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { DoctorDirectory } from "@/components/doctors/DoctorDirectory";
import { useI18n } from "@/i18n/client";

export default function FindDoctor() {
  const { t } = useI18n();
  return (<><PageHeader title={t("dnav.find")} subtitle={t("find.subtitle")} /><DoctorDirectory /></>);
}
