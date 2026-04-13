import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, paymentsTable, ispUsersTable, packagesTable } from "@workspace/db";
import {
  ListPaymentsQueryParams,
  ListPaymentsResponse,
  CreatePaymentBody,
  GetPaymentParams,
  GetPaymentResponse,
  UpdatePaymentParams,
  UpdatePaymentBody,
  UpdatePaymentResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/payments", async (req, res): Promise<void> => {
  const queryParams = ListPaymentsQueryParams.safeParse(req.query);
  let query = db.select({
    id: paymentsTable.id,
    orgId: paymentsTable.orgId,
    userId: paymentsTable.userId,
    packageId: paymentsTable.packageId,
    amount: paymentsTable.amount,
    currency: paymentsTable.currency,
    gateway: paymentsTable.gateway,
    transactionRef: paymentsTable.transactionRef,
    phoneNumber: paymentsTable.phoneNumber,
    status: paymentsTable.status,
    userName: ispUsersTable.fullName,
    packageName: packagesTable.name,
    paidAt: paymentsTable.paidAt,
    createdAt: paymentsTable.createdAt,
  }).from(paymentsTable)
    .leftJoin(ispUsersTable, eq(paymentsTable.userId, ispUsersTable.id))
    .leftJoin(packagesTable, eq(paymentsTable.packageId, packagesTable.id))
    .$dynamic();

  const conditions: ReturnType<typeof eq>[] = [];
  if (queryParams.success) {
    if (queryParams.data.orgId) conditions.push(eq(paymentsTable.orgId, queryParams.data.orgId));
    if (queryParams.data.status) conditions.push(eq(paymentsTable.status, queryParams.data.status));
  }
  if (conditions.length > 0) query = query.where(and(...conditions));
  const payments = await query.orderBy(paymentsTable.createdAt);
  res.json(ListPaymentsResponse.parse(payments.map(p => ({ ...p, amount: Number(p.amount) }))));
});

router.post("/payments", async (req, res): Promise<void> => {
  const parsed = CreatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [payment] = await db.insert(paymentsTable).values({ ...parsed.data, amount: String(parsed.data.amount) }).returning();
  res.status(201).json(GetPaymentResponse.parse({ ...payment, amount: Number(payment.amount), userName: null, packageName: null }));
});

router.get("/payments/:id", async (req, res): Promise<void> => {
  const params = GetPaymentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [payment] = await db.select({
    id: paymentsTable.id,
    orgId: paymentsTable.orgId,
    userId: paymentsTable.userId,
    packageId: paymentsTable.packageId,
    amount: paymentsTable.amount,
    currency: paymentsTable.currency,
    gateway: paymentsTable.gateway,
    transactionRef: paymentsTable.transactionRef,
    phoneNumber: paymentsTable.phoneNumber,
    status: paymentsTable.status,
    userName: ispUsersTable.fullName,
    packageName: packagesTable.name,
    paidAt: paymentsTable.paidAt,
    createdAt: paymentsTable.createdAt,
  }).from(paymentsTable)
    .leftJoin(ispUsersTable, eq(paymentsTable.userId, ispUsersTable.id))
    .leftJoin(packagesTable, eq(paymentsTable.packageId, packagesTable.id))
    .where(eq(paymentsTable.id, params.data.id));
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }
  res.json(GetPaymentResponse.parse({ ...payment, amount: Number(payment.amount) }));
});

router.patch("/payments/:id", async (req, res): Promise<void> => {
  const params = UpdatePaymentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [payment] = await db.update(paymentsTable).set(parsed.data).where(eq(paymentsTable.id, params.data.id)).returning();
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }
  res.json(UpdatePaymentResponse.parse({ ...payment, amount: Number(payment.amount), userName: null, packageName: null }));
});

export default router;
