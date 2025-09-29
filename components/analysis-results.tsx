"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Markdown } from "@/components/ui/markdown"
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
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
                <CardDescription>Performance across critical business dimensions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {metricsData.map((metric) => (
                  <div key={metric.name} className="space-y-3 p-3 bg-white/60 dark:bg-slate-700/30 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        {getScoreIcon(metric.value)}
                        <span className={`font-bold text-lg ${getScoreColor(metric.value)}`}>{metric.value}/10</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={metric.value * 10} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Poor</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* BCG Matrix */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  {getBCGIcon(result.frameworks.bcg.category)}
                  BCG Matrix Position
                </CardTitle>
                <CardDescription>Strategic market positioning analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-white/60 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <Badge variant="secondary" className="text-lg px-6 py-3 capitalize bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                      {result.frameworks.bcg.category.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/60 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50 text-center">
                      <span className="text-xs text-blue-600 dark:text-blue-400 block mb-1">Market Growth</span>
                      <div className="font-bold text-xl text-blue-800 dark:text-blue-200">{result.frameworks.bcg.marketGrowth}%</div>
                    </div>
                    <div className="p-3 bg-white/60 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50 text-center">
                      <span className="text-xs text-blue-600 dark:text-blue-400 block mb-1">Market Share</span>
                      <div className="font-bold text-xl text-blue-800 dark:text-blue-200">{result.frameworks.bcg.marketShare}%</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white/60 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <Markdown className="text-sm text-blue-800 dark:text-blue-200">{result.frameworks.bcg.reasoning}</Markdown>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                  Budget Estimate
                </CardTitle>
                <CardDescription>100-day prototype development costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6 p-4 bg-white/60 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="text-4xl font-bold text-emerald-700 dark:text-emerald-400">${result.budgetEstimate.total.toLocaleString()}</div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-300 mt-1">{result.budgetEstimate.timeline} timeline</div>
                </div>
                <div className="space-y-3">
                  {budgetData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center p-3 bg-white/60 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{item.name}</span>
                      </div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  Strengths & Opportunities
                </CardTitle>
                <CardDescription>Key advantages and growth potential</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-green-950/30 rounded-lg border border-green-200/50 dark:border-green-800/50">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-800 dark:text-green-200 leading-relaxed">{pro}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <TrendingDown className="h-5 w-5" />
                  Challenges & Risks
                </CardTitle>
                <CardDescription>Potential obstacles and mitigation strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-red-950/30 rounded-lg border border-red-200/50 dark:border-red-800/50">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-800 dark:text-red-200 leading-relaxed">{con}</span>
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
              <CardDescription>Comprehensive analysis with market insights and strategic recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <Markdown className="text-sm leading-relaxed">{result.evaluation}</Markdown>
              </div>
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
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {result.frameworks.swot.strengths.map((item, index) => (
                        <li key={index} className="text-sm flex items-start gap-2 text-green-800 dark:text-green-200">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <Markdown className="flex-1">{item}</Markdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {result.frameworks.swot.opportunities.map((item, index) => (
                        <li key={index} className="text-sm flex items-start gap-2 text-blue-800 dark:text-blue-200">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <Markdown className="flex-1">{item}</Markdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Weaknesses
                    </h4>
                    <ul className="space-y-2">
                      {result.frameworks.swot.weaknesses.map((item, index) => (
                        <li key={index} className="text-sm flex items-start gap-2 text-yellow-800 dark:text-yellow-200">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                          <Markdown className="flex-1">{item}</Markdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Threats
                    </h4>
                    <ul className="space-y-2">
                      {result.frameworks.swot.threats.map((item, index) => (
                        <li key={index} className="text-sm flex items-start gap-2 text-red-800 dark:text-red-200">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                          <Markdown className="flex-1">{item}</Markdown>
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
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
                    <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Key Partners</h4>
                    <ul className="text-sm space-y-2">
                      {result.frameworks.businessModel.keyPartners.map((item, index) => (
                        <li key={index} className="p-3 bg-white dark:bg-slate-800 rounded-md border shadow-sm">
                          <Markdown>{item}</Markdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
                    <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Key Activities</h4>
                    <ul className="text-sm space-y-2">
                      {result.frameworks.businessModel.keyActivities.map((item, index) => (
                        <li key={index} className="p-3 bg-white dark:bg-slate-800 rounded-md border shadow-sm">
                          <Markdown>{item}</Markdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
                    <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Key Resources</h4>
                    <ul className="text-sm space-y-2">
                      {result.frameworks.businessModel.keyResources.map((item, index) => (
                        <li key={index} className="p-3 bg-white dark:bg-slate-800 rounded-md border shadow-sm">
                          <Markdown>{item}</Markdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                    <h4 className="font-semibold mb-3 text-primary">Value Propositions</h4>
                    <ul className="text-sm space-y-2">
                      {result.frameworks.businessModel.valuePropositions.map((item, index) => (
                        <li key={index} className="p-3 bg-primary/10 dark:bg-primary/20 rounded-md border border-primary/30">
                          <Markdown>{item}</Markdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
                    <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Customer Relationships</h4>
                    <ul className="text-sm space-y-2">
                      {result.frameworks.businessModel.customerRelationships.map((item, index) => (
                        <li key={index} className="p-3 bg-white dark:bg-slate-800 rounded-md border shadow-sm">
                          <Markdown>{item}</Markdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
                    <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Channels</h4>
                    <ul className="text-sm space-y-2">
                      {result.frameworks.businessModel.channels.map((item, index) => (
                        <li key={index} className="p-3 bg-white dark:bg-slate-800 rounded-md border shadow-sm">
                          <Markdown>{item}</Markdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
                    <h4 className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Customer Segments</h4>
                    <ul className="text-sm space-y-2">
                      {result.frameworks.businessModel.customerSegments.map((item, index) => (
                        <li key={index} className="p-3 bg-white dark:bg-slate-800 rounded-md border shadow-sm">
                          <Markdown>{item}</Markdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold mb-3 text-orange-700 dark:text-orange-400">Cost Structure</h4>
                    <ul className="text-sm space-y-2">
                      {result.frameworks.businessModel.costStructure.map((item, index) => (
                        <li key={index} className="p-3 bg-orange-100/50 dark:bg-orange-950/30 rounded-md border border-orange-200/50 dark:border-orange-800/50">
                          <Markdown>{item}</Markdown>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">Revenue Streams</h4>
                    <ul className="text-sm space-y-2">
                      {result.frameworks.businessModel.revenueStreams.map((item, index) => (
                        <li key={index} className="p-3 bg-green-100/50 dark:bg-green-950/30 rounded-md border border-green-200/50 dark:border-green-800/50">
                          <Markdown>{item}</Markdown>
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
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Lightbulb className="h-5 w-5" />
                  Suggested Names
                </CardTitle>
                <CardDescription>Creative brand name options for your startup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {result.recommendations.startupNames.map((name, index) => (
                    <div key={index} className="p-3 bg-white/60 dark:bg-amber-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/50 text-center hover:bg-white/80 dark:hover:bg-amber-950/40 transition-colors cursor-pointer">
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">{name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Brand Wheel */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-700 dark:text-purple-400">Brand Foundation</CardTitle>
                <CardDescription>Core identity and positioning elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="p-4 bg-white/60 dark:bg-purple-950/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                  <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-400">Mission</h4>
                  <Markdown className="text-sm text-purple-800 dark:text-purple-200">{result.recommendations.brandWheel.mission}</Markdown>
                </div>
                <div className="p-4 bg-white/60 dark:bg-purple-950/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                  <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-400">Vision</h4>
                  <Markdown className="text-sm text-purple-800 dark:text-purple-200">{result.recommendations.brandWheel.vision}</Markdown>
                </div>
                <div className="p-4 bg-white/60 dark:bg-purple-950/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                  <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-400">Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendations.brandWheel.values.map((value, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-purple-950/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                  <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-400">Personality</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendations.brandWheel.personality.map((trait, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Elevator Pitch */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Elevator Pitch
              </CardTitle>
              <CardDescription>Your 30-second compelling story</CardDescription>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-primary pl-4 italic text-base leading-relaxed text-foreground/90">
                <Markdown>"{result.recommendations.elevatorPitch}"</Markdown>
              </blockquote>
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                100-Day Action Plan
              </CardTitle>
              <CardDescription>Strategic roadmap for your first 100 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {result.recommendations.actionPlan.map((step, index) => (
                  <li key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border">
                    <Badge variant="default" className="mt-1 min-w-[2rem] h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <Markdown className="text-sm leading-relaxed">{step}</Markdown>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                Key Improvements
              </CardTitle>
              <CardDescription>Strategic enhancements to strengthen your concept</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.recommendations.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <Markdown className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">{improvement}</Markdown>
                    </div>
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
