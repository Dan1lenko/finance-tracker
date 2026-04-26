import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const familyId = searchParams.get('familyId');

  if (!userId && !familyId) {
    return NextResponse.json({ error: "Необхідно вказати userId або familyId" }, { status: 400 });
  }

  try {
    const whereClause: any = {};
    if (familyId) {
      whereClause.familyId = familyId;
    } else if (userId) {
      whereClause.userId = userId;
      whereClause.familyId = null; // Only personal transactions
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ error: "Помилка отримання транзакцій" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, type, category, userId, familyId } = body;

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        currency: currency || "UAH",
        type,
        category,
        userId,
        familyId: familyId || null,
        date: new Date(),
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json({ error: "Помилка створення транзакції" }, { status: 500 });
  }
}
