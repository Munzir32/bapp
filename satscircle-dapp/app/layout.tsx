'use client'
import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import '@rainbow-me/rainbowkit/styles.css';

import { WagmiProvider } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { cBtc } from "@/config"
import { Toaster } from "@/components/ui/toaster"
import {
  DynamicContextProvider,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { http } from 'viem';
import { createConfig } from "wagmi"

const inter = Inter({ subsets: ["latin"] })


const config = createConfig({
  chains: [cBtc],
  multiInjectedProviderDiscovery: false,
  transports: {
    [cBtc.id]: http(),
  },
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
        <DynamicContextProvider 
        settings={{
          environmentId: '588bc342-72ad-4ec8-987d-34da05228081',
          walletConnectors: [EthereumWalletConnectors],
        }}
        >
          {/* <DynamicWidget />  */}
          

          
          <WagmiProvider config={config}>
          
            <QueryClientProvider client={queryClient}>
            <DynamicWagmiConnector>
                {children}
                </DynamicWagmiConnector>
            </QueryClientProvider>
          
          </WagmiProvider>
          
        </DynamicContextProvider>
    <Toaster />
      </body>
    </html>
  )
}
