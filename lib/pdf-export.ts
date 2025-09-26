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

// Color scheme for the PDF
const colors = {
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#1f2937',
  muted: '#6b7280'
}

export async function exportToPDF(
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
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    const maxY = pageHeight - 30

    // Helper function to add a header to each page (except first)
    const addHeader = (pageNumber: number) => {
      if (pageNumber > 1) {
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(150, 150, 150)
        pdf.text(`${ideaTitle} - Analysis Report`, margin, 15)
        pdf.text(`Page ${pageNumber}`, pageWidth - margin - 20, 15)
        pdf.setDrawColor(200, 200, 200)
        pdf.line(margin, 18, pageWidth - margin, 18)
        pdf.setTextColor(colors.text)
      }
    }

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace: number, currentY: number) => {
      if (currentY + requiredSpace > maxY) {
        pdf.addPage()
        const pageNum = pdf.getNumberOfPages()
        addHeader(pageNum)
        return pageNum > 1 ? 30 : 20 // Return new Y position after header
      }
      return currentY
    }

    // Helper function to add a section with proper spacing
    const addSection = (title: string, yPos: number) => {
      yPos = checkNewPage(25, yPos)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(colors.primary)
      pdf.text(title, margin, yPos)
      pdf.setTextColor(colors.text)
      pdf.setFont('helvetica', 'normal')
      return yPos + 12
    }

    // Helper function to add subsection
    const addSubsection = (title: string, yPos: number) => {
      yPos = checkNewPage(15, yPos)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(title, margin + 5, yPos)
      pdf.setFont('helvetica', 'normal')
      return yPos + 8
    }

    // Add title page with better styling
    pdf.setFillColor(139, 92, 246) // Primary color
    pdf.rect(0, 0, pageWidth, 70, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    
    // Handle long titles by wrapping
    const titleLines = pdf.splitTextToSize(ideaTitle, contentWidth)
    let titleY = 30
    titleLines.forEach((line: string) => {
      pdf.text(line, margin, titleY)
      titleY += 8
    })
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Business Idea Analysis Report', margin, titleY + 5)
    
    // Add decorative elements
    pdf.setDrawColor(255, 255, 255)
    pdf.setLineWidth(0.5)
    pdf.line(margin, titleY + 10, pageWidth - margin, titleY + 10)
    
    // Reset text color for body content
    pdf.setTextColor(colors.text)
    
    let yPosition = 90
    
    // Add metadata section
    pdf.setFontSize(11)
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, margin, yPosition)
    yPosition += 6
    
    // Quality score with better styling
    const scoreColor = result.qualityScore >= 8 ? [16, 185, 129] : 
                      result.qualityScore >= 6 ? [245, 158, 11] : [239, 68, 68]
    pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Quality Score: ${result.qualityScore}/10`, margin, yPosition)
    pdf.setTextColor(colors.text)
    pdf.setFont('helvetica', 'normal')
    yPosition += 15

    // Executive Summary Section
    yPosition = addSection('Executive Summary', yPosition)
    
    pdf.setFontSize(10)
    const summaryLines = pdf.splitTextToSize(result.summary, contentWidth)
    summaryLines.forEach((line: string) => {
      yPosition = checkNewPage(6, yPosition)
      pdf.text(line, margin + 5, yPosition)
      yPosition += 5
    })
    yPosition += 10

    // Key Metrics Section
    yPosition = addSection('Key Metrics', yPosition)
    
    const metrics = [
      { name: 'Desirability', value: result.frameworks.metrics.desirability },
      { name: 'Viability', value: result.frameworks.metrics.viability },
      { name: 'Feasibility', value: result.frameworks.metrics.feasibility },
      { name: 'Sustainability', value: result.frameworks.metrics.sustainability }
    ]

    pdf.setFontSize(10)
    metrics.forEach(metric => {
      yPosition = checkNewPage(8, yPosition)
      const color = metric.value >= 8 ? [16, 185, 129] : 
                   metric.value >= 6 ? [245, 158, 11] : [239, 68, 68]
      
      pdf.text(`${metric.name}:`, margin + 5, yPosition)
      pdf.setTextColor(color[0], color[1], color[2])
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${metric.value}/10`, margin + 50, yPosition)
      pdf.setTextColor(colors.text)
      pdf.setFont('helvetica', 'normal')
      
      // Add progress bar
      pdf.setDrawColor(220, 220, 220)
      pdf.setLineWidth(2)
      pdf.line(margin + 70, yPosition - 1, margin + 120, yPosition - 1)
      pdf.setDrawColor(color[0], color[1], color[2])
      pdf.line(margin + 70, yPosition - 1, margin + 70 + (metric.value * 5), yPosition - 1)
      
      yPosition += 8
    })
    yPosition += 10

    // BCG Matrix Section
    yPosition = addSection('BCG Matrix Analysis', yPosition)
    
    pdf.setFontSize(10)
    yPosition = checkNewPage(25, yPosition)
    
    // Category with styling
    pdf.setFont('helvetica', 'bold')
    pdf.text('Category:', margin + 5, yPosition)
    pdf.setFont('helvetica', 'normal')
    const categoryColor = result.frameworks.bcg.category === 'star' ? [245, 158, 11] :
                         result.frameworks.bcg.category === 'cash-cow' ? [16, 185, 129] :
                         result.frameworks.bcg.category === 'question-mark' ? [59, 130, 246] : [239, 68, 68]
    pdf.setTextColor(categoryColor[0], categoryColor[1], categoryColor[2])
    pdf.text(result.frameworks.bcg.category.replace('-', ' ').toUpperCase(), margin + 30, yPosition)
    pdf.setTextColor(colors.text)
    yPosition += 8
    
    pdf.text(`Market Growth: ${result.frameworks.bcg.marketGrowth}%`, margin + 5, yPosition)
    yPosition += 6
    pdf.text(`Market Share: ${result.frameworks.bcg.marketShare}%`, margin + 5, yPosition)
    yPosition += 10

    // Reasoning with proper wrapping
    pdf.setFont('helvetica', 'bold')
    pdf.text('Analysis:', margin + 5, yPosition)
    yPosition += 6
    pdf.setFont('helvetica', 'normal')
    const reasoningLines = pdf.splitTextToSize(result.frameworks.bcg.reasoning, contentWidth - 10)
    reasoningLines.forEach((line: string) => {
      yPosition = checkNewPage(5, yPosition)
      pdf.text(line, margin + 5, yPosition)
      yPosition += 5
    })
    yPosition += 10

    // SWOT Analysis Section
    yPosition = addSection('SWOT Analysis', yPosition)

    const swotSections = [
      { title: 'Strengths', items: result.frameworks.swot.strengths, color: [16, 185, 129] },
      { title: 'Weaknesses', items: result.frameworks.swot.weaknesses, color: [245, 158, 11] },
      { title: 'Opportunities', items: result.frameworks.swot.opportunities, color: [59, 130, 246] },
      { title: 'Threats', items: result.frameworks.swot.threats, color: [239, 68, 68] }
    ]

    swotSections.forEach(section => {
      yPosition = addSubsection(section.title, yPosition)
      
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      
      section.items.forEach(item => {
        yPosition = checkNewPage(6, yPosition)
        
        // Add bullet point with color
        pdf.setTextColor(section.color[0], section.color[1], section.color[2])
        pdf.text('•', margin + 10, yPosition)
        pdf.setTextColor(colors.text)
        
        // Wrap text properly
        const itemLines = pdf.splitTextToSize(item, contentWidth - 20)
        itemLines.forEach((line: string, index: number) => {
          if (index > 0) yPosition = checkNewPage(4, yPosition)
          pdf.text(line, margin + 15, yPosition)
          if (index < itemLines.length - 1) yPosition += 4
        })
        yPosition += 5
      })
      yPosition += 5
    })

    // Add Budget Estimate
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = 30
    }

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Budget Estimate', margin, yPosition)
    yPosition += 15

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Total Budget: $${result.budgetEstimate.total.toLocaleString()}`, margin + 5, yPosition)
    yPosition += 8
    pdf.text(`Timeline: ${result.budgetEstimate.timeline}`, margin + 5, yPosition)
    yPosition += 15

    pdf.setFontSize(11)
    pdf.text('Breakdown:', margin + 5, yPosition)
    yPosition += 8

    const budgetItems = [
      `Development: $${result.budgetEstimate.breakdown.development.toLocaleString()}`,
      `Marketing: $${result.budgetEstimate.breakdown.marketing.toLocaleString()}`,
      `Operations: $${result.budgetEstimate.breakdown.operations.toLocaleString()}`,
      `Legal: $${result.budgetEstimate.breakdown.legal.toLocaleString()}`
    ]

    budgetItems.forEach(item => {
      pdf.text(`• ${item}`, margin + 10, yPosition)
      yPosition += 6
    })

    yPosition += 10

    // Add Recommendations
    if (yPosition > pageHeight - 80) {
      pdf.addPage()
      yPosition = 30
    }

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Recommendations', margin, yPosition)
    yPosition += 15

    // Suggested Names
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Suggested Names:', margin + 5, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const namesText = result.recommendations.startupNames.join(', ')
    const namesLines = pdf.splitTextToSize(namesText, pageWidth - 2 * margin - 10)
    pdf.text(namesLines, margin + 10, yPosition)
    yPosition += namesLines.length * 4 + 10

    // Elevator Pitch
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 30
    }

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Elevator Pitch:', margin + 5, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'italic')
    const pitchLines = pdf.splitTextToSize(`"${result.recommendations.elevatorPitch}"`, pageWidth - 2 * margin - 10)
    pdf.text(pitchLines, margin + 10, yPosition)
    yPosition += pitchLines.length * 4 + 10

    // Action Plan
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = 30
    }

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('100-Day Action Plan:', margin + 5, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    result.recommendations.actionPlan.forEach((step, index) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage()
        yPosition = 30
      }
      const stepLines = pdf.splitTextToSize(`${index + 1}. ${step}`, pageWidth - 2 * margin - 15)
      pdf.text(stepLines, margin + 10, yPosition)
      yPosition += stepLines.length * 4 + 3
    })

    // Add pros and cons
    if (yPosition > pageHeight - 80) {
      pdf.addPage()
      yPosition = 30
    }

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Strengths & Challenges', margin, yPosition)
    yPosition += 15

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Strengths:', margin + 5, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    result.pros.forEach(pro => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage()
        yPosition = 30
      }
      const proLines = pdf.splitTextToSize(`• ${pro}`, pageWidth - 2 * margin - 15)
      pdf.text(proLines, margin + 10, yPosition)
      yPosition += proLines.length * 4 + 2
    })

    yPosition += 8

    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 30
    }

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Challenges:', margin + 5, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    result.cons.forEach(con => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage()
        yPosition = 30
      }
      const conLines = pdf.splitTextToSize(`• ${con}`, pageWidth - 2 * margin - 15)
      pdf.text(conLines, margin + 10, yPosition)
      yPosition += conLines.length * 4 + 2
    })

    // Save the PDF
    pdf.save(filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('Error generating PDF:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function exportComponentToPDF(
  elementId: string,
  filename: string,
  options: PDFExportOptions = {}
) {
  const {
    quality = 1.0,
    format = 'a4',
    orientation = 'portrait'
  } = options

  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    
    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    const imgWidth = pageWidth - 20 // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 10 // 10mm top margin

    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pageHeight - 20 // Account for margins

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - 20
    }

    pdf.save(filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('Error generating PDF from component:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
export
 function exportToJSON(
  result: AnalysisResult,
  ideaTitle: string,
  filename?: string
) {
  const exportData = {
    metadata: {
      title: ideaTitle,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    },
    analysis: result
  }

  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = filename || `${ideaTitle.replace(/[^a-zA-Z0-9]/g, '_')}_analysis.json`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  return { success: true, filename: link.download }
}

export function exportToCSV(
  result: AnalysisResult,
  ideaTitle: string,
  filename?: string
) {
  const csvData = [
    ['Metric', 'Value'],
    ['Idea Title', ideaTitle],
    ['Quality Score', result.qualityScore.toString()],
    ['Desirability', result.frameworks.metrics.desirability.toString()],
    ['Viability', result.frameworks.metrics.viability.toString()],
    ['Feasibility', result.frameworks.metrics.feasibility.toString()],
    ['Sustainability', result.frameworks.metrics.sustainability.toString()],
    ['BCG Category', result.frameworks.bcg.category],
    ['Market Growth', `${result.frameworks.bcg.marketGrowth}%`],
    ['Market Share', `${result.frameworks.bcg.marketShare}%`],
    ['Total Budget', `$${result.budgetEstimate.total.toLocaleString()}`],
    ['Development Cost', `$${result.budgetEstimate.breakdown.development.toLocaleString()}`],
    ['Marketing Cost', `$${result.budgetEstimate.breakdown.marketing.toLocaleString()}`],
    ['Operations Cost', `$${result.budgetEstimate.breakdown.operations.toLocaleString()}`],
    ['Legal Cost', `$${result.budgetEstimate.breakdown.legal.toLocaleString()}`],
    ['Timeline', result.budgetEstimate.timeline],
    ['', ''],
    ['Strengths', ''],
    ...result.pros.map(pro => ['', pro]),
    ['', ''],
    ['Challenges', ''],
    ...result.cons.map(con => ['', con]),
    ['', ''],
    ['SWOT - Strengths', ''],
    ...result.frameworks.swot.strengths.map(strength => ['', strength]),
    ['', ''],
    ['SWOT - Weaknesses', ''],
    ...result.frameworks.swot.weaknesses.map(weakness => ['', weakness]),
    ['', ''],
    ['SWOT - Opportunities', ''],
    ...result.frameworks.swot.opportunities.map(opportunity => ['', opportunity]),
    ['', ''],
    ['SWOT - Threats', ''],
    ...result.frameworks.swot.threats.map(threat => ['', threat]),
    ['', ''],
    ['Suggested Names', ''],
    ...result.recommendations.startupNames.map(name => ['', name]),
    ['', ''],
    ['Action Plan', ''],
    ...result.recommendations.actionPlan.map((step, index) => ['', `${index + 1}. ${step}`])
  ]

  const csvContent = csvData.map(row => 
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n')

  const dataBlob = new Blob([csvContent], { type: 'text/csv' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = filename || `${ideaTitle.replace(/[^a-zA-Z0-9]/g, '_')}_analysis.csv`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  return { success: true, filename: link.download }
}