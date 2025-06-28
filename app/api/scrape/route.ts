export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

// Cookpad APIレスポンス型定義
interface CookpadIngredient {
  name: string
}
interface CookpadStep {
  text: string
}
interface CookpadTag {
  name: string
}
interface CookpadApiResponse {
  title?: string
  description?: string
  introduction?: string
  ingredients?: CookpadIngredient[]
  steps?: CookpadStep[]
  cooking_time?: number
  servings?: number
  image_url?: string
  url?: string
  tags?: CookpadTag[]
}

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
      console.error('Failed to extract recipe ID from URL:', url)
      return NextResponse.json(
        { 
          error: 'Invalid Cookpad URL. Could not extract recipe ID.',
          debug: {
            url: url,
            pathname: new URL(url).pathname
          }
        },
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
    // 例: https://cookpad.com/recipe/1234567-レシピ名
    // 例: https://cookpad.com/recipe/1234567_レシピ名
    // 例: https://cookpad.com/jp/recipes/1234567
    const pathParts = urlObj.pathname.split('/')
    
    // /jp/recipes/ の形式に対応
    const jpRecipesIndex = pathParts.findIndex((part, index) => 
      part === 'jp' && pathParts[index + 1] === 'recipes'
    )
    
    if (jpRecipesIndex !== -1 && pathParts[jpRecipesIndex + 2]) {
      const recipePart = pathParts[jpRecipesIndex + 2]
      
      // 数字のみのIDを抽出（ハイフンやアンダースコアの前まで）
      const idMatch = recipePart.match(/^(\d+)/)
      if (idMatch) {
        return idMatch[1]
      }
      
      // 数字以外が含まれている場合は、そのまま返す
      return recipePart
    }
    
    // 従来の /recipe/ 形式にも対応
    const recipeIndex = pathParts.findIndex(part => part === 'recipe')
    
    if (recipeIndex !== -1 && pathParts[recipeIndex + 1]) {
      const recipePart = pathParts[recipeIndex + 1]
      
      // 数字のみのIDを抽出（ハイフンやアンダースコアの前まで）
      const idMatch = recipePart.match(/^(\d+)/)
      if (idMatch) {
        return idMatch[1]
      }
      
      // 数字以外が含まれている場合は、そのまま返す
      return recipePart
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

    const data: CookpadApiResponse = await response.json()
    
    // クックパッドAPIのレスポンス形式に応じてデータを変換
    return transformCookpadData(data)
    
  } catch (error) {
    console.error('Failed to fetch from Cookpad API:', error)
    
    // APIが利用できない場合は、HTMLスクレイピングを試行
    return await scrapeFromHTML(recipeId)
  }
}

// クックパッドAPIのデータをアプリケーション形式に変換
function transformCookpadData(apiData: CookpadApiResponse) {
  return {
    title: apiData.title || 'レシピタイトル',
    description: apiData.description || apiData.introduction || '',
    ingredients: apiData.ingredients?.map((ing) => ing.name) || [],
    instructions: apiData.steps?.map((step) => step.text) || [],
    cooking_time: apiData.cooking_time || 30,
    servings: apiData.servings || 2,
    difficulty: 'medium' as const,
    image_url: apiData.image_url || null,
    source_url: apiData.url || '',
    tags: apiData.tags?.map((tag) => tag.name) || []
  }
}

// HTMLスクレイピング（フォールバック）
async function scrapeFromHTML(recipeId: string) {
  try {
    // 実際のクックパッドURL形式を使用
    const url = `https://cookpad.com/jp/recipes/${recipeId}`
    
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
    
    // 正規表現を使用してHTMLをパース
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
      source_url: `https://cookpad.com/jp/recipes/${recipeId}`,
      tags: []
    }
  }
}

// 正規表現を使用してHTMLからレシピデータを抽出
function parseHTMLRecipe(html: string, url: string) {
  // デバッグ用：HTMLの一部をログ出力
  console.log('HTML length:', html.length)
  console.log('HTML preview:', html.substring(0, 1000))
  
  // タイトルを抽出
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].replace(' | クックパッド', '').trim() : 'レシピタイトル'
  
  // 説明を抽出（簡易版）
  const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)
  const description = descriptionMatch ? descriptionMatch[1] : ''
  
  // 材料を抽出（複数のパターンを試行）
  const ingredients: string[] = []
  
  // パターン1: ingredient_nameクラス
  let ingredientMatches = html.match(/<span[^>]*class="ingredient_name"[^>]*>([^<]+)<\/span>/g)
  if (ingredientMatches) {
    console.log('Found ingredients with ingredient_name class:', ingredientMatches.length)
    ingredientMatches.forEach(match => {
      const text = match.replace(/<[^>]*>/g, '').trim()
      if (text && text.length > 1) {
        ingredients.push(text)
      }
    })
  }
  
  // パターン2: ingredient_rowクラス
  if (ingredients.length === 0) {
    ingredientMatches = html.match(/<div[^>]*class="ingredient_row"[^>]*>([^<]+)<\/div>/g)
    if (ingredientMatches) {
      console.log('Found ingredients with ingredient_row class:', ingredientMatches.length)
      ingredientMatches.forEach(match => {
        const text = match.replace(/<[^>]*>/g, '').trim()
        if (text && text.length > 1) {
          ingredients.push(text)
        }
      })
    }
  }
  
  // パターン3: 材料セクション全体を探す
  if (ingredients.length === 0) {
    const materialsSection = html.match(/材料[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i)
    if (materialsSection) {
      console.log('Found materials section')
      const liMatches = materialsSection[1].match(/<li[^>]*>([^<]+)<\/li>/gi)
      if (liMatches) {
        liMatches.forEach(match => {
          const text = match.replace(/<[^>]*>/g, '').trim()
          if (text && text.length > 1) {
            ingredients.push(text)
          }
        })
      }
    }
  }
  
  console.log('Extracted ingredients:', ingredients)
  
  // 作り方を抽出（複数のパターンを試行）
  const instructions: string[] = []
  
  // パターン1: step_textクラス
  let instructionMatches = html.match(/<div[^>]*class="step_text"[^>]*>([^<]+)<\/div>/g)
  if (instructionMatches) {
    console.log('Found instructions with step_text class:', instructionMatches.length)
    instructionMatches.forEach(match => {
      const text = match.replace(/<[^>]*>/g, '').trim()
      if (text && text.length > 1) {
        instructions.push(text)
      }
    })
  }
  
  // パターン2: stepクラス
  if (instructions.length === 0) {
    instructionMatches = html.match(/<div[^>]*class="step"[^>]*>([^<]+)<\/div>/g)
    if (instructionMatches) {
      console.log('Found instructions with step class:', instructionMatches.length)
      instructionMatches.forEach(match => {
        const text = match.replace(/<[^>]*>/g, '').trim()
        if (text && text.length > 1) {
          instructions.push(text)
        }
      })
    }
  }
  
  // パターン3: 作り方セクション全体を探す
  if (instructions.length === 0) {
    const stepsSection = html.match(/作り方[\s\S]*?<ol[^>]*>([\s\S]*?)<\/ol>/i)
    if (stepsSection) {
      console.log('Found steps section')
      const liMatches = stepsSection[1].match(/<li[^>]*>([^<]+)<\/li>/gi)
      if (liMatches) {
        liMatches.forEach(match => {
          const text = match.replace(/<[^>]*>/g, '').trim()
          if (text && text.length > 1) {
            instructions.push(text)
          }
        })
      }
    }
  }
  
  console.log('Extracted instructions:', instructions)
  
  // 調理時間を抽出
  let cookingTime = 30
  const timeMatch = html.match(/調理時間[：:]\s*(\d+)/)
  if (timeMatch) {
    cookingTime = parseInt(timeMatch[1])
  }
  
  // 人数を抽出
  let servings = 2
  const servingsMatch = html.match(/(\d+)人分/)
  if (servingsMatch) {
    servings = parseInt(servingsMatch[1])
  }
  
  // 画像URLを抽出
  const imageMatch = html.match(/<img[^>]*src="([^"]*)"[^>]*class="[^"]*recipe[^"]*"/i)
  const imageUrl = imageMatch ? imageMatch[1] : null
  
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
    tags: []
  }
} 