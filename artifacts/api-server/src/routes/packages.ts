import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, packagesTable } from "@workspace/db";
import {
  ListPackagesQueryParams,
  ListPackagesResponse,
  CreatePackageBody,
  GetPackageParams,
  GetPackageResponse,
  UpdatePackageParams,
  UpdatePackageBody,
  UpdatePackageResponse,
  DeletePackageParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/packages", async (req, res): Promise<void> => {
  const queryParams = ListPackagesQueryParams.safeParse(req.query);
  let query = db.select().from(packagesTable).$dynamic();
  if (queryParams.success && queryParams.data.orgId) {
    query = query.where(eq(packagesTable.orgId, queryParams.data.orgId));
  }
  const packages = await query.orderBy(packagesTable.createdAt);
  res.json(ListPackagesResponse.parse(packages.map(p => ({ ...p, price: Number(p.price) }))));
});

router.post("/packages", async (req, res): Promise<void> => {
  const parsed = CreatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [pkg] = await db.insert(packagesTable).values({ ...parsed.data, price: String(parsed.data.price) }).returning();
  res.status(201).json(GetPackageResponse.parse({ ...pkg, price: Number(pkg.price) }));
});

router.get("/packages/:id", async (req, res): Promise<void> => {
  const params = GetPackageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, params.data.id));
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  res.json(GetPackageResponse.parse({ ...pkg, price: Number(pkg.price) }));
});

router.patch("/packages/:id", async (req, res): Promise<void> => {
  const params = UpdatePackageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price !== undefined) updateData.price = String(parsed.data.price);
  const [pkg] = await db.update(packagesTable).set(updateData).where(eq(packagesTable.id, params.data.id)).returning();
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  res.json(UpdatePackageResponse.parse({ ...pkg, price: Number(pkg.price) }));
});

router.delete("/packages/:id", async (req, res): Promise<void> => {
  const params = DeletePackageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [pkg] = await db.delete(packagesTable).where(eq(packagesTable.id, params.data.id)).returning();
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
