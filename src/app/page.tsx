import { Metadata } from "next";
import App from "~/app/app";

const appUrl = process.env.NEXT_PUBLIC_URL;

export const revalidate = 300;

interface Props {
  searchParams: Promise<{
    hash: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { hash } = await searchParams;

  const frame = {
    version: "next",
    imageUrl: hash ? `${appUrl}/og?hash=${hash}` : `${appUrl}/og.png`,
    button: {
      title: "View your first cast",
      action: {
        type: "launch_frame",
        name: "your first cast",
        url: `${appUrl}`,
        splashImageUrl: `${appUrl}/logo.png`,
        splashBackgroundColor: "#ee6f29",
      },
    },
  };

  return {
    title: "first cast",
    openGraph: {
      title: "first cast",
      description: "view your first cast on farcaster",
      images: [
        {
          url: `${appUrl}/og.png`,
          width: 1200,
          height: 630,
          alt: "first cast",
        },
      ],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
