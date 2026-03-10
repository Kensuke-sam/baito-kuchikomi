import { NextResponse } from "next/server";
import { getAdminAuthResult, getAdminManagementAccess } from "@/lib/adminAuth";

export async function GET() {
  const auth = await getAdminAuthResult();

  if (!auth.user || !auth.isAdmin) {
    return NextResponse.json({ isAdmin: false });
  }

  const access = await getAdminManagementAccess(auth);

  return NextResponse.json({
    isAdmin: true,
    role: auth.role,
    canManageAdmins: access.canManageAdmins,
  });
}
