import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const fid = req.nextUrl.searchParams.get("fid");

  try {
    const url = `${process.env.HUB_URL}/v1/storageLimitsByFid?fid=${fid}`;

    const response = await axios.get(url);

    const { limit, used } = response.data.limits[0];

    return NextResponse.json({
      limit,
      used,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
