import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Delete family
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get("requesterId");

    if (!requesterId) {
      return NextResponse.json({ error: "RequesterId required" }, { status: 400 });
    }

    const family = await prisma.family.findUnique({
      where: { id: familyId }
    });

    if (!family) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (family.ownerId && family.ownerId !== requesterId) {
      return NextResponse.json({ error: "Only admin can delete group" }, { status: 403 });
    }

    await prisma.family.delete({
      where: { id: familyId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete family error:", error);
    return NextResponse.json({ error: "Error deleting group" }, { status: 500 });
  }
}

// Update family (rename)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;
    const { name, requesterId } = await request.json();

    if (!name || !requesterId) {
        return NextResponse.json({ error: "Name and RequesterId required" }, { status: 400 });
    }

    const family = await prisma.family.findUnique({
      where: { id: familyId }
    });

    if (!family) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (family.ownerId && family.ownerId !== requesterId) {
      return NextResponse.json({ error: "Only admin can rename group" }, { status: 403 });
    }

    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: { name },
    });

    return NextResponse.json(updatedFamily);
  } catch (error) {
    console.error("Update family error:", error);
    return NextResponse.json({ error: "Error updating group" }, { status: 500 });
  }
}
