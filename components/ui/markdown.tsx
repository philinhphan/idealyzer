import React from 'react'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  children: string | string[]
  className?: string
}

export function Markdown({ children, className }: MarkdownProps) {
  if (!children) return null
  
  // Handle different data types and clean the content
  let content: string
  
  try {
    if (Array.isArray(children)) {
      content = children.join('\n')
    } else if (typeof children === 'string') {
      content = children
    } else {
      content = String(children)
    }
    
    // Clean the content - handle JSON serialization artifacts
    content = content
      .replace(/^["',\s]+|["',\s]+$/g, '') // Remove leading/trailing quotes, commas, spaces
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\\n/g, '\n') // Convert escaped newlines
      .trim()
    
    if (!content) return null
    
    // If content still looks like JSON or has problematic characters, render as plain text
    if (content.startsWith('",') || content.endsWith(',"') || (content.startsWith('"') && content.endsWith('"'))) {
      content = content.replace(/^"|"$/g, '')
    }
    
  } catch (error) {
    console.error('Error processing markdown content:', error)
    return (
      <div className={cn('text-foreground', className)}>
        {String(children)}
      </div>
    )
  }

  // Enhanced markdown rendering with better parsing
  const renderContent = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let inList = false
    let listItems: React.ReactNode[] = []
    
    const flushList = () => {
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc pl-6 mb-4 space-y-1">
            {listItems}
          </ul>
        )
        listItems = []
        inList = false
      }
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Skip empty lines
      if (!line) {
        flushList()
        continue
      }
      
      // Headers
      if (line.startsWith('### ')) {
        flushList()
        elements.push(
          <h3 key={i} className="text-lg font-semibold mb-3 mt-4 text-foreground first:mt-0">
            {line.substring(4)}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        flushList()
        elements.push(
          <h2 key={i} className="text-xl font-bold mb-4 mt-6 text-foreground first:mt-0">
            {line.substring(3)}
          </h2>
        )
      } else if (line.startsWith('# ')) {
        flushList()
        elements.push(
          <h1 key={i} className="text-2xl font-bold mb-4 mt-6 text-foreground first:mt-0">
            {line.substring(2)}
          </h1>
        )
      }
      // List items
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        const listContent = line.substring(2)
        const processedContent = processInlineMarkdown(listContent)
        listItems.push(
          <li key={i} className="text-foreground leading-relaxed">
            {processedContent}
          </li>
        )
        inList = true
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line)) {
        flushList()
        const match = line.match(/^(\d+)\.\s(.*)/)
        if (match) {
          const processedContent = processInlineMarkdown(match[2])
          elements.push(
            <div key={i} className="flex items-start gap-2 mb-2">
              <span className="font-medium text-foreground">{match[1]}.</span>
              <span className="text-foreground leading-relaxed">{processedContent}</span>
            </div>
          )
        }
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        flushList()
        const quoteContent = processInlineMarkdown(line.substring(2))
        elements.push(
          <blockquote key={i} className="border-l-4 border-primary pl-4 italic mb-3 text-muted-foreground">
            {quoteContent}
          </blockquote>
        )
      }
      // Regular paragraphs
      else {
        flushList()
        const processedContent = processInlineMarkdown(line)
        elements.push(
          <p key={i} className="mb-3 text-foreground leading-relaxed last:mb-0">
            {processedContent}
          </p>
        )
      }
    }
    
    // Flush any remaining list items
    flushList()
    
    return elements
  }

  // Process inline markdown (bold, italic, code)
  const processInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let currentIndex = 0
    
    // Process bold text (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g
    let match
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index))
      }
      
      // Add bold text
      parts.push(
        <strong key={match.index} className="font-semibold">
          {match[1]}
        </strong>
      )
      
      currentIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex))
    }
    
    // If no markdown was found, return the original text
    if (parts.length === 0) {
      return text
    }
    
    return <>{parts}</>
  }

  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      {renderContent(content)}
    </div>
  )
}