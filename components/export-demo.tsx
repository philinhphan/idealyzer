"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { exportToPDFImproved as exportToPDF, exportToJSON, exportToCSV } from "@/lib/pdf-export-improved"
import { useToast } from "@/components/ui/use-toast"
import { Download, FileText, FileJson, FileSpreadsheet } from "lucide-react"
import type { AnalysisResult } from "@/lib/analysis-frameworks"

// Sample data for demonstration
const sampleResult: AnalysisResult = {
  summary: "This innovative SaaS platform leverages AI to streamline business operations and enhance productivity.",
  qualityScore: 8.5,
  evaluation: "Strong market potential with solid technical feasibility and clear value proposition.",
  pros: [
    "Large addressable market",
    "Strong technical team",
    "Clear competitive advantage",
    "Scalable business model"
  ],
  cons: [
    "High initial development costs",
    "Competitive market landscape",
    "Regulatory compliance requirements",
    "Customer acquisition challenges"
  ],
  frameworks: {
    metrics: {
      desirability: 8.2,
      viability: 7.8,
      feasibility: 8.0,
      sustainability: 7.5
    },
    bcg: {
      category: "star",
      marketGrowth: 15,
      marketShare: 8,
      reasoning: "High growth market with strong competitive position"
    },
    swot: {
      strengths: ["Technical expertise", "Market timing", "Strong team"],
      weaknesses: ["Limited funding", "No established brand"],
      opportunities: ["Growing market", "Partnership potential"],
      threats: ["Established competitors", "Economic uncertainty"]
    },
    businessModel: {
      keyPartners: ["Technology providers", "Distribution partners"],
      keyActivities: ["Software development", "Customer support"],
      keyResources: ["Development team", "Technology platform"],
      valuePropositions: ["Increased efficiency", "Cost reduction"],
      customerRelationships: ["Self-service", "Personal assistance"],
      channels: ["Direct sales", "Online platform"],
      customerSegments: ["SME businesses", "Enterprise clients"],
      costStructure: ["Development costs", "Marketing expenses"],
      revenueStreams: ["Subscription fees", "Professional services"]
    }
  },
  budgetEstimate: {
    total: 250000,
    timeline: "100-day prototype",
    breakdown: {
      development: 150000,
      marketing: 50000,
      operations: 30000,
      legal: 20000
    }
  },
  recommendations: {
    startupNames: ["InnovateTech", "StreamlineAI", "ProductivityPro"],
    brandWheel: {
      mission: "Empowering businesses through intelligent automation",
      vision: "To be the leading AI-powered business optimization platform",
      values: ["Innovation", "Reliability", "Customer-centricity"],
      personality: ["Professional", "Innovative", "Trustworthy"]
    },
    elevatorPitch: "We help businesses increase productivity by 40% through our AI-powered automation platform that streamlines operations and reduces manual work.",
    actionPlan: [
      "Validate market demand through customer interviews",
      "Develop MVP with core features",
      "Secure initial funding round",
      "Build strategic partnerships",
      "Launch beta program with select customers"
    ],
    improvements: [
      "Strengthen competitive differentiation",
      "Develop clearer go-to-market strategy",
      "Build stronger financial projections"
    ]
  }
}

export function ExportDemo() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  const ideaTitle = "AI-Powered Business Automation Platform"

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const result = await exportToPDF(sampleResult, ideaTitle)
      if (result.success) {
        toast({
          title: "PDF Export Successful",
          description: `Analysis exported as ${result.filename}`,
        })
      } else {
        toast({
          title: "Export Failed",
          description: result.error || "Failed to export PDF",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = () => {
    try {
      const result = exportToJSON(sampleResult, ideaTitle)
      if (result.success) {
        toast({
          title: "JSON Export Successful",
          description: `Analysis exported as ${result.filename}`,
        })
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export JSON file",
        variant: "destructive",
      })
    }
  }

  const handleExportCSV = () => {
    try {
      const result = exportToCSV(sampleResult, ideaTitle)
      if (result.success) {
        toast({
          title: "CSV Export Successful",
          description: `Analysis exported as ${result.filename}`,
        })
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export CSV file",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Demo
        </CardTitle>
        <CardDescription>
          Test the export functionality with sample analysis data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Sample Analysis</h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Idea:</strong> {ideaTitle}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Quality Score: {sampleResult.qualityScore}/10
              </Badge>
              <Badge variant="secondary">
                Budget: ${sampleResult.budgetEstimate.total.toLocaleString()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
          
          <Button
            onClick={handleExportJSON}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileJson className="h-4 w-4" />
            Export JSON
          </Button>
          
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Note:</strong> The exported files will be downloaded to your default download folder.
            PDF export includes comprehensive formatting, while JSON provides raw data and CSV offers
            a spreadsheet-friendly format.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}