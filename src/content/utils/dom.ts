export function querySelectorSafe(selector: string): Element | null {
  try {
    return document.querySelector(selector)
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error)
    return null
  }
}

export function querySelectorAllSafe(selector: string): NodeListOf<Element> {
  try {
    return document.querySelectorAll(selector)
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error)
    return document.querySelectorAll('') // 返回空列表
  }
}

export function waitForElement(selector: string, timeout = 5000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = querySelectorSafe(selector)
    if (element) {
      resolve(element)
      return
    }

    const observer = new MutationObserver(() => {
      const element = querySelectorSafe(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element not found: ${selector}`))
    }, timeout)
  })
}

export function isVisible(element: Element): boolean {
  if (!element) return false
  const style = window.getComputedStyle(element)
  return style.display !== 'none' &&
         style.visibility !== 'hidden' &&
         style.opacity !== '0'
}
