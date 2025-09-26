import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { AnalysisResult } from './analysis-frameworks'

export interface PDFExportOptions {
  filename?: string
  quality?: number
  format?: 'a4' | 'letter'
  orientation?: 'portrait' | 'landscape'
  includeCharts?: boolean
}

// Enhanced color scheme for the PDF
const colors = {
  primary: [139, 92, 246],
  secondary: [6, 182, 212],
  success: [16, 185, 129],
  warning: [245, 158, 11],
  danger: [239, 68, 68],
  text: [31, 41, 55],
  muted: [107, 114, 128],
  light: [243, 244, 246],
  white: [255, 255, 255]
}

export async function exportToPDFImproved(
  result: AnalysisResult,
  ideaTitle: string,
  options: PDFExportOptions = {}
) {
  const {
    filename = `${ideaTitle.replace(/[^a-zA-Z0-9]/g, '_')}_analysis.pdf`,
    quality = 1.0,
    format = 'a4',
    orientation = 'portrait',
    includeCharts = false
  } = options

  try {
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    const maxY = pageHeight - 25

    let currentPage = 1
    let yPosition = margin

    // Helper functions
    const addHeader = (pageNumber: number) => {
      if (pageNumber > 1) {
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
        pdf.text(`${ideaTitle} - Analysis Report`, margin, 12)
        pdf.text(`Page ${pageNumber}`, pageWidth - margin - 15, 12)
        pdf.setDrawColor(colors.light[0], colors.light[1], colors.light[2])
        pdf.line(margin, 15, pageWidth - margin, 15)
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      }
    }

    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > maxY) {
        pdf.addPage()
        currentPage++
        addHeader(currentPage)
        yPosition = currentPage > 1 ? 25 : margin
      }
      return yPosition
    }

    const addSection = (title: string, color = colors.primary) => {
      yPosition = checkNewPage(20)
      
      // Section background
      pdf.setFillColor(color[0], color[1], color[2])
      pdf.rect(margin - 5, yPosition - 5, contentWidth + 10, 12, 'F')
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2])
      pdf.text(title, margin, yPosition + 2)
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      pdf.setFont('helvetica', 'normal')
      
      yPosition += 15
      return yPosition
    }

    const addSubsection = (title: string, color = colors.secondary) => {
      yPosition = checkNewPage(12)
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(color[0], color[1], color[2])
      pdf.text(title, margin + 2, yPosition)
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      pdf.setFont('helvetica', 'normal')
      yPosition += 8
      return yPosition
    }

    const addText = (text: string, fontSize = 10, indent = 0) => {
      pdf.setFontSize(fontSize)
      const lines = pdf.splitTextToSize(text, contentWidth - indent)
      lines.forEach((line: string) => {
        yPosition = checkNewPage(fontSize * 0.4)
        pdf.text(line, margin + indent, yPosition)
        yPosition += fontSize * 0.4
      })
      return yPosition
    }

    const addBulletPoint = (text: string, bulletColor = colors.primary, indent = 5) => {
      yPosition = checkNewPage(6)
      
      // Bullet point
      pdf.setTextColor(bulletColor[0], bulletColor[1], bulletColor[2])
      pdf.text('•', margin + indent, yPosition)
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      
      // Text
      const lines = pdf.splitTextToSize(text, contentWidth - indent - 8)
      lines.forEach((line: string, index: number) => {
        if (index > 0) yPosition = checkNewPage(4)
        pdf.text(line, margin + indent + 6, yPosition)
        if (index < lines.length - 1) yPosition += 4
      })
      yPosition += 6
      return yPosition
    }

    // Title Page
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
    pdf.rect(0, 0, pageWidth, 80, 'F')
    
    // Title
    pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2])
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    
    const titleLines = pdf.splitTextToSize(ideaTitle, contentWidth)
    let titleY = 35
    titleLines.forEach((line: string) => {
      pdf.text(line, margin, titleY)
      titleY += 10
    })
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Business Idea Analysis Report', margin, titleY + 8)
    
    // Decorative line
    pdf.setDrawColor(colors.white[0], colors.white[1], colors.white[2])
    pdf.setLineWidth(0.5)
    pdf.line(margin, titleY + 15, pageWidth - margin, titleY + 15)
    
    // Reset for content
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    yPosition = 100
    
    // Metadata
    pdf.setFontSize(10)
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, margin, yPosition)
    yPosition += 8
    
    // Quality Score with visual indicator
    const scoreColor = result.qualityScore >= 8 ? colors.success : 
                      result.qualityScore >= 6 ? colors.warning : colors.danger
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    pdf.text(`Quality Score: ${result.qualityScore}/10`, margin, yPosition)
    
    // Score bar
    pdf.setDrawColor(colors.light[0], colors.light[1], colors.light[2])
    pdf.setLineWidth(3)
    pdf.line(margin + 50, yPosition - 2, margin + 100, yPosition - 2)
    pdf.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2])
    pdf.line(margin + 50, yPosition - 2, margin + 50 + (result.qualityScore * 5), yPosition - 2)
    
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    pdf.setFont('helvetica', 'normal')
    yPosition += 20

    // Executive Summary
    yPosition = addSection('Executive Summary')
    yPosition = addText(result.summary, 10, 5)
    yPosition += 10

    // Key Metrics
    yPosition = addSection('Key Metrics')
    
    const metrics = [
      { name: 'Desirability', value: result.frameworks.metrics.desirability },
      { name: 'Viability', value: result.frameworks.metrics.viability },
      { name: 'Feasibility', value: result.frameworks.metrics.feasibility },
      { name: 'Sustainability', value: result.frameworks.metrics.sustainability }
    ]

    metrics.forEach(metric => {
      yPosition = checkNewPage(10)
      const metricColor = metric.value >= 8 ? colors.success : 
                         metric.value >= 6 ? colors.warning : colors.danger
      
      pdf.setFontSize(10)
      pdf.text(`${metric.name}:`, margin + 5, yPosition)
      pdf.setTextColor(metricColor[0], metricColor[1], metricColor[2])
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${metric.value}/10`, margin + 50, yPosition)
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      pdf.setFont('helvetica', 'normal')
      
      // Progress bar
      pdf.setDrawColor(colors.light[0], colors.light[1], colors.light[2])
      pdf.setLineWidth(2)
      pdf.line(margin + 70, yPosition - 1, margin + 120, yPosition - 1)
      pdf.setDrawColor(metricColor[0], metricColor[1], metricColor[2])
      pdf.line(margin + 70, yPosition - 1, margin + 70 + (metric.value * 5), yPosition - 1)
      
      yPosition += 8
    })
    yPosition += 10

    // BCG Matrix Analysis
    yPosition = addSection('BCG Matrix Analysis')
    
    const categoryColors = {
      'star': colors.warning,
      'cash-cow': colors.success,
      'question-mark': colors.secondary,
      'dog': colors.danger
    }
    
    const categoryColor = categoryColors[result.frameworks.bcg.category as keyof typeof categoryColors] || colors.muted
    
    yPosition = addSubsection('Category Classification', categoryColor)
    pdf.setTextColor(categoryColor[0], categoryColor[1], categoryColor[2])
    pdf.setFont('helvetica', 'bold')
    pdf.text(result.frameworks.bcg.category.replace('-', ' ').toUpperCase(), margin + 5, yPosition)
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    pdf.setFont('helvetica', 'normal')
    yPosition += 10
    
    yPosition = addSubsection('Market Data')
    pdf.setFontSize(9)
    pdf.text(`Market Growth: ${result.frameworks.bcg.marketGrowth}%`, margin + 5, yPosition)
    yPosition += 6
    pdf.text(`Market Share: ${result.frameworks.bcg.marketShare}%`, margin + 5, yPosition)
    yPosition += 10
    
    yPosition = addSubsection('Strategic Analysis')
    yPosition = addText(result.frameworks.bcg.reasoning, 9, 5)
    yPosition += 10

    // SWOT Analysis
    yPosition = addSection('SWOT Analysis')

    const swotSections = [
      { title: 'Strengths', items: result.frameworks.swot.strengths, color: colors.success },
      { title: 'Weaknesses', items: result.frameworks.swot.weaknesses, color: colors.warning },
      { title: 'Opportunities', items: result.frameworks.swot.opportunities, color: colors.secondary },
      { title: 'Threats', items: result.frameworks.swot.threats, color: colors.danger }
    ]

    swotSections.forEach(section => {
      yPosition = addSubsection(section.title, section.color)
      section.items.forEach(item => {
        yPosition = addBulletPoint(item, section.color, 5)
      })
      yPosition += 5
    })

    // Budget Estimate
    yPosition = addSection('Budget Estimate')
    
    // Total budget highlight
    yPosition = checkNewPage(15)
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
    pdf.rect(margin, yPosition - 3, contentWidth, 10, 'F')
    pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2])
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.text(`Total Budget: $${result.budgetEstimate.total.toLocaleString()}`, margin + 5, yPosition + 3)
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    pdf.setFont('helvetica', 'normal')
    yPosition += 15
    
    pdf.setFontSize(9)
    pdf.text(`Timeline: ${result.budgetEstimate.timeline}`, margin + 5, yPosition)
    yPosition += 15

    yPosition = addSubsection('Cost Breakdown')
    
    const budgetItems = [
      { name: 'Development', amount: result.budgetEstimate.breakdown.development, color: colors.primary },
      { name: 'Marketing', amount: result.budgetEstimate.breakdown.marketing, color: colors.secondary },
      { name: 'Operations', amount: result.budgetEstimate.breakdown.operations, color: colors.success },
      { name: 'Legal', amount: result.budgetEstimate.breakdown.legal, color: colors.warning }
    ]

    budgetItems.forEach(item => {
      yPosition = checkNewPage(8)
      const percentage = ((item.amount / result.budgetEstimate.total) * 100).toFixed(1)
      
      // Color indicator
      pdf.setFillColor(item.color[0], item.color[1], item.color[2])
      pdf.rect(margin + 5, yPosition - 3, 3, 3, 'F')
      
      pdf.setFontSize(9)
      pdf.text(`${item.name}:`, margin + 12, yPosition)
      pdf.text(`$${item.amount.toLocaleString()}`, margin + 60, yPosition)
      pdf.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
      pdf.text(`(${percentage}%)`, margin + 110, yPosition)
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      
      yPosition += 7
    })
    yPosition += 10

    // Recommendations
    yPosition = addSection('Recommendations')
    
    yPosition = addSubsection('Suggested Names')
    const namesText = result.recommendations.startupNames.join(' • ')
    yPosition = addText(namesText, 9, 5)
    yPosition += 8
    
    yPosition = addSubsection('Elevator Pitch')
    yPosition = addText(`"${result.recommendations.elevatorPitch}"`, 9, 5)
    yPosition += 10
    
    yPosition = addSubsection('100-Day Action Plan')
    result.recommendations.actionPlan.forEach((step, index) => {
      yPosition = addBulletPoint(`${index + 1}. ${step}`, colors.secondary, 5)
    })
    yPosition += 8
    
    yPosition = addSubsection('Key Improvements')
    result.recommendations.improvements.forEach(improvement => {
      yPosition = addBulletPoint(improvement, colors.warning, 5)
    })
    yPosition += 10

    // Strengths & Challenges
    yPosition = addSection('Strengths & Challenges')
    
    yPosition = addSubsection('Strengths', colors.success)
    result.pros.forEach(pro => {
      yPosition = addBulletPoint(pro, colors.success, 5)
    })
    yPosition += 8
    
    yPosition = addSubsection('Challenges', colors.danger)
    result.cons.forEach(con => {
      yPosition = addBulletPoint(con, colors.danger, 5)
    })
    yPosition += 10

    // Business Model Canvas (if space allows)
    yPosition = addSection('Business Model Canvas')
    
    const bmSections = [
      { title: 'Value Propositions', items: result.frameworks.businessModel.valuePropositions },
      { title: 'Customer Segments', items: result.frameworks.businessModel.customerSegments },
      { title: 'Revenue Streams', items: result.frameworks.businessModel.revenueStreams },
      { title: 'Key Partners', items: result.frameworks.businessModel.keyPartners }
    ]

    bmSections.forEach(section => {
      yPosition = addSubsection(section.title)
      section.items.slice(0, 3).forEach(item => { // Limit to 3 items for space
        yPosition = addBulletPoint(item, colors.secondary, 5)
      })
      yPosition += 5
    })

    // Footer on last page
    yPosition = checkNewPage(20)
    pdf.setFontSize(8)
    pdf.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
    pdf.text('Generated by IdeaLyzer - AI-Powered Business Analysis', margin, maxY + 10)
    pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, maxY + 10)

    // Save the PDF
    pdf.save(filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('Error generating PDF:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Keep the existing functions for compatibility
export { exportToJSON, exportToCSV, exportComponentToPDF } from './pdf-export'