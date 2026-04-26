import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, userId } = await request.json();

    if (!name || !userId) {
      return NextResponse.json({ error: "Назва та userId обов'язкові" }, { status: 400 });
    }

    // Transaction to create family and add user as member
    const family = await prisma.family.create({
      data: {
        name,
        ownerId: userId, // Set creator as owner
        members: {
          connect: { id: userId } // Add creator as member
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json(family);
  } catch (error) {
    console.error("Create family error:", error);
    return NextResponse.json({ error: "Помилка створення групи" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: "Необхідно вказати userId" }, { status: 400 });
  }

  try {
    const families = await prisma.family.findMany({
      where: {
        members: {
          some: { id: userId }
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json(families);
  } catch (error) {
    console.error("Fetch families error:", error);
    return NextResponse.json({ error: "Помилка отримання груп" }, { status: 500 });
  }
}
