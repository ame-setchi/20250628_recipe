import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const page = searchParams.get('page') || '1'

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    // クックパッド検索APIを呼び出し
    const searchResults = await searchCookpadRecipes(query, parseInt(page))

    return NextResponse.json({
      success: true,
      data: searchResults
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    )
  }
}

async function searchCookpadRecipes(query: string, page: number = 1) {
  try {
    // クックパッド検索APIエンドポイント
    const searchUrl = `https://cookpad.com/search/${encodeURIComponent(query)}?page=${page}`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
      }
    })

    if (!response.ok) {
      throw new Error(`Search request failed: ${response.status}`)
    }

    const html = await response.text()
    return parseSearchResults(html)

  } catch (error) {
    console.error('Failed to search Cookpad:', error)
    return {
      recipes: [],
      total: 0,
      page: page,
      hasMore: false
    }
  }
}

function parseSearchResults(html: string) {
  // 簡易的な検索結果パース
  // 実際の実装では、cheerioを使用して詳細にパース
  const recipes = []
  
  // 正規表現でレシピリンクを抽出
  const recipeMatches = html.match(/href="\/recipe\/(\d+)"/g)
  if (recipeMatches) {
    for (const match of recipeMatches.slice(0, 10)) { // 最大10件
      const recipeId = match.match(/\/recipe\/(\d+)/)?.[1]
      if (recipeId) {
        recipes.push({
          id: recipeId,
          url: `https://cookpad.com/recipe/${recipeId}`,
          title: `レシピ ${recipeId}`,
          image_url: null
        })
      }
    }
  }

  return {
    recipes,
    total: recipes.length,
    page: 1,
    hasMore: recipes.length >= 10
  }
} 