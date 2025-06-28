import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

// クックパッドAPIのベースURL
const COOKPAD_API_BASE = 'https://cookpad.com/api/v1'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // URLの検証
    if (!url.includes('cookpad.com') && !url.includes('クックパッド')) {
      return NextResponse.json(
        { error: 'Unsupported website. Currently only Cookpad is supported.' },
        { status: 400 }
      )
    }

    // クックパッドURLからレシピIDを抽出
    const recipeId = extractRecipeId(url)
    if (!recipeId) {
      return NextResponse.json(
        { error: 'Invalid Cookpad URL. Could not extract recipe ID.' },
        { status: 400 }
      )
    }

    // クックパッドAPIからレシピデータを取得
    const recipeData = await fetchRecipeFromCookpad(recipeId)

    return NextResponse.json({
      success: true,
      data: recipeData
    })

  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape recipe data' },
      { status: 500 }
    )
  }
}

// クックパッドURLからレシピIDを抽出する関数
function extractRecipeId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    
    // 例: https://cookpad.com/recipe/1234567
    const pathParts = urlObj.pathname.split('/')
    const recipeIndex = pathParts.findIndex(part => part === 'recipe')
    
    if (recipeIndex !== -1 && pathParts[recipeIndex + 1]) {
      return pathParts[recipeIndex + 1]
    }
    
    return null
  } catch {
    return null
  }
}

// クックパッドAPIからレシピデータを取得する関数
async function fetchRecipeFromCookpad(recipeId: string) {
  try {
    // クックパッドAPIエンドポイント
    const apiUrl = `${COOKPAD_API_BASE}/recipes/${recipeId}`
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    // クックパッドAPIのレスポンス形式に応じてデータを変換
    return transformCookpadData(data)
    
  } catch (error) {
    console.error('Failed to fetch from Cookpad API:', error)
    
    // APIが利用できない場合は、HTMLスクレイピングを試行
    return await scrapeFromHTML(recipeId)
  }
}

// クックパッドAPIのデータをアプリケーション形式に変換
function transformCookpadData(apiData: any) {
  return {
    title: apiData.title || 'レシピタイトル',
    description: apiData.description || apiData.introduction || '',
    ingredients: apiData.ingredients?.map((ing: any) => ing.name) || [],
    instructions: apiData.steps?.map((step: any) => step.text) || [],
    cooking_time: apiData.cooking_time || 30,
    servings: apiData.servings || 2,
    difficulty: 'medium' as const,
    image_url: apiData.image_url || null,
    source_url: apiData.url || '',
    tags: apiData.tags?.map((tag: any) => tag.name) || []
  }
}

// HTMLスクレイピング（フォールバック）
async function scrapeFromHTML(recipeId: string) {
  try {
    const url = `https://cookpad.com/recipe/${recipeId}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
      }
    })

    if (!response.ok) {
      throw new Error(`HTML request failed: ${response.status}`)
    }

    const html = await response.text()
    
    // cheerioを使用してHTMLをパース
    return parseHTMLRecipe(html, url)
    
  } catch (error) {
    console.error('Failed to scrape HTML:', error)
    
    // 最終的なフォールバック
    return {
      title: 'レシピの取得に失敗しました',
      description: 'URLからレシピデータを取得できませんでした。手動で入力してください。',
      ingredients: [],
      instructions: [],
      cooking_time: 30,
      servings: 2,
      difficulty: 'medium' as const,
      image_url: null,
      source_url: `https://cookpad.com/recipe/${recipeId}`,
      tags: []
    }
  }
}

// cheerioを使用してHTMLからレシピデータを抽出
function parseHTMLRecipe(html: string, url: string) {
  const $ = cheerio.load(html)
  
  // タイトルを抽出
  const title = $('h1.recipe-show h1, .recipe_title, h1').first().text().trim() || 
                $('title').text().replace(' | クックパッド', '').trim() ||
                'レシピタイトル'
  
  // 説明を抽出
  const description = $('.recipe_description, .description, .introduction').text().trim() || ''
  
  // 材料を抽出
  const ingredients: string[] = []
  $('.ingredient_row, .ingredient, .material').each((_, element) => {
    const ingredientText = $(element).text().trim()
    if (ingredientText && !ingredientText.includes('材料') && ingredientText.length > 1) {
      ingredients.push(ingredientText)
    }
  })
  
  // 手順を抽出
  const instructions: string[] = []
  $('.step, .instruction, .cooking_step').each((_, element) => {
    const stepText = $(element).text().trim()
    if (stepText && stepText.length > 1) {
      instructions.push(stepText)
    }
  })
  
  // 調理時間を抽出
  let cookingTime = 30
  const timeText = $('.cooking_time, .time, .duration').text()
  const timeMatch = timeText.match(/(\d+)/)
  if (timeMatch) {
    cookingTime = parseInt(timeMatch[1])
  }
  
  // 人数を抽出
  let servings = 2
  const servingsText = $('.servings, .portion, .yield').text()
  const servingsMatch = servingsText.match(/(\d+)/)
  if (servingsMatch) {
    servings = parseInt(servingsMatch[1])
  }
  
  // 画像URLを抽出
  const imageUrl = $('.recipe_image img, .main_image img, .photo img').first().attr('src') || null
  
  // タグを抽出
  const tags: string[] = []
  $('.tag, .category, .keyword').each((_, element) => {
    const tagText = $(element).text().trim()
    if (tagText && tagText.length > 1) {
      tags.push(tagText)
    }
  })
  
  return {
    title,
    description,
    ingredients: ingredients.length > 0 ? ingredients : ['材料1', '材料2', '材料3'],
    instructions: instructions.length > 0 ? instructions : ['手順1', '手順2', '手順3'],
    cooking_time: cookingTime,
    servings,
    difficulty: 'medium' as const,
    image_url: imageUrl,
    source_url: url,
    tags
  }
} 