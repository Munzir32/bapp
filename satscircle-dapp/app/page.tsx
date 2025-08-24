"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Coins, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { DynamicWidget } from "@dynamic-labs/sdk-react-core"

export default function LandingPage() {
  const { user } = useDynamicContext()

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

          {/* Authentication */}
          <div className="max-w-md mx-auto space-y-3 mb-12">
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" className="w-full h-12">
                  Continue to Dashboard
                </Button>
              </Link>
            ) : (
              <DynamicWidget />
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
