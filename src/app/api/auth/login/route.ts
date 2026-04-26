import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email та пароль обов'язкові" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        families: {
          include: {
            members: true
          }
        }, // Return user's families and their members
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }



    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return NextResponse.json({ error: "Невірний пароль" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Помилка входу" }, { status: 500 });
  }
}
