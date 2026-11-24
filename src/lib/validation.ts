import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(160);
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128)
  .regex(/[A-Za-z]/, "Password must contain a letter.")
  .regex(/[0-9]/, "Password must contain a number.");
const name = z.string().trim().min(2, "Name is too short.").max(120);
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

export const registerSchema = z.object({
  full_name: name,
  email,
  password,
  role: z.enum(["patient", "doctor"]).default("patient"),
  specialization_id: z.coerce.number().int().positive().optional(),
});

export const loginSchema = z.object({ email, password: z.string().min(1, "Password is required.").max(128) });

export const doctorCreateSchema = z.object({
  full_name: name,
  email,
  password,
  specialization_id: z.coerce.number().int().positive(),
  title: z.string().trim().max(40).default("MD"),
  bio: z.string().trim().max(1200).default(""),
  years_experience: z.coerce.number().int().min(0).max(70).default(0),
  consultation_fee: z.coerce.number().min(0).max(100000).default(0),
  clinic_name: z.string().trim().max(160).default(""),
  city: z.string().trim().max(80).default(""),
  languages: z.string().trim().max(160).default("English"),
  is_verified: z.boolean().default(false),
});

export const doctorUpdateSchema = z.object({
  full_name: name.optional(),
  specialization_id: z.coerce.number().int().positive().optional(),
  title: z.string().trim().max(40).optional(),
  bio: z.string().trim().max(1200).optional(),
  years_experience: z.coerce.number().int().min(0).max(70).optional(),
  consultation_fee: z.coerce.number().min(0).max(100000).optional(),
  clinic_name: z.string().trim().max(160).optional(),
  city: z.string().trim().max(80).optional(),
  languages: z.string().trim().max(160).optional(),
  is_verified: z.boolean().optional(), // admin only — enforced in the handler
  schedule: z
    .array(
      z.object({
        day_of_week: z.number().int().min(0).max(6),
        start_time: z.string().regex(/^\d{2}:\d{2}$/),
        end_time: z.string().regex(/^\d{2}:\d{2}$/),
        slot_minutes: z.union([z.literal(15), z.literal(20), z.literal(30), z.literal(45), z.literal(60)]).default(30),
        is_active: z.boolean().default(true),
      }).refine((s) => s.end_time > s.start_time, "End time must be after start time."),
    )
    .max(7)
    .optional(),
});

export const appointmentCreateSchema = z.object({
  doctor_id: z.string().uuid("Choose a doctor."),
  scheduled_at: z.string().datetime({ offset: true, message: "Choose a valid date and time." }),
  reason: z.string().trim().min(3, "Please describe the reason for your visit.").max(500),
  visit_type: z.enum(["in_person", "video"]).default("in_person"),
});

export const appointmentUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  scheduled_at: z.string().datetime({ offset: true }).optional(),
  doctor_notes: optionalText(2000),
  reason: z.string().trim().min(3).max(500).optional(),
  create_visit_record: z.boolean().optional(),
});

export const patientProfileSchema = z.object({
  full_name: name.optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.").optional().nullable(),
  gender: z.enum(["female", "male", "other", "prefer_not_to_say"]).optional().nullable(),
  phone: z.string().trim().max(40).regex(/^[+0-9 ()-]*$/, "Phone may contain digits, spaces, +, - and ().").optional().nullable(),
  blood_type: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional().nullable(),
  height_cm: z.coerce.number().min(40).max(260).optional().nullable(),
  weight_kg: z.coerce.number().min(2).max(400).optional().nullable(),
  allergies: optionalText(500),
  chronic_conditions: optionalText(500),
  emergency_contact: optionalText(200),
});

export const vitalsSchema = z.object({
  weight_kg: z.coerce.number().min(2).max(400).optional(),
  systolic: z.coerce.number().int().min(50).max(260).optional(),
  diastolic: z.coerce.number().int().min(30).max(160).optional(),
  heart_rate: z.coerce.number().int().min(25).max(250).optional(),
  glucose_mmol: z.coerce.number().min(1).max(40).optional(),
}).refine((v) => Object.values(v).some((x) => x !== undefined), "Enter at least one measurement.");

export const chatSchema = z.object({
  message: z.string().trim().min(1, "Type a message.").max(2000, "Messages are limited to 2000 characters."),
  conversation_id: z.string().uuid().optional().nullable(),
});

export const symptomSchema = z.object({
  symptoms: z.array(z.string().trim().min(2).max(80)).min(1, "Add at least one symptom.").max(10),
  duration: z.enum(["hours", "days", "weeks", "months"]).optional(),
  age_group: z.enum(["child", "adult", "older_adult"]).optional(),
});

export const userAdminUpdateSchema = z.object({
  is_active: z.boolean().optional(),
  role: z.enum(["patient", "doctor", "admin"]).optional(),
});
