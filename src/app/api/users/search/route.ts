import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([], { status: 200 });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 5, // Limit results
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    return NextResponse.json({ error: "Помилка пошуку користувачів" }, { status: 500 });
  }
}
