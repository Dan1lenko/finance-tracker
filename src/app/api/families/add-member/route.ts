import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Add user to family
    // In a real app we'd check session here. For now we trust the client logic or could pass requesterId.
    // Let's assume we want to restrict this.
    // However, the current API `add-member` only takes familyId and email.
    // I should update it to take requesterId to verify ownership.
    
    // For now, let's update the store to pass requesterId and update this route.
    
    // ... wait, I need to update the route definition first to accept requesterId.
    
    const { familyId, email, requesterId } = await request.json();

    if (!familyId || !email || !requesterId) {
      return NextResponse.json({ error: "FamilyId, Email та RequesterId обов'язкові" }, { status: 400 });
    }

    const family = await prisma.family.findUnique({
        where: { id: familyId }
    });
    
    if (!family) {
        return NextResponse.json({ error: "Групу не знайдено" }, { status: 404 });
    }
    
    // Verify ownership (allow if ownerId is null for backward compatibility or strict?)
    // Let's be strict for new features, but maybe lenient for old.
    // But schema has ownerId as nullable.
    if (family.ownerId && family.ownerId !== requesterId) {
        return NextResponse.json({ error: "Тільки адміністратор може додавати учасників" }, { status: 403 });
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      return NextResponse.json({ error: "Користувача з таким email не знайдено" }, { status: 404 });
    }

    // Add user to family
    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: {
        members: {
          connect: { id: userToAdd.id }
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json(updatedFamily);
  } catch (error) {
    console.error("Add member error:", error);
    return NextResponse.json({ error: "Помилка додавання учасника" }, { status: 500 });
  }
}
