import { NextResponse } from "next/server";
import { getBillingCount } from "@/utils/billing";

// GET /api/billing/count - Get total count of billings
export async function GET() {
  try {
    const count = await getBillingCount();

    return NextResponse.json({
      success: true,
      data: count,
    });
  } catch (error) {
    console.error("GET /api/billing/count error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}