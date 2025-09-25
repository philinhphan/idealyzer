import { IdeaInputForm } from "@/components/idea-input-form"

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-balance mb-4">Analyze Your Startup Idea</h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Upload your files, describe your concept, and get comprehensive AI-powered analysis using proven business
            frameworks.
          </p>
        </div>

        <IdeaInputForm />
      </div>
    </main>
  )
}
