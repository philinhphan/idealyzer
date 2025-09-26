import { type NextRequest, NextResponse } from "next/server"
import { generateObject, generateText } from "ai"
import { z } from "zod"
import { ANALYSIS_PROMPTS, type AnalysisResult } from "@/lib/analysis-frameworks"
import { getAIProvider, hasAIProvider } from "@/lib/ai-provider"

// Schema definitions for structured output
const SWOTSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  threats: z.array(z.string()),
})

const BCGSchema = z.object({
  category: z.enum(["star", "cash-cow", "question-mark", "dog"]),
  marketGrowth: z.number(),
  marketShare: z.number(),
  reasoning: z.string(),
})

const BusinessModelSchema = z.object({
  keyPartners: z.array(z.string()),
  keyActivities: z.array(z.string()),
  keyResources: z.array(z.string()),
  valuePropositions: z.array(z.string()),
  customerRelationships: z.array(z.string()),
  channels: z.array(z.string()),
  customerSegments: z.array(z.string()),
  costStructure: z.array(z.string()),
  revenueStreams: z.array(z.string()),
})

const MetricsSchema = z.object({
  desirability: z.number().min(1).max(10),
  viability: z.number().min(1).max(10),
  feasibility: z.number().min(1).max(10),
  sustainability: z.number().min(1).max(10),
})

const RecommendationsSchema = z.object({
  startupNames: z.array(z.string()),
  brandWheel: z.object({
    mission: z.string(),
    vision: z.string(),
    values: z.array(z.string()),
    personality: z.array(z.string()),
  }),
  elevatorPitch: z.string(),
  actionPlan: z.array(z.string()),
  improvements: z.array(z.string()),
})

export async function POST(request: NextRequest) {
  try {
    if (!hasAIProvider()) {
      return NextResponse.json(
        { error: "No AI provider configured. Please add either ANTHROPIC_API_KEY or OPENAI_API_KEY to your environment variables." },
        { status: 500 },
      )
    }

    const aiProvider = getAIProvider()
    console.log(`Using AI provider: ${aiProvider.name} with model: ${aiProvider.textModel}`)

    const formData = await request.formData()

    // Extract form fields
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const keyFeatures = JSON.parse((formData.get("keyFeatures") as string) || "[]")
    const valueProposition = formData.get("valueProposition") as string
    const concept = formData.get("concept") as string
    const background = JSON.parse((formData.get("background") as string) || "{}")
    const source = formData.get("source") as string

    // Process uploaded files (simplified for demo)
    const files = formData.getAll("files") as File[]
    let fileContent = ""

    for (const file of files) {
      if (file.type === "text/plain") {
        fileContent += (await file.text()) + "\n"
      }
      // TODO: Add PDF parsing and image analysis
    }

    // Construct comprehensive idea context
    const ideaContext = `
STARTUP IDEA ANALYSIS REQUEST

Title: ${title}
Description: ${description}
Key Features: ${keyFeatures.join(", ")}
Value Proposition: ${valueProposition}
Implementation Concept: ${concept}
Background: ${JSON.stringify(background)}
Source: ${source}
Additional File Content: ${fileContent}
    `.trim()

    // Generate basic summary and evaluation
    const { text: summary } = await generateText({
      model: aiProvider.model(aiProvider.textModel),
      prompt: `Provide a brief 2-3 sentence summary of this startup idea: ${ideaContext}`,
    })

    const { text: evaluation } = await generateText({
      model: aiProvider.model(aiProvider.textModel),
      prompt: `Provide a comprehensive evaluation of this startup idea using Markdown formatting. Include:
      
      ## Market Potential
      Analyze the market size, growth trends, and opportunity.
      
      ## Competitive Advantages
      Identify unique value propositions and differentiators.
      
      ## Key Challenges
      Outline major risks and obstacles.
      
      ## Implementation Considerations
      Discuss technical, operational, and strategic factors.
      
      Use bullet points, bold text, and proper formatting for readability.
      
      Startup idea: ${ideaContext}`,
    })

    // Generate pros and cons
    const { object: prosConsResult } = await generateObject({
      model: aiProvider.model(aiProvider.objectModel),
      schema: z.object({
        pros: z.array(z.string()),
        cons: z.array(z.string()),
      }),
      prompt: `Analyze this startup idea and provide 4-6 key pros and 4-6 key cons. Use Markdown formatting with **bold** for key terms and clear, specific descriptions: ${ideaContext}`,
    })

    // Generate SWOT Analysis
    const { object: swotAnalysis } = await generateObject({
      model: aiProvider.model(aiProvider.objectModel),
      schema: SWOTSchema,
      prompt: `${ANALYSIS_PROMPTS.swot}\n\nIdea: ${ideaContext}`,
    })

    // Generate BCG Matrix Analysis
    const { object: bcgAnalysis } = await generateObject({
      model: aiProvider.model(aiProvider.objectModel),
      schema: BCGSchema,
      prompt: `${ANALYSIS_PROMPTS.bcg}\n\nIdea: ${ideaContext}`,
    })

    // Generate Business Model Canvas
    const { object: businessModel } = await generateObject({
      model: aiProvider.model(aiProvider.objectModel),
      schema: BusinessModelSchema,
      prompt: `${ANALYSIS_PROMPTS.businessModel}\n\nIdea: ${ideaContext}`,
    })

    // Generate Metrics Analysis
    const { object: metrics } = await generateObject({
      model: aiProvider.model(aiProvider.objectModel),
      schema: MetricsSchema,
      prompt: `${ANALYSIS_PROMPTS.metrics}\n\nIdea: ${ideaContext}`,
    })

    // Generate Recommendations
    const { object: recommendations } = await generateObject({
      model: aiProvider.model(aiProvider.objectModel),
      schema: RecommendationsSchema,
      prompt: `${ANALYSIS_PROMPTS.recommendations}\n\nIdea: ${ideaContext}`,
    })

    // Calculate quality score (weighted average of metrics)
    const qualityScore =
      Math.round(
        (metrics.desirability * 0.3 +
          metrics.viability * 0.3 +
          metrics.feasibility * 0.25 +
          metrics.sustainability * 0.15) *
          10,
      ) / 10

    // Generate budget estimate
    const budgetEstimate = {
      total: Math.round(50000 + Math.random() * 150000), // Simplified calculation
      breakdown: {
        development: 0.4,
        marketing: 0.3,
        operations: 0.2,
        legal: 0.1,
      },
      timeline: "100 days",
    }

    // Calculate actual budget breakdown
    const budgetBreakdown = {
      development: Math.round(budgetEstimate.total * budgetEstimate.breakdown.development),
      marketing: Math.round(budgetEstimate.total * budgetEstimate.breakdown.marketing),
      operations: Math.round(budgetEstimate.total * budgetEstimate.breakdown.operations),
      legal: Math.round(budgetEstimate.total * budgetEstimate.breakdown.legal),
    }

    const result: AnalysisResult = {
      summary,
      pros: prosConsResult.pros,
      cons: prosConsResult.cons,
      evaluation,
      frameworks: {
        swot: swotAnalysis,
        bcg: bcgAnalysis,
        businessModel: businessModel,
        metrics: metrics,
      },
      budgetEstimate: {
        ...budgetEstimate,
        breakdown: budgetBreakdown,
      },
      qualityScore,
      recommendations,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
