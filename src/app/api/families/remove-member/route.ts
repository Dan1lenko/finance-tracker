import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { familyId, memberId, requesterId } = await request.json();

    if (!familyId || !memberId || !requesterId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: { members: true }
    });

    if (!family) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Verify ownership
    if (family.ownerId && family.ownerId !== requesterId) {
       return NextResponse.json({ error: "Only admin can remove members" }, { status: 403 });
    }

    // Prevent removing self if owner (or allow leaving? logic depends on requirements, let's allow removing anyone for now, but maybe warn if removing owner)
    // Actually owner shouldn't remove themselves this way, they should delete group or transfer ownership.
    if (memberId === family.ownerId) {
         return NextResponse.json({ error: "Owner cannot be removed. Delete group instead." }, { status: 400 });
    }

    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: {
        members: {
          disconnect: { id: memberId }
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json(updatedFamily);
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json({ error: "Error removing member" }, { status: 500 });
  }
}
