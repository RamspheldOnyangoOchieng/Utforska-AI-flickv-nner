export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background/95 to-primary/10">
      <div className="max-w-md w-full text-center space-y-8 backdrop-blur-sm bg-card/80 rounded-xl shadow-xl p-8 border border-border relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-secondary/10 blur-3xl"></div>

        <div className="relative z-10 space-y-6">
          <div className="inline-block relative">
            <div className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          </div>

          <h2 className="text-2xl font-semibold text-foreground">Generating AI Magic</h2>

          <div className="max-w-md mx-auto">
            <p className="text-muted-foreground">Our AI characters are working on your request...</p>
          </div>
        </div>

        <div className="relative w-full h-12 mt-8 bg-muted rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary animate-progress"></div>
        </div>
      </div>
    </div>
  )
}
