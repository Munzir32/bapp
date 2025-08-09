"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Users, Calendar, Coins, Eye, EyeOff, Info, CheckCircle } from "lucide-react"
import { useWriteContract, useAccount } from "wagmi"
import { contractAddress } from "@/contracts/constant"
import ABI from "@/contracts/abi.json"
import { useToast } from "@/hooks/use-toast"

interface CreateCircleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCircleModal({ open, onOpenChange }: CreateCircleModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contribution: "",
    frequency: "weekly",
    groupSize: "4",
    isPrivate: false,
    rotationOrder: "random",
  })

  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast()

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    
    
    try {
      if (!address) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to create a circle.",
          variant: "destructive"
        })
        return
      }

      // Validate form data
      if (!formData.name.trim()) {
        toast({
          title: "Invalid Circle Name",
          description: "Please enter a valid circle name.",
          variant: "destructive"
        })
        return
      }

      if (!formData.contribution || Number.parseInt(formData.contribution) <= 0) {
        toast({
          title: "Invalid Contribution Amount",
          description: "Please enter a valid contribution amount greater than 0.",
          variant: "destructive"
        })
        return
      }

      // Convert form data to contract parameters
      const contributionAmount = BigInt(formData.contribution)
      const frequency = formData.frequency === "weekly" ? 0 : 1 // 0 = WEEKLY, 1 = MONTHLY
      const memberLimit = BigInt(formData.groupSize)
      const visibility = formData.isPrivate ? 1 : 0 // 0 = PUBLIC, 1 = PRIVATE

      console.log("Creating circle with params:", {
        name: formData.name,
        contributionAmount: contributionAmount.toString(),
        frequency,
        memberLimit: memberLimit.toString(),
        visibility,
        value: contributionAmount.toString()
      })

      // Call the createCircle function
      const result = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: ABI,
        functionName: 'createCircle',
        args: [
          formData.name,
          contributionAmount,
          frequency,
          memberLimit,
          visibility
        ],
        value: contributionAmount
      })

      console.log("Circle created successfully:", result)
      
      // Show success message
      toast({
        title: "Circle Created Successfully! 🎉",
        description: `Your "${formData.name}" circle has been created. You can now invite members to join.`,
      })
      
      // Close modal and reset form
      onOpenChange(false)
      setStep(1)
      setFormData({
        name: "",
        description: "",
        contribution: "",
        frequency: "weekly",
        groupSize: "4",
        isPrivate: false,
        rotationOrder: "random",
      })

    } catch (error: any) {
      console.error("Error creating circle:", error)
      
      // Handle specific error types
      let errorMessage = "There was an error creating your circle. Please try again."
      
      if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds in your wallet. Please add more BTC to create this circle."
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction was cancelled. Please try again."
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.message?.includes("gas")) {
        errorMessage = "Gas estimation failed. Please try again or increase gas limit."
      }

      toast({
        title: "Error Creating Circle",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-medium">
                Circle Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Family Savers, College Friends"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">Choose a friendly name your group will recognize</p>
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="What's this circle for? Any special goals or rules?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {formData.isPrivate ? (
                    <EyeOff className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Make this circle private</p>
                  <p className="text-sm text-gray-600">Only people with invite links can join</p>
                </div>
              </div>
              <Switch
                checked={formData.isPrivate}
                onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">How much will each person contribute?</Label>
              <div className="mt-3 space-y-3">
                <div className="flex items-center space-x-3">
                  <Input
                    type="number"
                    placeholder="10000"
                    value={formData.contribution}
                    onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                    className="flex-1"
                  />
                  <Badge variant="secondary" className="px-3 py-1">
                    sats
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {formData.contribution && `≈ $${(Number.parseInt(formData.contribution) * 0.0004).toFixed(2)} USD`}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">How often?</Label>
              <RadioGroup
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span>Weekly</span>
                      <Badge variant="outline">Recommended</Badge>
                    </div>
                    <p className="text-sm text-gray-500">Build a strong saving habit</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                    <span>Monthly</span>
                    <p className="text-sm text-gray-500">Larger contributions, longer cycles</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Contribution Tip</p>
                  <p className="text-sm text-orange-700">
                    Start with an amount everyone can comfortably afford. You can always create new circles with higher
                    amounts later!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">How many people in your circle?</Label>
              <Select
                value={formData.groupSize}
                onValueChange={(value) => setFormData({ ...formData, groupSize: value })}
              >
                <SelectTrigger className="mt-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} people
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                Smaller groups finish faster, larger groups mean bigger payouts
              </p>
            </div>

            <div>
              <Label className="text-base font-medium">Payout order</Label>
              <RadioGroup
                value={formData.rotationOrder}
                onValueChange={(value) => setFormData({ ...formData, rotationOrder: value })}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="random" id="random" />
                  <Label htmlFor="random" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span>Random order</span>
                      <Badge variant="outline">Fair</Badge>
                    </div>
                    <p className="text-sm text-gray-500">System randomly assigns payout order</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual" className="flex-1 cursor-pointer">
                    <span>Let group decide</span>
                    <p className="text-sm text-gray-500">Members can discuss and agree on order</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Preview */}
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-orange-600" />
                  <span>Circle Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total per round:</span>
                  <span className="font-semibold">
                    {formData.contribution && formData.groupSize
                      ? (Number.parseInt(formData.contribution) * Number.parseInt(formData.groupSize)).toLocaleString()
                      : "0"}{" "}
                    cBTC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your contribution:</span>
                  <span className="font-semibold">
                    {formData.contribution || "0"} cBTC {formData.frequency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Circle duration:</span>
                  <span className="font-semibold">
                    {formData.groupSize} {formData.frequency === "weekly" ? "weeks" : "months"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Create!</h3>
              <p className="text-gray-600">Review your circle details below</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{formData.name || "Unnamed Circle"}</span>
                  <Badge variant={formData.isPrivate ? "secondary" : "outline"}>
                    {formData.isPrivate ? "Private" : "Public"}
                  </Badge>
                </CardTitle>
                {formData.description && <CardDescription>{formData.description}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Contribution</p>
                      <p className="font-medium">{formData.contribution} sats</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Frequency</p>
                      <p className="font-medium capitalize">{formData.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Group Size</p>
                      <p className="font-medium">{formData.groupSize} people</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full" />
                    <div>
                      <p className="text-sm text-gray-600">Payout Order</p>
                      <p className="font-medium capitalize">{formData.rotationOrder}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total payout per turn:</span>
                    <span className="text-xl font-bold text-orange-600">
                      {formData.contribution && formData.groupSize
                        ? (
                            Number.parseInt(formData.contribution) * Number.parseInt(formData.groupSize)
                          ).toLocaleString()
                        : "0"}{" "}
                      cBTC
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Next Steps</p>
                  <p className="text-sm text-blue-700">
                    After creating your circle, you'll get a shareable link to invite members. The circle starts when
                    everyone joins!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create New Circle</span>
            <Badge variant="outline">
              Step {step} of {totalSteps}
            </Badge>
          </DialogTitle>
          <Progress value={progress} className="mt-2" />
        </DialogHeader>

        <div className="py-6">{renderStep()}</div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center space-x-2 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={(step === 1 && !formData.name) || (step === 2 && !formData.contribution)}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Create Circle</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
