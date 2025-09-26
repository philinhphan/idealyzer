"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Star,
  DollarSign,
  Target,
  Lightbulb,
  Download,
  Share,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileJson,
} from "lucide-react"
import type { AnalysisResult } from "@/lib/analysis-frameworks"
import { exportToPDFImproved as exportToPDF, exportToJSON, exportToCSV } from "@/lib/pdf-export-improved"
import { useToast } from "@/components/ui/use-toast"

interface AnalysisResultsProps {
  result: AnalysisResult
  ideaTitle: string
}

export function AnalysisResults({ result, ideaTitle }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  // Prepare chart data
  const metricsData = [
    { name: "Desirability", value: result.frameworks.metrics.desirability },
    { name: "Viability", value: result.frameworks.metrics.viability },
    { name: "Feasibility", value: result.frameworks.metrics.feasibility },
    { name: "Sustainability", value: result.frameworks.metrics.sustainability },
  ]

  const budgetData = [
    { name: "Development", value: result.budgetEstimate.breakdown.development, color: "#8b5cf6" },
    { name: "Marketing", value: result.budgetEstimate.breakdown.marketing, color: "#06b6d4" },
    { name: "Operations", value: result.budgetEstimate.breakdown.operations, color: "#10b981" },
    { name: "Legal", value: result.budgetEstimate.breakdown.legal, color: "#f59e0b" },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500"
    if (score >= 6) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (score >= 6) return <AlertCircle className="h-5 w-5 text-yellow-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getBCGIcon = (category: string) => {
    switch (category) {
      case "star":
        return <Star className="h-5 w-5 text-yellow-500" />
      case "cash-cow":
        return <DollarSign className="h-5 w-5 text-green-500" />
      case "question-mark":
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      default:
        return <TrendingDown className="h-5 w-5 text-red-500" />
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const result_export = await exportToPDF(result, ideaTitle, {
        filename: `${ideaTitle.replace(/[^a-zA-Z0-9]/g, '_')}_analysis.pdf`,
        quality: 1.0,
        format: 'a4',
        orientation: 'portrait'
      })

      if (result_export.success) {
        toast({
          title: "PDF Export Successful",
          description: `Analysis exported as ${result_export.filename}`,
        })
      } else {
        toast({
          title: "Export Failed",
          description: result_export.error || "Failed to export PDF",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: "An unexpected error occurred while exporting PDF",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = () => {
    try {
      const result_export = exportToJSON(result, ideaTitle)
      if (result_export.success) {
        toast({
          title: "JSON Export Successful",
          description: `Analysis exported as ${result_export.filename}`,
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
      const result_export = exportToCSV(result, ideaTitle)
      if (result_export.success) {
        toast({
          title: "CSV Export Successful",
          description: `Analysis exported as ${result_export.filename}`,
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ideaTitle} - Business Analysis`,
          text: result.summary,
          url: window.location.href
        })
        toast({
          title: "Shared Successfully",
          description: "Analysis shared successfully",
        })
      } catch (error) {
        // User cancelled sharing or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          // Fallback to copying URL to clipboard
          await navigator.clipboard.writeText(window.location.href)
          toast({
            title: "Link Copied",
            description: "Analysis link copied to clipboard",
          })
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link Copied",
          description: "Analysis link copied to clipboard",
        })
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Unable to share or copy link",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-balance break-words">{ideaTitle}</h1>
            <p className="text-muted-foreground mt-2 text-sm lg:text-base line-clamp-3 lg:line-clamp-none">{result.summary}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:flex-shrink-0">
            <Badge variant="outline" className="text-sm lg:text-lg px-3 lg:px-4 py-1 lg:py-2 whitespace-nowrap">
              Quality Score:{" "}
              <span className={`ml-2 font-bold ${getScoreColor(result.qualityScore)}`}>{result.qualityScore}/10</span>
            </Badge>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isExporting}
                    className="min-w-[100px]"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export'}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="min-w-[80px]"
              >
                <Share className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview" className="text-xs lg:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="frameworks" className="text-xs lg:text-sm">Frameworks</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs lg:text-sm">Metrics</TabsTrigger>
          <TabsTrigger value="business-model" className="text-xs lg:text-sm">Business</TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs lg:text-sm">Recommendations</TabsTrigger>
          <TabsTrigger value="budget" className="text-xs lg:text-sm">Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metricsData.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        {getScoreIcon(metric.value)}
                        <span className={`font-bold ${getScoreColor(metric.value)}`}>{metric.value}/10</span>
                      </div>
                    </div>
                    <Progress value={metric.value * 10} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* BCG Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getBCGIcon(result.frameworks.bcg.category)}
                  BCG Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <Badge variant="secondary" className="text-lg px-4 py-2 capitalize">
                      {result.frameworks.bcg.category.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Market Growth:</span>
                      <div className="font-semibold">{result.frameworks.bcg.marketGrowth}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Market Share:</span>
                      <div className="font-semibold">{result.frameworks.bcg.marketShare}%</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.frameworks.bcg.reasoning}</p>
                </div>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary">${result.budgetEstimate.total.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{result.budgetEstimate.timeline} timeline</div>
                </div>
                <div className="space-y-2">
                  {budgetData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                      <span>{item.name}</span>
                      <span className="font-semibold">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Strengths & Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  Challenges & Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Evaluation */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{result.evaluation}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          {/* SWOT Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>SWOT Analysis</CardTitle>
              <CardDescription>Strategic analysis of internal and external factors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {result.frameworks.swot.strengths.map((item, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">Opportunities</h4>
                    <ul className="space-y-1">
                      {result.frameworks.swot.opportunities.map((item, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <TrendingUp className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-yellow-600 mb-2">Weaknesses</h4>
                    <ul className="space-y-1">
                      {result.frameworks.swot.weaknesses.map((item, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <AlertCircle className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Threats</h4>
                    <ul className="space-y-1">
                      {result.frameworks.swot.threats.map((item, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <XCircle className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metrics Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Evaluation across key business dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={metricsData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Metrics Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Scores</CardTitle>
                <CardDescription>Individual metric performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business-model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Model Canvas</CardTitle>
              <CardDescription>Comprehensive business model breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Key Partners</h4>
                    <ul className="text-sm space-y-1">
                      {result.frameworks.businessModel.keyPartners.map((item, index) => (
                        <li key={index} className="p-2 bg-muted rounded">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Key Activities</h4>
                    <ul className="text-sm space-y-1">
                      {result.frameworks.businessModel.keyActivities.map((item, index) => (
                        <li key={index} className="p-2 bg-muted rounded">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Key Resources</h4>
                    <ul className="text-sm space-y-1">
                      {result.frameworks.businessModel.keyResources.map((item, index) => (
                        <li key={index} className="p-2 bg-muted rounded">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Value Propositions</h4>
                    <ul className="text-sm space-y-1">
                      {result.frameworks.businessModel.valuePropositions.map((item, index) => (
                        <li key={index} className="p-2 bg-primary/10 rounded border border-primary/20">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Customer Relationships</h4>
                    <ul className="text-sm space-y-1">
                      {result.frameworks.businessModel.customerRelationships.map((item, index) => (
                        <li key={index} className="p-2 bg-muted rounded">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Channels</h4>
                    <ul className="text-sm space-y-1">
                      {result.frameworks.businessModel.channels.map((item, index) => (
                        <li key={index} className="p-2 bg-muted rounded">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Segments</h4>
                    <ul className="text-sm space-y-1">
                      {result.frameworks.businessModel.customerSegments.map((item, index) => (
                        <li key={index} className="p-2 bg-muted rounded">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cost Structure</h4>
                    <ul className="text-sm space-y-1">
                      {result.frameworks.businessModel.costStructure.map((item, index) => (
                        <li key={index} className="p-2 bg-muted rounded">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Revenue Streams</h4>
                    <ul className="text-sm space-y-1">
                      {result.frameworks.businessModel.revenueStreams.map((item, index) => (
                        <li key={index} className="p-2 bg-muted rounded">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Startup Names */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Suggested Names
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.recommendations.startupNames.map((name, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Brand Wheel */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Foundation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Mission</h4>
                  <p className="text-sm text-muted-foreground">{result.recommendations.brandWheel.mission}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Vision</h4>
                  <p className="text-sm text-muted-foreground">{result.recommendations.brandWheel.vision}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Values</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.recommendations.brandWheel.values.map((value, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Personality</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.recommendations.brandWheel.personality.map((trait, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Elevator Pitch */}
          <Card>
            <CardHeader>
              <CardTitle>Elevator Pitch</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed italic">"{result.recommendations.elevatorPitch}"</p>
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle>100-Day Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {result.recommendations.actionPlan.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card>
            <CardHeader>
              <CardTitle>Key Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Distribution</CardTitle>
                <CardDescription>100-day prototype budget breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={budgetData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {budgetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Budget Details */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Details</CardTitle>
                <CardDescription>Detailed cost breakdown for {result.budgetEstimate.timeline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">${result.budgetEstimate.total.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Budget</div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {budgetData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${item.value.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {((item.value / result.budgetEstimate.total) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
