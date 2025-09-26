# AI Provider Configuration

This application supports both Anthropic Claude and OpenAI GPT-4 models with automatic provider selection.

## Provider Priority

1. **Anthropic Claude 3.5 Sonnet** (Primary) - Used if `ANTHROPIC_API_KEY` is set
2. **OpenAI GPT-4** (Fallback) - Used if only `OPENAI_API_KEY` is set

## Environment Variables

Add one or both API keys to your `.env` file:

```env
# Primary: Anthropic Claude (recommended for better performance)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Fallback: OpenAI GPT-4
OPENAI_API_KEY=your_openai_api_key_here
```

## Model Selection

### Anthropic Claude
- **Text Generation**: `claude-3-5-sonnet-20241022`
- **Structured Output**: `claude-3-5-sonnet-20241022`
- **Vision Analysis**: `claude-3-5-sonnet-20241022`

### OpenAI GPT-4
- **Text Generation**: `gpt-4o`
- **Structured Output**: `gpt-4o`
- **Vision Analysis**: `gpt-4o`

## Getting API Keys

### Anthropic
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key

### OpenAI
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key

## Features

- **Automatic Provider Selection**: No code changes needed to switch providers
- **Fallback Support**: Seamless fallback to OpenAI if Anthropic is unavailable
- **Vision Model Support**: Both providers support image analysis
- **Structured Output**: Both providers support JSON schema validation
- **Logging**: Console logs show which provider is being used

## Cost Considerations

- **Anthropic Claude**: Generally more cost-effective for complex reasoning tasks
- **OpenAI GPT-4**: Widely supported with extensive documentation

Choose based on your specific needs, budget, and performance requirements.