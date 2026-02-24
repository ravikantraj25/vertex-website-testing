import { NextResponse } from "next/server";

// placeholder because route was deleted; keeps build happy
export async function GET() {
  return NextResponse.json({ message: "Event not found" }, { status: 404 });
}
