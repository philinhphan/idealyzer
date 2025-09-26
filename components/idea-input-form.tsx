"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, ImageIcon, X, Plus, Loader2, Search, ExternalLink, Database } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface IdeaFormData {
  title: string
  description: string
  keyFeatures: string[]
  valueProposition: string
  concept: string
  background: {
    type: "research" | "company" | "individual"
    organization: string
    department: string
    industry: string
  }
  source: "research" | "design-sprint" | "ideation-workshop" | "other"
  files: File[]
  researchData?: ResearchItem[]
}

interface ResearchItem {
  id: string
  title: string
  description: string
  authors: string
  doi?: string
  url: string
  year?: number
  subjects: string[]
  selected: boolean
}

export function IdeaInputForm() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState<IdeaFormData>({
    title: "",
    description: "",
    keyFeatures: [""],
    valueProposition: "",
    concept: "",
    background: {
      type: "individual",
      organization: "",
      department: "",
      industry: "",
    },
    source: "other",
    files: [],
    researchData: [],
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // Research-related state
  const [researchQuery, setResearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ResearchItem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...acceptedFiles],
    }))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "application/vnd.ms-powerpoint": [".ppt"],
    },
    multiple: true,
  })

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, ""],
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: prev.keyFeatures.map((feature, i) => (i === index ? value : feature)),
    }))
  }

  const removeFeature = (index: number) => {
    if (formData.keyFeatures.length > 1) {
      setFormData((prev) => ({
        ...prev,
        keyFeatures: prev.keyFeatures.filter((_, i) => i !== index),
      }))
    }
  }

  const searchMaxPlanckResearch = async () => {
    if (!researchQuery.trim()) {
      toast.error("Please enter a search term")
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch('/api/research/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: researchQuery }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const results = await response.json()
      setSearchResults(results.data || [])
      toast.success(`Found ${results.data?.length || 0} research papers`)
    } catch (error) {
      console.error('Research search error:', error)
      toast.error('Failed to search research. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const toggleResearchSelection = (id: string) => {
    setSearchResults(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    )
  }

  const addSelectedResearch = () => {
    const selectedItems = searchResults.filter(item => item.selected)
    setFormData(prev => ({
      ...prev,
      researchData: [...(prev.researchData || []), ...selectedItems],
    }))
    setSearchResults(prev => prev.map(item => ({ ...item, selected: false })))
    toast.success(`Added ${selectedItems.length} research paper(s) to your analysis`)
  }

  const removeResearchItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      researchData: prev.researchData?.filter(item => item.id !== id) || [],
    }))
  }

  const handleSubmit = async () => {
    setIsAnalyzing(true)

    try {
      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("keyFeatures", JSON.stringify(formData.keyFeatures.filter((f) => f.trim())))
      submitData.append("valueProposition", formData.valueProposition)
      submitData.append("concept", formData.concept)
      submitData.append("background", JSON.stringify(formData.background))
      submitData.append("source", formData.source)
      submitData.append("researchData", JSON.stringify(formData.researchData || []))

      formData.files.forEach((file) => {
        submitData.append("files", file)
      })

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()

      sessionStorage.setItem("analysisResult", JSON.stringify(result))
      sessionStorage.setItem("ideaData", JSON.stringify(formData))

      // Save to localStorage for dashboard persistence
      const storedIdeas = JSON.parse(localStorage.getItem("analyzedIdeas") || "[]")
      const newIdea = {
        id: Date.now().toString(),
        title: formData.title,
        result: result,
        createdAt: new Date().toISOString(),
      }
      storedIdeas.push(newIdea)
      localStorage.setItem("analyzedIdeas", JSON.stringify(storedIdeas))

      router.push("/results")
    } catch (error) {
      console.error("Analysis error:", error)
      toast.error("Failed to analyze idea. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const renderStep1 = () => {
    return (
      <div className="space-y-6">
      {/* Always visible title and description */}
      <div>
        <Label htmlFor="title" className="text-base font-medium">
          Idea Title *
        </Label>
        <Input
          id="title"
          placeholder="e.g., AI-powered fitness coach app"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-base font-medium">
          Idea Description *
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your idea in detail. What problem does it solve? How does it work?"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          className="mt-2 min-h-32"
        />
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Upload Files</TabsTrigger>
          <TabsTrigger value="research" className="gap-2">
            <Database className="h-4 w-4" />
            Max Planck Research
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6 mt-6">
          <div>
            <Label className="text-base font-medium">Upload Supporting Files</Label>
            <div
              {...getRootProps()}
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-primary">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-foreground font-medium mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">PDFs, images, presentations, or text files</p>
                </div>
              )}
            </div>

            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      {file.type.startsWith("image/") ? (
                        <ImageIcon className="h-5 w-5 text-primary" />
                      ) : (
                        <FileText className="h-5 w-5 text-primary" />
                      )}
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
      </TabsContent>

      <TabsContent value="research" className="space-y-6 mt-6">
        <div>
          <Label className="text-base font-medium">
            Search Max Planck Institute Research
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Find existing research papers and datasets to incorporate into your analysis
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter keywords (e.g., 'artificial intelligence', 'sustainable energy')"
              value={researchQuery}
              onChange={(e) => setResearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMaxPlanckResearch()}
              className="flex-1"
            />
            <Button onClick={searchMaxPlanckResearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div>
            <Label className="text-base font-medium">Search Results</Label>
            <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleResearchSelection(item.id)}
                          className="rounded"
                        />
                        <h4 className="font-medium text-sm">{item.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.authors}</span>
                        <span>{item.year}</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {item.subjects.slice(0, 3).map((subject, idx) => (
                          <span key={idx} className="bg-muted px-2 py-1 rounded text-xs">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={addSelectedResearch}
              disabled={!searchResults.some(item => item.selected)}
              className="mt-3 w-full"
            >
              Add Selected Research ({searchResults.filter(item => item.selected).length})
            </Button>
          </div>
        )}

        {formData.researchData && formData.researchData.length > 0 && (
          <div>
            <Label className="text-base font-medium">Added Research Papers</Label>
            <div className="mt-3 space-y-2">
              {formData.researchData.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div>
                    <h5 className="font-medium text-sm">{item.title}</h5>
                    <p className="text-xs text-muted-foreground">{item.authors} ({item.year})</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResearchItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
      </div>
    )
  }

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Key Features</Label>
        <p className="text-sm text-muted-foreground mb-3">What can users do with your idea?</p>
        <div className="space-y-3">
          {formData.keyFeatures.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder={`Feature ${index + 1}`}
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                className="flex-1"
              />
              {formData.keyFeatures.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addFeature} className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="valueProposition" className="text-base font-medium">
          Value Proposition
        </Label>
        <p className="text-sm text-muted-foreground mb-2">How does your idea add value to the life/work of users?</p>
        <Textarea
          id="valueProposition"
          placeholder="Describe the unique value your idea provides..."
          value={formData.valueProposition}
          onChange={(e) => setFormData((prev) => ({ ...prev, valueProposition: e.target.value }))}
          className="min-h-24"
        />
      </div>

      <div>
        <Label htmlFor="concept" className="text-base font-medium">
          Implementation Concept
        </Label>
        <p className="text-sm text-muted-foreground mb-2">How can you implement/build your idea?</p>
        <Textarea
          id="concept"
          placeholder="Describe your technical approach, business model, or implementation strategy..."
          value={formData.concept}
          onChange={(e) => setFormData((prev) => ({ ...prev, concept: e.target.value }))}
          className="min-h-24"
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Background Information</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <Label htmlFor="backgroundType" className="text-sm">
              Type
            </Label>
            <Select
              value={formData.background.type}
              onValueChange={(value: "research" | "company" | "individual") =>
                setFormData((prev) => ({
                  ...prev,
                  background: { ...prev.background, type: value },
                }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="research">Research Institute</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="organization" className="text-sm">
              Organization
            </Label>
            <Input
              id="organization"
              placeholder="Company/Institute name"
              value={formData.background.organization}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  background: { ...prev.background, organization: e.target.value },
                }))
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="department" className="text-sm">
              Department
            </Label>
            <Input
              id="department"
              placeholder="Department or team"
              value={formData.background.department}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  background: { ...prev.background, department: e.target.value },
                }))
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="industry" className="text-sm">
              Industry
            </Label>
            <Input
              id="industry"
              placeholder="Industry sector"
              value={formData.background.industry}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  background: { ...prev.background, industry: e.target.value },
                }))
              }
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">Idea Source</Label>
        <Select
          value={formData.source}
          onValueChange={(value: typeof formData.source) => setFormData((prev) => ({ ...prev, source: value }))}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="design-sprint">Design Sprint Workshop</SelectItem>
            <SelectItem value="ideation-workshop">Ideation Workshop</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Submit Your Idea for Analysis</CardTitle>
        <CardDescription>
          Step {currentStep} of {totalSteps}:{" "}
          {currentStep === 1
            ? "Basic Information & Files"
            : currentStep === 2
              ? "Features & Value Proposition"
              : "Background & Context"}
        </CardDescription>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="flex justify-between pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || isAnalyzing}
          >
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
              disabled={(currentStep === 1 && (!formData.title || !formData.description)) || isAnalyzing}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.description || isAnalyzing}
              className="bg-primary hover:bg-primary/90"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Idea"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
