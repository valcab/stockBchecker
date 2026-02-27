import type { CheckResult } from '@/types'

export function extractArticleId(input: string): string | null {
  input = input.trim()

  // Check if it's a URL
  if (input.match(/^https?:\/\//i) || input.includes('thomann')) {
    // Normalize the URL
    if (!input.match(/^https?:\/\//i)) {
      input = 'https://' + input
    }

    // Try to extract numeric article ID from various Thomann URL formats
    let match = input.match(/[/_]product[_-]?(\d+)/i)
    if (match) return match[1]

    match = input.match(/\/(\d+)\.html?/i)
    if (match) return match[1]

    match = input.match(/\/p(\d+)\//i)
    if (match) return match[1]

    match = input.match(/(\d{5,})/)
    if (match) return match[1]

    // If no numeric ID found, use the full URL as identifier
    return input
  }

  // Assume it's an article ID (just digits)
  if (/^\d+$/.test(input)) {
    return input
  }

  return null
}

export function extractName(html: string): string | null {
  const match = html.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/i)
  if (match) {
    return match[1].trim()
  }
  return null
}

export function extractPrice(html: string): string | null {
  // Look for structured price metadata first
  let match = html.match(/itemprop=["']price["'][^>]*content=["']([0-9]+(?:[.,][0-9]{2})?)["']/i)
  if (match) return match[1].replace(',', '.')

  match = html.match(/"price"\s*:\s*"([0-9]+(?:[.,][0-9]{2})?)"/i)
  if (match) return match[1].replace(',', '.')

  match = html.match(/data-price["']?[=:]?["']?([0-9]+(?:[.,][0-9]{2})?)/i)
  if (match) return match[1].replace(',', '.')

  // Price with Euro symbol
  match = html.match(/\b([1-9][0-9]{1,5}[,.][0-9]{2})\s*€\b/i)
  if (match) return match[1].replace(',', '.')

  // Common price containers
  match = html.match(/class=["'][^"']*price[^"']*["'][^>]*>\s*([1-9][0-9]{1,5}[,.][0-9]{2})/i)
  if (match) return match[1].replace(',', '.')

  // Price near "TTC" (FR) or "inkl." (DE) markers
  match = html.match(/([1-9][0-9]{1,5}[,.][0-9]{2})\s*(?:€)?\s*(?:TTC|inkl\.)/i)
  if (match) return match[1].replace(',', '.')

  return null
}

export function extractImageUrl(html: string, baseUrl: string): string | null {
  // Try to find product image
  let match = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
  if (match) {
    try {
      return new URL(match[1], baseUrl).toString()
    } catch {
      return match[1]
    }
  }

  // Try data-img or similar attributes
  match = html.match(/<img[^>]*data-img=["']([^"']+)["'][^>]*product/i)
  if (match) {
    try {
      return new URL(match[1], baseUrl).toString()
    } catch {
      return match[1]
    }
  }

  // Try img with product in class or id
  match = html.match(/<img[^>]*(?:class|id)=["'][^"']*product[^"']*["'][^>]*src=["']([^"']+)["']/i)
  if (match) {
    try {
      return new URL(match[1], baseUrl).toString()
    } catch {
      return match[1]
    }
  }

  // Generic product image
  match = html.match(/<img[^>]*src=["']([^"']*\/(?:products|images)\/[^"']+\.[a-z]{3,4})["']/i)
  if (match) {
    try {
      return new URL(match[1], baseUrl).toString()
    } catch {
      return match[1]
    }
  }

  return null
}

export function extractBStockUrl(html: string, baseUrl: string): string | null {
  const match = html.match(/<div[^>]*class="[^"]*discounts-and-addons[^"]*"[^>]*>.*?href="([^"]*b_stock[^"]*\.htm)"/is)
  if (!match) return null
  try {
    return new URL(match[1], baseUrl).toString()
  } catch (error) {
    return null
  }
}

export function checkStockBInHtml(html: string): boolean {
  return /<div[^>]*class="[^"]*discounts-and-addons[^"]*"[^>]*>.*?href="[^"]*b_stock[^"]*\.htm/is.test(html)
}

export async function checkStockB(
  url: string
): Promise<{ result: CheckResult; name: string | null }> {
  try {
    const response = await fetch(url)
    const html = await response.text()
    const isAvailable = checkStockBInHtml(html)
    const price = extractPrice(html)
    const name = extractName(html)
    const imageUrl = extractImageUrl(html, url)
    let bStockPrice = null
    let bStockUrl = null

    if (isAvailable) {
      bStockUrl = extractBStockUrl(html, url)
      if (bStockUrl) {
        const bStockResponse = await fetch(bStockUrl)
        const bStockHtml = await bStockResponse.text()
        bStockPrice = extractPrice(bStockHtml)
      }
    }

    return {
      result: {
        status: isAvailable ? 'available' : 'unavailable',
        message: isAvailable ? 'Stock B is available' : 'Stock B is not available',
        timestamp: new Date().toISOString(),
        price: price || undefined,
        bStockPrice: bStockPrice || undefined,
        bStockUrl: bStockUrl || undefined,
        imageUrl: imageUrl || undefined,
      },
      name,
    }
  } catch (error) {
    return {
      result: {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      name: null,
    }
  }
}
