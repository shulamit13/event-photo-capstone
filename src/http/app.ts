import express from "express";
import { store } from "../data/memory-store.js";
import { EventService } from "../services/event-service.js";

export function createApp() {
  const app = express();
  const events = new EventService(store);
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.get("/api/events", (req, res) => {
    const photographerId = req.header("x-photographer-id");
    if (!photographerId) return res.status(401).json({ error: "Missing demo photographer identity" });
    return res.json(events.listEvents(photographerId));
  });

  app.get("/api/events/:eventId/gallery", (req, res) => {
    const photographerId = req.header("x-photographer-id");
    if (!photographerId) return res.status(401).json({ error: "Missing demo photographer identity" });
    const gallery = events.getGallery(req.params.eventId, photographerId);
    if (!gallery) return res.status(404).json({ error: "Event not found" });
    return res.json(gallery);
  });

  app.get("/client/events/:eventId/gallery", (req, res) => {
    const clientId = req.header("x-client-id");
    if (!clientId) return res.status(401).json({ error: "Missing demo client identity" });
    const gallery = events.getClientGallery(req.params.eventId, clientId);
    if (!gallery) return res.status(404).json({ error: "Gallery not found" });
    return res.json(gallery);
  });

  app.post("/api/events/:eventId/selections", (req, res) => {
    const clientId = req.header("x-client-id");
    if (!clientId) return res.status(401).json({ error: "Missing demo client identity" });

    const { photoIds, requestedServices } = req.body ?? {};
    if (!Array.isArray(photoIds) || !Array.isArray(requestedServices)) {
      return res.status(400).json({ error: "photoIds and requestedServices must be arrays" });
    }

    const selection = events.submitSelection(
      req.params.eventId,
      clientId,
      photoIds,
      requestedServices
    );
    if (!selection) return res.status(404).json({ error: "Gallery not found" });
    return res.status(201).json(selection);
  });



app.patch("/api/events/:id/title", (req, res) => {
    const photographerId = req.header("x-photographer-id");
    if (!photographerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { title } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "Invalid title" });
    }

    const event = store.findEventForPhotographer(id, photographerId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    event.title = title;
    return res.status(200).json(event);
  });
    return app;

  };