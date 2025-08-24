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
import { NotificationsProvider } from "@/lib/contexts/NotificationsContext"

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SatsCircle" />
        <link rel="apple-touch-icon" href="/placeholder-logo.png" />
      </head>
      <body className={inter.className}>
        <DynamicContextProvider 
          settings={{
            environmentId: '588bc342-72ad-4ec8-987d-34da05228081',
            walletConnectors: [EthereumWalletConnectors],
          }}
        >
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <DynamicWagmiConnector>
                <NotificationsProvider>
                  {children}
                </NotificationsProvider>
              </DynamicWagmiConnector>
            </QueryClientProvider>
          </WagmiProvider>
        </DynamicContextProvider>
        <Toaster />
      </body>
    </html>
  )
}
