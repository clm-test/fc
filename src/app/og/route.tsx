import { ImageResponse } from "next/og";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const hash = url.searchParams.get("hash");

  return new ImageResponse(
    (
      <div tw="flex w-[600px] h-[400px] justify-center items-center bg-[#b4a3d4]">
        <img
          src={`https://client.farcaster.xyzz/v2/cast-image?castHash=${hash}`}
          alt="Overlay"
          tw="h-full object-contain"
        />
      </div>
    ),

    {
      width: 600,
      height: 400,
    }
  );
}
