import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Email та Ім'я обов'язкові" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Користувач з таким email вже існує" }, { status: 409 });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Помилка реєстрації" }, { status: 500 });
  }
}
