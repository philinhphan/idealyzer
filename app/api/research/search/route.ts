import { NextRequest, NextResponse } from 'next/server'

interface EdmondSearchResult {
  id: string
  title: string
  description: string
  authors: string
  doi?: string
  url: string
  year?: number
  subjects: string[]
}

async function searchEdmond(query: string): Promise<EdmondSearchResult[]> {
  try {
    // Mock data for demonstration - in production, this would call the actual Edmond API
    // The real implementation would use the Edmond repository search API
    const mockResults: EdmondSearchResult[] = [
      {
        id: '1',
        title: 'Machine Learning Applications in Sustainable Energy Systems',
        description: 'This research explores the application of advanced machine learning techniques for optimizing renewable energy systems and predicting energy consumption patterns.',
        authors: 'Dr. Sarah Mueller, Prof. Andreas Schmidt, Dr. Lisa Chen',
        doi: '10.17617/3.7x',
        url: 'https://edmond.mpg.de/dataset.xhtml?persistentId=doi:10.17617/3.7x',
        year: 2024,
        subjects: ['Machine Learning', 'Renewable Energy', 'Sustainability', 'Optimization']
      },
      {
        id: '2',
        title: 'AI-Driven Innovation in Healthcare: A Comprehensive Analysis',
        description: 'Comprehensive analysis of artificial intelligence applications in modern healthcare, including diagnostic tools, treatment optimization, and patient care systems.',
        authors: 'Prof. Michael Wagner, Dr. Emma Thompson, Dr. Rajesh Kumar',
        doi: '10.17617/3.8y',
        url: 'https://edmond.mpg.de/dataset.xhtml?persistentId=doi:10.17617/3.8y',
        year: 2024,
        subjects: ['Artificial Intelligence', 'Healthcare', 'Medical Technology', 'Patient Care']
      },
      {
        id: '3',
        title: 'Quantum Computing for Complex Optimization Problems',
        description: 'Investigation into quantum computing algorithms for solving NP-hard optimization problems in logistics, finance, and scientific computing.',
        authors: 'Dr. Johann Fischer, Prof. Maria Gonzalez, Dr. Wei Zhang',
        doi: '10.17617/3.9z',
        url: 'https://edmond.mpg.de/dataset.xhtml?persistentId=doi:10.17617/3.9z',
        year: 2023,
        subjects: ['Quantum Computing', 'Optimization', 'Algorithms', 'Complex Systems']
      },
      {
        id: '4',
        title: 'Sustainable Materials Science: Bio-Based Alternatives',
        description: 'Research on developing biodegradable and sustainable materials from renewable resources for industrial applications.',
        authors: 'Prof. Anna Schneider, Dr. Carlos Rodriguez, Dr. Kim Park',
        doi: '10.17617/3.1a',
        url: 'https://edmond.mpg.de/dataset.xhtml?persistentId=doi:10.17617/3.1a',
        year: 2024,
        subjects: ['Materials Science', 'Sustainability', 'Biodegradable Materials', 'Green Chemistry']
      },
      {
        id: '5',
        title: 'Neural Networks in Climate Modeling and Prediction',
        description: 'Application of deep neural networks for improving climate models and long-term weather prediction accuracy.',
        authors: 'Dr. Thomas Braun, Prof. Jennifer Liu, Dr. Ahmed Hassan',
        doi: '10.17617/3.2b',
        url: 'https://edmond.mpg.de/dataset.xhtml?persistentId=doi:10.17617/3.2b',
        year: 2023,
        subjects: ['Neural Networks', 'Climate Science', 'Weather Prediction', 'Deep Learning']
      }
    ]

    // Filter results based on query
    const filteredResults = mockResults.filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase()) ||
      result.subjects.some(subject => subject.toLowerCase().includes(query.toLowerCase())) ||
      result.authors.toLowerCase().includes(query.toLowerCase())
    )

    return filteredResults.map(result => ({
      ...result,
      selected: false
    }))
  } catch (error) {
    console.error('Error searching Edmond:', error)
    throw new Error('Failed to search research database')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const results = await searchEdmond(query.trim())

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    })
  } catch (error) {
    console.error('Research search API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to search research database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'GET method not allowed. Use POST with query parameter.' },
    { status: 405 }
  )
}