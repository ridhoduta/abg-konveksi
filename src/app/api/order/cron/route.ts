import { NextRequest, NextResponse } from "next/server";
import { cancelExpiredTransferOrders } from "@/lib/order";

export async function GET(req: NextRequest) {
  try {
    // Optional basic auth using CRON_SECRET if specified in environment
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await cancelExpiredTransferOrders();
    
    return NextResponse.json({ 
      success: true, 
      message: "Expired transfer orders checked and cancelled successfully" 
    });
  } catch (error) {
    console.error("Cron Order Cancel Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
