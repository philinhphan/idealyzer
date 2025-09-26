import { NextRequest, NextResponse } from 'next/server'
import type { AnalysisResult } from '@/lib/analysis-frameworks'

export async function POST(request: NextRequest) {
  try {
    const { result, ideaTitle } = await request.json() as {
      result: AnalysisResult
      ideaTitle: string
    }

    if (!result || !ideaTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: result and ideaTitle' },
        { status: 400 }
      )
    }

    // For server-side PDF generation, we'll use a different approach
    // This could be implemented with puppeteer or similar tools
    // For now, we'll return the data that can be used client-side
    
    const pdfData = {
      title: ideaTitle,
      summary: result.summary,
      qualityScore: result.qualityScore,
      metrics: result.frameworks.metrics,
      bcg: result.frameworks.bcg,
      swot: result.frameworks.swot,
      businessModel: result.frameworks.businessModel,
      budget: result.budgetEstimate,
      recommendations: result.recommendations,
      pros: result.pros,
      cons: result.cons,
      evaluation: result.evaluation,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: pdfData,
      message: 'PDF data prepared successfully'
    })

  } catch (error) {
    console.error('Error preparing PDF data:', error)
    return NextResponse.json(
      { error: 'Failed to prepare PDF data' },
      { status: 500 }
    )
  }
}

// Alternative: If you want to implement server-side PDF generation with puppeteer
// You would need to install puppeteer and use it like this:
/*
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const { result, ideaTitle } = await request.json()
    
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    
    // Generate HTML content
    const htmlContent = generatePDFHTML(result, ideaTitle)
    
    await page.setContent(htmlContent)
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })
    
    await browser.close()
    
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${ideaTitle}_analysis.pdf"`
      }
    })
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

function generatePDFHTML(result: AnalysisResult, ideaTitle: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${ideaTitle} - Analysis Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .list-item { margin: 5px 0; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${ideaTitle}</h1>
        <h2>Business Idea Analysis Report</h2>
        <p>Quality Score: ${result.qualityScore}/10</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="section">
        <h3>Executive Summary</h3>
        <p>${result.summary}</p>
      </div>
      
      <!-- Add more sections as needed -->
      
    </body>
    </html>
  `
}
*/