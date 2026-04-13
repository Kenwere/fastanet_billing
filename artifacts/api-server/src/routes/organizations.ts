import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, organizationsTable } from "@workspace/db";
import {
  ListOrganizationsResponse,
  CreateOrganizationBody,
  GetOrganizationParams,
  GetOrganizationResponse,
  UpdateOrganizationParams,
  UpdateOrganizationBody,
  UpdateOrganizationResponse,
  DeleteOrganizationParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/organizations", async (_req, res): Promise<void> => {
  const orgs = await db.select().from(organizationsTable).orderBy(organizationsTable.createdAt);
  res.json(ListOrganizationsResponse.parse(orgs));
});

router.post("/organizations", async (req, res): Promise<void> => {
  const parsed = CreateOrganizationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [org] = await db.insert(organizationsTable).values(parsed.data).returning();
  res.status(201).json(GetOrganizationResponse.parse(org));
});

router.get("/organizations/:id", async (req, res): Promise<void> => {
  const params = GetOrganizationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.id, params.data.id));
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }
  res.json(GetOrganizationResponse.parse(org));
});

router.patch("/organizations/:id", async (req, res): Promise<void> => {
  const params = UpdateOrganizationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOrganizationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [org] = await db.update(organizationsTable).set(parsed.data).where(eq(organizationsTable.id, params.data.id)).returning();
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }
  res.json(UpdateOrganizationResponse.parse(org));
});

router.delete("/organizations/:id", async (req, res): Promise<void> => {
  const params = DeleteOrganizationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [org] = await db.delete(organizationsTable).where(eq(organizationsTable.id, params.data.id)).returning();
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
