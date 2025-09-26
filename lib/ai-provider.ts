import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"

export interface AIProvider {
  name: 'anthropic' | 'openai'
  model: any
  textModel: string
  objectModel: string
  visionModel: string
}

/**
 * Get the AI provider based on available API keys
 * Prioritizes Anthropic if available, falls back to OpenAI
 */
export function getAIProvider(): AIProvider {
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY

  if (hasAnthropicKey) {
    return {
      name: 'anthropic',
      model: anthropic,
      textModel: 'claude-3-5-sonnet-20241022',
      objectModel: 'claude-3-5-sonnet-20241022',
      visionModel: 'claude-3-5-sonnet-20241022'
    }
  }

  if (hasOpenAIKey) {
    return {
      name: 'openai',
      model: openai,
      textModel: 'gpt-4o',
      objectModel: 'gpt-4o',
      visionModel: 'gpt-4o'
    }
  }

  throw new Error('No AI provider API key found. Please add either ANTHROPIC_API_KEY or OPENAI_API_KEY to your environment variables.')
}

/**
 * Check if any AI provider is configured
 */
export function hasAIProvider(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY)
}
/**
 
* Get the appropriate model for image analysis
 * Both Anthropic Claude and OpenAI GPT-4o support vision
 */
export function getVisionModel() {
  const provider = getAIProvider()
  return provider.model(provider.visionModel)
}

/**
 * Get provider-specific configuration for image analysis
 */
export function getImageAnalysisConfig() {
  const provider = getAIProvider()

  if (provider.name === 'anthropic') {
    return {
      maxImageSize: 5 * 1024 * 1024, // 5MB limit for Anthropic
      supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxImages: 20 // Claude supports up to 20 images per request
    }
  }

  // OpenAI configuration
  return {
    maxImageSize: 20 * 1024 * 1024, // 20MB limit for OpenAI
    supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxImages: 10 // GPT-4o supports multiple images but with practical limits
  }
}