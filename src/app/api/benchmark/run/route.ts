import { NextResponse } from "next/server";
import { runBenchmark } from "@/lib/benchmark";

export async function GET() {
  try {
    const metrics = runBenchmark();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...metrics,
    });
  } catch (error: any) {
    console.error("Error running benchmark harness:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute benchmark suite" },
      { status: 500 }
    );
  }
}
