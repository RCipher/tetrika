import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Teacher model
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  email: text("email").notNull(),
  grades: text("grades").notNull(),
  rating: text("rating").default("0"),
  reviewCount: integer("review_count").default(0),
  avatar: text("avatar").notNull(),
  isAvailable: boolean("is_available").default(true),
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({
  id: true
});

// TimeSlot model
export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  dayOfWeek: text("day_of_week").notNull(), // 'mon', 'tue', etc.
  date: text("date").notNull(), // 'YYYY-MM-DD' formatted
  startTime: text("start_time").notNull(), // 'HH:MM' formatted
  endTime: text("end_time").notNull(), // 'HH:MM' formatted
  isBooked: boolean("is_booked").default(false),
  subject: text("subject").notNull(),
  isOverbooking: boolean("is_overbooking").default(false), // Флаг для овербукинг-слотов (45 мин vs обычные 60 мин)
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true
});

// Booking model
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingId: text("booking_id").notNull().unique(),
  timeSlotId: integer("time_slot_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  studentName: text("student_name").notNull(),
  studentGrade: text("student_grade").notNull(),
  parentName: text("parent_name"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true
});

// Types
export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;

export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Extended validation schema for booking form
export const bookingFormSchema = z.object({
  timeSlotId: z.number(),
  teacherId: z.number(),
  studentName: z.string().min(3, "ФИО ученика обязательно"),
  studentGrade: z.string().min(1, "Выберите класс"),
  parentName: z.string().optional(),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email"),
  comments: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "Необходимо согласиться с условиями",
  }),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
