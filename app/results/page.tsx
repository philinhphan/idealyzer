"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnalysisResults } from "@/components/analysis-results"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import type { AnalysisResult } from "@/lib/analysis-frameworks"

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [ideaTitle, setIdeaTitle] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get analysis result from sessionStorage
    const analysisResult = sessionStorage.getItem("analysisResult")
    const ideaData = sessionStorage.getItem("ideaData")

    if (analysisResult && ideaData) {
      try {
        const parsedResult = JSON.parse(analysisResult)
        const parsedIdeaData = JSON.parse(ideaData)
        setResult(parsedResult)
        setIdeaTitle(parsedIdeaData.title)
      } catch (error) {
        console.error("Error parsing stored data:", error)
        router.push("/analyze")
      }
    } else {
      router.push("/analyze")
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analysis results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No analysis results found</p>
          <Button onClick={() => router.push("/analyze")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push("/analyze")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Analyze Another Idea
          </Button>
        </div>

        <AnalysisResults result={result} ideaTitle={ideaTitle} />
      </div>
    </main>
  )
}
