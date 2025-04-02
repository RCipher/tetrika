import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBookingSchema, bookingFormSchema } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all teachers
  app.get("/api/teachers", async (_req: Request, res: Response) => {
    try {
      const teachers = await storage.getTeachers();
      return res.json(teachers);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  // Get teacher by ID
  app.get("/api/teachers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid teacher ID" });
      }
      
      const teacher = await storage.getTeacherById(id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      return res.json(teacher);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });

  // Get all time slots
  app.get("/api/timeslots", async (_req: Request, res: Response) => {
    try {
      const timeSlots = await storage.getTimeSlots();
      return res.json(timeSlots);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  // Get time slots by teacher ID
  app.get("/api/teachers/:id/timeslots", async (req: Request, res: Response) => {
    try {
      const teacherId = parseInt(req.params.id);
      if (isNaN(teacherId)) {
        return res.status(400).json({ message: "Invalid teacher ID" });
      }
      
      const timeSlots = await storage.getTimeSlotsByTeacher(teacherId);
      return res.json(timeSlots);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  // Get time slot by ID
  app.get("/api/timeslots/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid time slot ID" });
      }
      
      const timeSlot = await storage.getTimeSlotById(id);
      if (!timeSlot) {
        return res.status(404).json({ message: "Time slot not found" });
      }
      
      return res.json(timeSlot);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch time slot" });
    }
  });

  // Create a booking
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = bookingFormSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid booking data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { 
        timeSlotId, teacherId, studentName, studentGrade, 
        parentName, phone, email, comments 
      } = validationResult.data;
      
      // Check if the time slot exists and is not already booked
      const timeSlot = await storage.getTimeSlotById(timeSlotId);
      if (!timeSlot) {
        return res.status(404).json({ message: "Time slot not found" });
      }
      
      if (timeSlot.isBooked) {
        return res.status(400).json({ message: "Time slot is already booked" });
      }
      
      // Generate a booking ID
      const bookingId = `BR-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Create the booking
      const bookingData = {
        bookingId,
        timeSlotId,
        teacherId,
        studentName,
        studentGrade,
        parentName: parentName || "",
        phone,
        email,
        comments: comments || ""
      };
      
      const booking = await storage.createBooking(bookingData);
      
      return res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      return res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get all bookings (for admin)
  app.get("/api/bookings", async (_req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookings();
      return res.json(bookings);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
