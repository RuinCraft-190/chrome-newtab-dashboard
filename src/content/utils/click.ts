export function simulateClick(element: HTMLElement, options: MouseEventInit = {}): void {
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
    ...options
  })
  element.dispatchEvent(event)
}

export function simulateMouseEvents(element: HTMLElement, delay = 100): void {
  const events = ['mousedown', 'mouseup', 'click']

  events.forEach((eventType, index) => {
    setTimeout(() => {
      const event = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true
      })
      element.dispatchEvent(event)
    }, index * delay)
  })
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function randomDelay(min = 500, max = 2000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return sleep(delay)
}
