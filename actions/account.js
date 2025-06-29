"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Enhanced serialization function
const serializeDecimal = (obj) => {
  if (!obj) return obj;
  
  const serialized = { ...obj };
  
  // Handle Decimal.js or Prisma decimal fields
  Object.entries(obj).forEach(([key, value]) => {
    if (value && typeof value === 'object' && 'toNumber' in value) {
      serialized[key] = value.toNumber();
    }
  });
  
  return serialized;
};

// Unified error handling
const withAuth = async (fn) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    return await fn(user);
  } catch (error) {
    console.error("Action error:", error);
    return { success: false, error: error.message };
  }
};

export async function getAccountWithTransactions(accountId) {
  return withAuth(async (user) => {
    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!account) return null;

    return {
      ...serializeDecimal(account),
      transactions: account.transactions.map(serializeDecimal),
    };
  });
}

export async function bulkDeleteTransactions(transactionIds) {
  return withAuth(async (user) => {
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change = 
        transaction.type === "EXPENSE" 
          ? transaction.amount 
          : -transaction.amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    // Enhanced revalidation
    revalidatePath("/(main)", "page");
    revalidatePath("/account/[id]", "page");
    
    return { success: true };
  });
}

export async function updateDefaultAccount(accountId) {
  return withAuth(async (user) => {
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]", "page");
    
    return { 
      success: true, 
      data: serializeDecimal(account) 
    };
  });
}