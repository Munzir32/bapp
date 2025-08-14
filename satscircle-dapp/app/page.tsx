"use client"

// import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Coins, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core"
import { DynamicWidget } from "@dynamic-labs/sdk-react-core"
export default function LandingPage() {
  // const [isLoading, setIsLoading] = useState(false)
const {setShowAuthFlow, user} = useDynamicContext()
  // const handleLogin = async (provider: string) => {
  //   setIsLoading(true)
  //   // Simulate Web3Auth login
  //   setTimeout(() => {
  //     window.location.href = "/dashboard"
  //   }, 1500)
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SatsCircle</span>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Beta
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Save Bitcoin
            <span className="text-orange-500"> Together</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join trusted friends in Bitcoin savings circles. Take turns receiving payouts while building your Bitcoin
            stack, one contribution at a time.
          </p>

          {/* Login Options */}
          <div className="max-w-md mx-auto space-y-3 mb-12">
            {/* <Button
              onClick={() => handleLogin("google")}
              disabled={isLoading}
              className="w-full h-12 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button> */}

            {/* <Button
              onClick={() => handleLogin("apple")}
              disabled={isLoading}
              className="w-full h-12 bg-black text-white hover:bg-gray-800"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Continue with Apple
            </Button> */}

            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" className="w-full h-12">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Button variant="outline" className="w-full h-12">
                <DynamicWidget />
              </Button>
            )}
            
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Trusted Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Save with friends, family, or verified community members in secure Bitcoin circles.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Grow Your Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Build your Bitcoin savings habit with regular contributions and rotating payouts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <Shield className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Safe & Simple</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  No complex wallets or technical knowledge needed. Just save, contribute, and receive.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How SatsCircle Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Join a Circle</h3>
                <p className="text-sm text-gray-600">Find or create a savings group with trusted members</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Contribute Regularly</h3>
                <p className="text-sm text-gray-600">Make your Bitcoin contribution each week or month</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Take Your Turn</h3>
                <p className="text-sm text-gray-600">Receive the full pot when it's your rotation</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2">Build Your Stack</h3>
                <p className="text-sm text-gray-600">Grow your Bitcoin savings with each completed circle</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>&copy; 2024 SatsCircle. Making Bitcoin savings social and simple.</p>
      </footer>
    </div>
  )
}
