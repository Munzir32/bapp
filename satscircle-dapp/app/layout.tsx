'use client'
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { cBtc } from "@/config"
import { Toaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "SatsCircle - Bitcoin Savings Groups",
//   description: "Join trusted friends in Bitcoin savings circles. Build your Bitcoin stack together.",
//     generator: 'v0.dev'
// }

const config = getDefaultConfig({
  appName: 'Satcircle',
  projectId: '85b280b0a9d7ee0853821de8046f20bc',
  chains: [cBtc],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
        {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    <Toaster />
      </body>
    </html>
  )
}
