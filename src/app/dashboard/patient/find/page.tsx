"use client";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { DoctorDirectory } from "@/components/doctors/DoctorDirectory";

export default function FindDoctor() {
  return (
    <>
      <PageHeader title="Find a doctor" subtitle="Browse verified specialists and open a profile to book a time." />
      <DoctorDirectory />
    </>
  );
}
