'use client' 
 
import { useEffect } from 'react'
 
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <main className="hero min-h-screen bg-base-200 px-4">
      <div className="hero-content w-full max-w-md p-0">
        <div className="card w-full border border-error/20 bg-base-100 shadow-xl">
          <div className="card-body items-center gap-4 text-center">
            <div className="alert alert-error justify-center bg-error/10 text-error">
              <span aria-hidden="true" className="text-2xl">!</span>
            </div>
            <h2 className="card-title text-2xl">Robô desconfigurado!</h2>
            <p className="text-base-content/70">
              Aconteceu um erro inesperado. Tente novamente ou contate o suporte se o problema persistir.
            </p>
            <div className="card-actions mt-2">
              <button
                className="btn btn-error text-white"
                onClick={
                  // Attempt to recover by re-fetching and re-rendering the segment
                  () => retry()
                }
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}