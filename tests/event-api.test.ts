import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/http/app.js";
import { store } from "../src/data/memory-store.js";

const app = createApp();

beforeEach(() => {
  store.selections = [];
});

describe("event photographer API", () => {
  it("requires a demo photographer identity", async () => {
    const response = await request(app).get("/api/events");
    expect(response.status).toBe(401);
  });

  it("lists only events belonging to the requested photographer", async () => {
    const response = await request(app)
      .get("/api/events")
      .set("x-photographer-id", "studio-amber");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe("event-100");
  });

  it("does not return another photographer's event", async () => {
    const response = await request(app)
      .get("/api/events/event-200/gallery")
      .set("x-photographer-id", "studio-amber");

    expect(response.status).toBe(404);
  });

  it("allows a client to submit a selection for their own gallery", async () => {
    const response = await request(app)
      .post("/api/events/event-100/selections")
      .set("x-client-id", "client-100")
      .send({ photoIds: ["photo-1"], requestedServices: ["retouching"] });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("submitted");
  });

  it("does not let a client access a different client's gallery", async () => {
    const response = await request(app)
      .get("/client/events/event-200/gallery")
      .set("x-client-id", "client-100");

    expect(response.status).toBe(404);
  });
});

it("allows a photographer to rename their event title", async () => {
    const response = await request(app)
      .patch("/api/events/event-100/title")
      .set("x-photographer-id", "studio-amber")
      .send({ title: "New Event Title" });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("New Event Title");
  });

  it("prevents renaming an event belonging to another photographer", async () => {
    const response = await request(app)
      .patch("/api/events/event-200/title")
      .set("x-photographer-id", "studio-amber")
      .send({ title: "Hacked Title" });

    expect(response.status).toBe(404);
  });

  it("requires a photographer ID header for renaming", async () => {
    const response = await request(app)
      .patch("/api/events/event-100/title")
      .send({ title: "New Title" });

    expect(response.status).toBe(401);
  });

  it("validates that the new title is not empty", async () => {
    const response = await request(app)
      .patch("/api/events/event-100/title")
      .set("x-photographer-id", "studio-amber")
      .send({ title: "" });

    expect(response.status).toBe(400);
  });