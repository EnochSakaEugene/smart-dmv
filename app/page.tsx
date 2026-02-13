import { FormStepper } from "@/components/form/form-stepper"

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold uppercase tracking-wide text-foreground sm:text-2xl">
            DC Driver License or Identification Card
          </h1>
          <h2 className="text-lg font-bold uppercase text-foreground">
            Application
          </h2>
          <p className="mt-2 text-xs italic text-muted-foreground">
            The information you provide will be used to register you to vote
            unless you decline in Section G.
          </p>
        </div>

        {/* Multi-Step Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <FormStepper />
        </form>
      </main>
    </div>
  )
}
