/**
 * Safely performs DOM operations with error handling
 */
export const domUtils = {
  /**
   * Safely scrolls an element into view with fallback
   */
  safelyScrollIntoView: (element: HTMLElement | null, options?: ScrollIntoViewOptions): void => {
    if (!element) return

    try {
      element.scrollIntoView(options)
    } catch (error) {
      console.error("Error scrolling element into view:", error)

      // Try a simpler scroll as fallback
      try {
        element.scrollIntoView()
      } catch (secondError) {
        console.error("Fallback scroll also failed:", secondError)
      }
    }
  },

  /**
   * Safely adds an event listener with automatic cleanup
   */
  safelyAddEventListener: <K extends keyof WindowEventMap>(
    element: Window | Document | HTMLElement | null,
    event: K,
    handler: (this: Window, ev: WindowEventMap[K]) => any,
  ): (() => void) => {
    if (!element) return () => {}

    try {
      element.addEventListener(event, handler)
      return () => {
        try {
          element.removeEventListener(event, handler)
        } catch (error) {
          console.error(`Error removing ${event} listener:`, error)
        }
      }
    } catch (error) {
      console.error(`Error adding ${event} listener:`, error)
      return () => {}
    }
  },
}
