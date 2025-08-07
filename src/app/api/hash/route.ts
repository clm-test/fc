import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const fid = req.nextUrl.searchParams.get("fid");
  type Msg = {
    hash: string;
    data: {
      castAddBody: {
        parentCastId: {
          fid: number;
          hash: string;
        } | null;
      };
    };
  };

  try {
    const res = await fetch(
      `${process.env.HUB_URL}/v1/castsByFid?pageSize=100&reverse=false&fid=${fid}`
    );
    const data = await res.json();

    if (!data || !Array.isArray(data.messages)) {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    const original = data.messages.find(
      (msg: Msg) => msg?.data?.castAddBody?.parentCastId === null
    );

    if (!original) {
      return NextResponse.json(
        { error: "No original message found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ hash: original.hash });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong", details: err },
      { status: 500 }
    );
  }
}
