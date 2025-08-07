"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useConnect,
} from "wagmi";
import { encodeFunctionData } from "viem";
import { abi } from "../contracts/abi";
import { FarcasterEmbed } from "react-farcaster-embed/dist/client";
import "react-farcaster-embed/dist/styles.css";
import { config } from "~/components/providers/WagmiProvider";
import { BaseError, UserRejectedRequestError } from "viem";

export default function Main() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [txHash, setTxHash] = useState<string | null>(null);

  const { isConnected } = useAccount();

  const {
    sendTransaction,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });
  const { connect } = useConnect();

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);

      sdk.actions.ready({});
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);
  interface HashResponse {
    hash: string;
  }
  interface StorageResponse {
    limit: number;
    used: number;
  }
  const [hashData, sethashData] = useState<HashResponse | null>(null);

  const hash = useCallback(async (fid: string) => {
    try {
      const Response = await fetch(`/api/hash?fid=${fid}`);
      if (!Response.ok) {
        throw new Error(`HTTP error! Status: ${Response.status}`);
      }
      const ResponseData = await Response.json();
      {
        sethashData({
          hash: ResponseData.hash,
        });
      }
    } catch (err) {
      console.error("Error fetching hash", err);
    }
  }, []);
  const [storageData, setStorageData] = useState<StorageResponse | null>(null);

  const storage = useCallback(async (fid: string) => {
    try {
      const Response = await fetch(`/api/storage?fid=${fid}`);
      if (!Response.ok) {
        throw new Error(`HTTP error! Status: ${Response.status}`);
      }
      const ResponseData = await Response.json();
      {
        setStorageData({
          limit: ResponseData.limit,
          used: ResponseData.used,
        });
      }
    } catch (err) {
      console.error("Error fetching hash", err);
    }
  }, []);

  useEffect(() => {
    if (context?.user.fid) {
      hash(String(context.user.fid));
      storage(String(context.user.fid));
    }
  }, [context]);

  const cast = async (): Promise<string | undefined> => {
    try {
      await sdk.actions.composeCast({
        text: "This is my first cast.\ncheck yours with this mini app by @cashlessman.eth",
        embeds: [
          `https://firstcast.vercel.app?hash=${hashData?.hash}`,
          `https://farcaster.xyz/${
            context?.user.username
          }/${hashData?.hash.slice(0, 10)}`,
        ],
      });
    } catch (error) {
      console.error("Error composing cast:", error);
      return undefined;
    }
  };
  if (!context)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="flex flex-col items-center justify-center text-white text-2xl p-4">
          <p className="flex items-center justify-center text-center">
            you need to access this miniapp from inside a farcaster client
          </p>
          <p className="flex items-center justify-center text-center">
            (click on the logo to open in Farcaster)
          </p>

          <div className="flex items-center justify-center p-2 bg-white rounded-lg mt-4">
            <a
              href="https://warpcast.com/cashlessman.eth/0x084518c4"
              target="_blank"
              rel="noopener noreferrer"
              className="shadow-lg shadow-white"
            >
              <img
                src="https://farcaster/og-logo.png"
                alt="Profile"
                className="w-28 h-28 shadow-lg"
              />
            </a>
          </div>
        </div>
      </div>
    );
  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
      className="flex flex-col bg-[#15202B] min-h-screen"
    >
      {hashData?.hash && context?.user.username && (
        <div className="flex flex-col bg-[#15202B] min-h-screen items-center justify-center px-4">
          <div className="bg-[#192734] text-white rounded-2xl shadow-lg max-w-xl w-full border border-[#2F3336]">
            <div
              onClick={() =>
                sdk.actions.openUrl(
                  `https://farcaaster.xyz/~/conversations/${hashData?.hash}`
                )
              }
              style={{ cursor: "pointer" }}
            >
              <FarcasterEmbed
                username={context?.user.username}
                hash={hashData?.hash}
              />
            </div>
          </div>
          {storageData?.limit === storageData?.used && (
            <div className="text-red-600 text-xs text-center">
              This might not be your First cast because you are running out of
              storage
            </div>
          )}
          <Mint />
          <div
            className="fixed bottom-10 right-10 w-12 aspect-square rounded-full border-2 border-white z-50 flex items-center justify-center text-white"
            onClick={cast}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );

  function Mint() {
    const [isClicked, setIsClicked] = useState(false);

    const CONTRACT_ADDRESS = "0x3404Fe61116f58b2D9d17AE6d2Da0e5E454BE359";
    const handleMint = () => {
      setIsClicked(true);
      setTimeout(() => {
        if (isConnected) {
          sendTx();
        } else {
          connect({ connector: config.connectors[0] });
        }
      }, 500);

      setTimeout(() => setIsClicked(false), 500);
    };
    const sendTx = useCallback(() => {
      const data = encodeFunctionData({
        abi,
        functionName: "mintNFT",
        args: [context?.user.fid, hashData?.hash],
      });
      sendTransaction(
        {
          to: CONTRACT_ADDRESS,
          data,
          value: BigInt("300000000000000"),
        },
        {
          onSuccess: (hash) => {
            setTxHash(hash);
          },
        }
      );
    }, [sendTransaction]);
    return (
      <div className="flex flex-col mt-2">
        <button
          onClick={handleMint}
          disabled={isSendTxPending}
          className="text-white text-center py-3 rounded-xl font-semibold text-lg shadow-lg relative overflow-hidden transform transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center gap-2"
          style={{
            background:
              "linear-gradient(90deg, #8B5CF6, #7C3AED, #A78BFA, #8B5CF6)",
            backgroundSize: "300% 100%",
            animation: "gradientAnimation 3s infinite ease-in-out",
          }}
        >
          <div
            className={`absolute inset-0 bg-[#38BDF8] transition-all duration-500 ${
              isClicked ? "scale-x-100" : "scale-x-0"
            }`}
            style={{ transformOrigin: "center" }}
          ></div>
          <style>{`
              @keyframes gradientAnimation {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
            `}</style>
          {isConnected ? <MintButton /> : "Connect Wallet"}
        </button>
        <div className="text-center">
          {isSendTxError && renderError(sendTxError)}
        </div>
      </div>
    );
  }
  function MintButton() {
    return (
      <div className="flex flex-row gap-2 px-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 relative z-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
          />
        </svg>{" "}
        <span className="relative z-10">
          {" "}
          {isConfirming
            ? "Minting..."
            : isConfirmed
            ? "Minted!"
            : "Mint your first cast"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 relative z-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
          />
        </svg>{" "}
      </div>
    );
  }
}

const renderError = (error: Error | null) => {
  if (!error) return null;
  if (error instanceof BaseError) {
    const isUserRejection =
      error instanceof UserRejectedRequestError ||
      (error.cause && error.cause instanceof UserRejectedRequestError);

    if (isUserRejection) {
      return (
        <div className="text-red-500 text-xs mt-1">Click again to Mint.</div>
      );
    }
  }

  return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
};
