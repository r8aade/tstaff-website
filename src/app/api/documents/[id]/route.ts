import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Only admins, or the employee the document belongs to, can open it.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const doc = await prisma.employeeDocument.findUnique({
    where: { id: params.id },
    include: { employee: { select: { userId: true } } }
  });
  if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = session.user.role === "EMPLOYEE" && doc.employee.userId === session.user.id;
  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const download = new URL(req.url).searchParams.has("download");
  const viewable = doc.mimeType === "application/pdf" || ["image/jpeg", "image/png", "image/webp"].includes(doc.mimeType);
  const disposition = download || !viewable ? "attachment" : "inline";

  return new NextResponse(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(doc.size),
      "Content-Disposition": `${disposition}; filename="${doc.fileName.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      // Only PDFs and photos are ever accepted (no HTML/SVG), and nosniff stops the browser guessing.
      "X-Content-Type-Options": "nosniff"
    }
  });
}
