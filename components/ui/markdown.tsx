import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

  // Try to render with ReactMarkdown, fall back to plain text if it fails
  try {
    return (
      <div className={cn('prose prose-sm max-w-none prose-invert', className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-medium mb-2 text-foreground">{children}</h4>
            ),
            p: ({ children }) => (
              <p className="mb-2 text-foreground leading-relaxed last:mb-0">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-2 space-y-1 last:mb-0">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-2 space-y-1 last:mb-0">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-foreground leading-relaxed">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-foreground">{children}</em>
            ),
            code: ({ children }) => (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-2 last:mb-0">{children}</pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary pl-4 italic mb-2 text-muted-foreground last:mb-0">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  } catch (error) {
    console.error('Error rendering markdown:', error)
    // Fallback to plain text rendering
    return (
      <div className={cn('text-foreground leading-relaxed', className)}>
        {content.split('\n').map((line, index) => (
          <p key={index} className="mb-2 last:mb-0">
            {line}
          </p>
        ))}
      </div>
    )
  }
}