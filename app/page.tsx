"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, RotateCcw, Eye, Trophy, RefreshCw, CheckCircle2, X } from "lucide-react"
import { CodeEditor } from "@/components/code-editor"
import { PondVisualization } from "@/components/pond-visualization"
import { levels } from "@/lib/levels"
import Image from "next/image"

export default function FlexboxFroggyClone() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [userCode, setUserCode] = useState("")
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set())
  const [mounted, setMounted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [levelStartTime, setLevelStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)

  const level = levels[currentLevel]

  useEffect(() => {
    const interval = setInterval(() => {
      if (levelStartTime > 0) {
        const elapsed = Math.floor((Date.now() - levelStartTime) / 1000)
        setElapsedTime(elapsed)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [levelStartTime])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const savedProgress = localStorage.getItem("chegg-flexbox-progress")
    if (savedProgress) {
      try {
        const progressArray = JSON.parse(savedProgress)
        setCompletedLevels(new Set(progressArray))
      } catch (error) {
        console.error("Failed to load progress:", error)
        setCompletedLevels(new Set())
      }
    } else {
      setCompletedLevels(new Set())
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    try {
      localStorage.setItem("chegg-flexbox-progress", JSON.stringify([...completedLevels]))
    } catch (error) {
      console.error("Failed to save progress:", error)
    }
  }, [completedLevels, mounted])

  useEffect(() => {
    if (!mounted) return

    setIsCorrect(false)
    setHasChecked(false)
    setShowAnswer(false)
    setLevelStartTime(Date.now())
    setElapsedTime(0)

    if (completedLevels.has(currentLevel)) {
      const savedSolution = localStorage.getItem(`chegg-flexbox-solution-${currentLevel}`)
      if (savedSolution) {
        setUserCode(savedSolution)
      } else {
        setUserCode("")
      }
    } else {
      setUserCode("")
    }
  }, [currentLevel, completedLevels, mounted])

  const checkSolution = () => {
    const normalizedUserCode = userCode.trim().replace(/\s+/g, " ")
    const normalizedSolution = level.solution.trim().replace(/\s+/g, " ")

    const correct = normalizedUserCode === normalizedSolution

    setIsCorrect(correct)
    setHasChecked(true)

    if (correct) {
      setShowCelebration(true)
      setTimeout(() => {
        setShowCelebration(false)
      }, 5000)

      setTimeout(() => {
        setCompletedLevels((prev) => new Set([...prev, currentLevel]))
        try {
          localStorage.setItem(`chegg-flexbox-solution-${currentLevel}`, userCode)
        } catch (error) {
          console.error("Failed to save solution:", error)
        }
      }, 500)
    }
  }

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1)
      setShowCelebration(false)
    }
  }

  const prevLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1)
    }
  }

  const resetCode = () => {
    setUserCode("")
    setIsCorrect(false)
    setShowAnswer(false)
    setHasChecked(false)
    setShowCelebration(false)
    setLevelStartTime(Date.now())
    setElapsedTime(0)

    if (mounted) {
      try {
        localStorage.removeItem(`chegg-flexbox-code-${currentLevel}`)
        localStorage.removeItem(`chegg-flexbox-solution-${currentLevel}`)
      } catch (error) {
        console.error("Failed to remove localStorage items:", error)
      }
    }

    setCompletedLevels((prev) => {
      const newSet = new Set(prev)
      newSet.delete(currentLevel)
      return newSet
    })
  }

  const resetAllProgress = () => {
    if (confirm("Are you sure you want to reset all progress? This action cannot be undone.")) {
      setCompletedLevels(new Set())

      if (mounted) {
        try {
          localStorage.removeItem("chegg-flexbox-progress")
          for (let i = 0; i < levels.length; i++) {
            localStorage.removeItem(`chegg-flexbox-code-${i}`)
            localStorage.removeItem(`chegg-flexbox-solution-${i}`)
          }
        } catch (error) {
          console.error("Failed to clear localStorage:", error)
        }
      }

      setCurrentLevel(0)
      resetCode()
    }
  }

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  const progressPercentage = (completedLevels.size / levels.length) * 100

  const answerUnlocked = elapsedTime >= 240 // 4 minutes

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/chegg-logo.webp" alt="Chegg" width={100} height={40} className="h-10 w-auto" />
              <div className="h-8 w-px bg-border"></div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Flexbox Classroom</h1>
                <p className="text-xs text-muted-foreground">Master CSS Flexbox</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3 bg-muted px-4 py-2 rounded-lg">
                <Trophy className="w-5 h-5 text-primary" />
                <div className="relative w-32 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-primary transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {completedLevels.size}/{levels.length}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={resetAllProgress}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                title="Reset all progress"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Reset All</span>
              </Button>

              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevLevel}
                  disabled={currentLevel === 0}
                  className="disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm font-medium px-3">
                  {currentLevel + 1}/{levels.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextLevel}
                  disabled={currentLevel === levels.length - 1}
                  className="disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 30}%`,
                  top: `${20 + (Math.random() - 0.5) * 20}%`,
                  background: i % 2 === 0 ? "var(--color-primary)" : "var(--color-accent)",
                  animationDelay: `${i * 0.05}s`,
                  "--tx": `${(Math.random() - 0.5) * 200}px`,
                }}
              />
            ))}
            <div className="relative bg-card rounded-xl p-8 shadow-2xl animate-bounce-in border-2 border-primary">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Brilliant!</h2>
                <p className="text-lg text-muted-foreground">Level Complete</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center relative">
                  <span className="text-primary-foreground font-bold text-lg">{currentLevel + 1}</span>
                  {completedLevels.has(currentLevel) && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-success-foreground" fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">Level {currentLevel + 1}</h2>
                  <p className="text-sm text-muted-foreground">Flexbox Challenge</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-lg font-mono font-semibold text-foreground">
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, "0")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-foreground leading-relaxed">{level.description}</p>
                </div>

                {level.properties && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">CSS Properties:</h3>
                    <ul className="space-y-2">
                      {level.properties.map((prop, index) => (
                        <li key={index} className="flex gap-2 p-3 rounded-lg bg-muted">
                          <code className="text-primary font-mono text-sm font-medium">{prop.name}:</code>
                          <span className="text-muted-foreground text-sm flex-1">{prop.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAnswer}
                    disabled={!answerUnlocked}
                    className={
                      answerUnlocked
                        ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                        : "opacity-50 cursor-not-allowed"
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {answerUnlocked ? (showAnswer ? "Hide Answer" : "Show Answer") : `Answer in ${240 - elapsedTime}s`}
                  </Button>

                  {showAnswer && (
                    <div className="p-3 bg-accent/10 border border-accent rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Solution:</p>
                      <code className="block text-sm bg-muted p-3 rounded font-mono text-primary">
                        {level.solution}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">CSS Editor</h3>
                <Button variant="outline" size="sm" onClick={resetCode}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              <CodeEditor
                value={userCode}
                onChange={setUserCode}
                onCheck={checkSolution}
                isCorrect={isCorrect}
                targetSelector={level.targetSelector}
              />

              {hasChecked && isCorrect && (
                <div className="mt-4 p-4 bg-success/10 border border-success rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                    <div>
                      <p className="text-success font-semibold">Perfect Solution!</p>
                      <p className="text-success/80 text-sm">Students are on their desks!</p>
                    </div>
                  </div>
                  {currentLevel < levels.length - 1 ? (
                    <Button onClick={nextLevel} className="w-full bg-success hover:bg-success/90 text-white">
                      <Trophy className="w-5 h-5 mr-2" />
                      Submit & Continue to Next Level
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <div className="text-center">
                      <p className="text-success font-semibold mb-2">Congratulations! You completed all levels!</p>
                      <Button
                        onClick={() => setCurrentLevel(0)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Play Again
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {hasChecked && !isCorrect && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <div className="flex items-center gap-3">
                    <X className="w-6 h-6 text-destructive" />
                    <div>
                      <p className="text-destructive font-semibold">Not Quite Right</p>
                      <p className="text-destructive/80 text-sm">Try adjusting your CSS properties and check again</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <Card className="p-6 shadow-sm lg:sticky lg:top-24 h-fit">
            <h3 className="font-semibold text-foreground mb-4">Classroom Preview</h3>
            <PondVisualization level={level} userCode={userCode} isCorrect={isCorrect} />
          </Card>
        </div>
      </div>
    </div>
  )
}
