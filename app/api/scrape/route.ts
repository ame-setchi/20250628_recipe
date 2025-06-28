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
    
    console.log('Fetching HTML from:', url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`HTML request failed: ${response.status}`)
    }

    const html = await response.text()
    
    console.log('HTML response status:', response.status)
    console.log('HTML response headers:', Object.fromEntries(response.headers.entries()))
    console.log('HTML length:', html.length)
    console.log('HTML preview (first 5000 chars):', html.substring(0, 5000))
    
    // 材料と手順のセクションが存在するかチェック
    const hasMaterials = html.includes('材料')
    const hasSteps = html.includes('作り方')
    console.log('Contains "材料":', hasMaterials)
    console.log('Contains "作り方":', hasSteps)
    
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
  console.log('HTML preview:', html.substring(0, 2000))
  
  // 材料と手順のセクションを探す
  console.log('Looking for materials section...')
  const materialsMatch = html.match(/<h2[^>]*>材料<\/h2>/i)
  console.log('Materials h2 found:', !!materialsMatch)
  
  console.log('Looking for steps section...')
  const stepsMatch = html.match(/<h2[^>]*>作り方<\/h2>/i)
  console.log('Steps h2 found:', !!stepsMatch)
  
  // タイトルを抽出
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].replace(' | クックパッド', '').trim() : 'レシピタイトル'
  
  // 説明を抽出（簡易版）
  const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)
  const description = descriptionMatch ? descriptionMatch[1] : ''
  
  // HTMLタグとCSSを除去する関数
  const cleanText = (text: string): string => {
    console.log('Original text:', text)
    
    // まず、HTMLタグを完全に除去
    let cleaned = text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // scriptタグを除去
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // styleタグを除去
      .replace(/<link[^>]*>/gi, '') // linkタグを除去
      .replace(/<meta[^>]*>/gi, '') // metaタグを除去
      .replace(/<img[^>]*>/gi, '') // imgタグを除去
      .replace(/<br[^>]*>/gi, ' ') // brタグを空白に変換
      .replace(/<hr[^>]*>/gi, ' ') // hrタグを空白に変換
      .replace(/<[^>]*>/g, '') // 残りのHTMLタグを除去
    
    console.log('After HTML tag removal:', cleaned)
    
    // HTMLエンティティを変換
    cleaned = cleaned
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&copy;/g, '©')
      .replace(/&reg;/g, '®')
      .replace(/&trade;/g, '™')
    
    console.log('After HTML entity conversion:', cleaned)
    
    // 複数の空白を単一の空白に
    cleaned = cleaned.replace(/\s+/g, ' ')
    
    console.log('After whitespace normalization:', cleaned)
    
    // 残っている可能性のあるHTML属性の残骸を除去（より強力に）
    cleaned = cleaned
      .replace(/[a-zA-Z-]+="[^"]*"/gi, '') // 属性="値"
      .replace(/[a-zA-Z-]+='[^']*'/gi, '') // 属性='値'
      .replace(/[a-zA-Z-]+=[^\s>]+/gi, '') // 属性=値（クォートなし）
      .replace(/>\s*>/g, '') // 自己終了タグの残骸
      .replace(/\s*\/\s*>/g, '') // 自己終了タグの残骸
      .replace(/\d+"\s*\/?>/g, '') // 数字+" />
      .replace(/\d+"\s*>/g, '') // 数字+" >
      .replace(/"[^"]*"\s*\/?>/g, '') // "文字列" />
      .replace(/"[^"]*"\s*>/g, '') // "文字列" >
      .replace(/\{[^}]*\}/g, '') // CSSブロック
      .replace(/@[^{]*\{[^}]*\}/g, '') // CSSルール
    
    console.log('After attribute removal:', cleaned)
    
    // さらに強力な除去処理
    cleaned = cleaned
      .replace(/^[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]*/, '') // 先頭の非文字を除去
      .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s、。！？]*$/, '') // 末尾の非文字を除去
      .replace(/^[^a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]*/, '') // 先頭の非文字（数字以外）を除去
      .replace(/^[^a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]*/, '') // 再度先頭の非文字を除去
    
    console.log('After final cleaning:', cleaned)
    
    // 再度空白を正規化
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    console.log('Final result:', cleaned)
    
    return cleaned
  }
  
  // テキストの品質チェック関数
  const isValidText = (text: string): boolean => {
    console.log('Checking text validity:', text)
    
    if (!text || text.length < 2) {
      console.log('Rejected: too short or empty')
      return false
    }
    
    // HTML属性やCSSコードが含まれるテキストを除外
    if (text.includes('{') || text.includes('}')) {
      console.log('Rejected: contains CSS brackets')
      return false
    }
    if (text.includes('media=') || text.includes('data-')) {
      console.log('Rejected: contains HTML attributes')
      return false
    }
    if (text.includes('rel=') || text.includes('href=')) {
      console.log('Rejected: contains HTML attributes')
      return false
    }
    if (text.includes('src=') || text.includes('class=')) {
      console.log('Rejected: contains HTML attributes')
      return false
    }
    if (text.includes('id=') || text.includes('style=')) {
      console.log('Rejected: contains HTML attributes')
      return false
    }
    if (text.includes('type=') || text.includes('name=')) {
      console.log('Rejected: contains HTML attributes')
      return false
    }
    if (text.includes('value=') || text.includes('content=')) {
      console.log('Rejected: contains HTML attributes')
      return false
    }
    if (text.includes('property=') || text.includes('charset=')) {
      console.log('Rejected: contains HTML attributes')
      return false
    }
    if (text.includes('http-equiv=')) {
      console.log('Rejected: contains HTML attributes')
      return false
    }
    if (text.includes('sizes=') || text.includes('width=') || text.includes('height=')) {
      console.log('Rejected: contains HTML attributes')
      return false
    }
    if (text.includes('alt=') || text.includes('title=') || text.includes('target=')) {
      console.log('Rejected: contains HTML attributes')
      return false
    }
    
    // パターンマッチングで不適切なテキストを除外
    if (text.match(/^\d+"\s*\/?>$/)) {
      console.log('Rejected: matches HTML pattern 1')
      return false
    }
    if (text.match(/^"[^"]*"\s*\/?>$/)) {
      console.log('Rejected: matches HTML pattern 2')
      return false
    }
    if (text.match(/^\s*[0-9]+\s*$/)) {
      console.log('Rejected: numbers only')
      return false
    }
    if (text.match(/^\s*[a-zA-Z0-9_\-]+\s*$/)) {
      console.log('Rejected: alphanumeric only')
      return false
    }
    if (text.match(/^\s*[a-zA-Z0-9_\-]+="[^"]*"\s*\/?>\s*$/)) {
      console.log('Rejected: matches HTML pattern 3')
      return false
    }
    if (text.match(/^\s*[a-zA-Z0-9_\-]+='[^']*'\s*\/?>\s*$/)) {
      console.log('Rejected: matches HTML pattern 4')
      return false
    }
    
    // 先頭が不適切な文字で始まるテキストを除外（緩和）
    if (text.match(/^[0-9\s\-_\/\\|@#$%^&*()+=<>[\]{}:;"'`~,.]/)) {
      console.log('Rejected: starts with invalid character')
      return false
    }
    
    // セクションタイトルや不要なテキストを除外
    if (text.includes('材料') || text.includes('作り方') || text.includes('調理時間')) {
      console.log('Rejected: contains section title')
      return false
    }
    if (text.includes('人分') || text.includes('分') || text.includes('時間')) {
      console.log('Rejected: contains time/portion info')
      return false
    }
    if (text.includes('カロリー') || text.includes('kcal')) {
      console.log('Rejected: contains calorie info')
      return false
    }
    if (text.includes('塩分') || text.includes('糖質')) {
      console.log('Rejected: contains nutrition info')
      return false
    }
    if (text.includes('タンパク質') || text.includes('脂質')) {
      console.log('Rejected: contains nutrition info')
      return false
    }
    if (text.includes('食物繊維')) {
      console.log('Rejected: contains nutrition info')
      return false
    }
    
    // 画像関連のテキストを除外
    if (text.includes('.png') || text.includes('.jpg') || text.includes('.jpeg') || text.includes('.gif')) {
      console.log('Rejected: contains image extension')
      return false
    }
    if (text.includes('72x72') || text.includes('144x144') || text.includes('192x192')) {
      console.log('Rejected: contains image size')
      return false
    }
    if (text.includes('.ico') || text.includes('.svg')) {
      console.log('Rejected: contains image extension')
      return false
    }
    
    // テキストが短すぎる場合を除外（緩和）
    if (text.length < 2) {
      console.log('Rejected: too short')
      return false
    }
    
    // 日本語文字が含まれているかチェック（緩和）
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)
    if (!hasJapanese && text.length < 5) {
      console.log('Rejected: no Japanese characters and too short')
      return false
    }
    
    console.log('Text is valid:', text)
    return true
  }
  
  // 材料を抽出（実際のクックパッドHTML構造に基づく）
  const ingredients: string[] = []
  
  // パターン1: 材料セクションの直後のul/li
  const materialsSection = html.match(/<h2[^>]*>材料<\/h2>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i)
  if (materialsSection) {
    console.log('Found materials section with ul')
    const liMatches = materialsSection[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi)
    if (liMatches) {
      console.log('Found li matches:', liMatches.length)
      liMatches.forEach((match, index) => {
        console.log(`Processing li ${index + 1}:`, match.substring(0, 100))
        let text = cleanText(match)
        
        // 追加の前処理
        text = text
          .replace(/^[^a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]*/, '') // 先頭の非文字を除去
          .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s、。！？]*$/, '') // 末尾の非文字を除去
          .trim()
        
        console.log(`Cleaned text ${index + 1}:`, text)
        if (isValidText(text)) {
          ingredients.push(text)
          console.log(`Added ingredient:`, text)
        } else {
          console.log(`Rejected ingredient:`, text)
        }
      })
    }
  }
  
  // パターン2: 材料セクションの直後のol/li
  if (ingredients.length === 0) {
    const materialsOlSection = html.match(/<h2[^>]*>材料<\/h2>[\s\S]*?<ol[^>]*>([\s\S]*?)<\/ol>/i)
    if (materialsOlSection) {
      console.log('Found materials section with ol')
      const liMatches = materialsOlSection[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi)
      if (liMatches) {
        liMatches.forEach(match => {
          const text = cleanText(match)
          if (isValidText(text)) {
            ingredients.push(text)
          }
        })
      }
    }
  }
  
  // パターン3: 材料セクションの直後のdiv
  if (ingredients.length === 0) {
    const materialsDiv = html.match(/<h2[^>]*>材料<\/h2>[\s\S]*?<div[^>]*class="[^"]*ingredient[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)
    if (materialsDiv) {
      console.log('Found materials with div class ingredient:', materialsDiv.length)
      materialsDiv.forEach(match => {
        const text = cleanText(match)
        if (isValidText(text)) {
          ingredients.push(text)
        }
      })
    }
  }
  
  // パターン4: 材料セクション全体を取得して段落を探す
  if (ingredients.length === 0) {
    const fullMaterialsSection = html.match(/<h2[^>]*>材料<\/h2>([\s\S]*?)(?=<h2|$)/i)
    if (fullMaterialsSection) {
      console.log('Found full materials section, extracting all text')
      const sectionText = fullMaterialsSection[1]
      
      // 材料セクション内の全てのテキストを抽出
      const textMatches = sectionText.match(/[^<>]+/g)
      if (textMatches) {
        console.log('Found text matches in materials section:', textMatches.length)
        textMatches.forEach((match, index) => {
          let text = cleanText(match)
          
          // 追加の前処理
          text = text
            .replace(/^[^a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]*/, '') // 先頭の非文字を除去
            .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s、。！？]*$/, '') // 末尾の非文字を除去
            .trim()
          
          console.log(`Processing text match ${index + 1}:`, text)
          if (isValidText(text)) {
            ingredients.push(text)
            console.log(`Added ingredient from text match:`, text)
          } else {
            console.log(`Rejected text match:`, text)
          }
        })
      }
    }
  }
  
  // パターン5: 数字付きリスト（1. 材料名 2. 材料名）
  if (ingredients.length === 0) {
    const numberedList = html.match(/\d+\.\s*([^<\n]+)/g)
    if (numberedList) {
      console.log('Found numbered list:', numberedList.length)
      numberedList.forEach(match => {
        const text = match.replace(/^\d+\.\s*/, '').trim()
        if (isValidText(text)) {
          ingredients.push(text)
        }
      })
    }
  }
  
  // パターン6: 材料セクション内のdiv要素を全て取得
  if (ingredients.length === 0) {
    const materialsDivs = html.match(/<h2[^>]*>材料<\/h2>[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/gi)
    if (materialsDivs) {
      console.log('Found materials divs:', materialsDivs.length)
      materialsDivs.forEach(match => {
        const text = cleanText(match)
        if (isValidText(text)) {
          ingredients.push(text)
        }
      })
    }
  }
  
  console.log('Extracted ingredients:', ingredients)
  
  // 作り方を抽出（実際のクックパッドHTML構造に基づく）
  const instructions: string[] = []
  
  // パターン1: 作り方セクションの直後のol/li
  const stepsSection = html.match(/<h2[^>]*>作り方<\/h2>[\s\S]*?<ol[^>]*>([\s\S]*?)<\/ol>/i)
  if (stepsSection) {
    console.log('Found steps section with ol')
    const liMatches = stepsSection[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi)
    if (liMatches) {
      console.log('Found steps li matches:', liMatches.length)
      liMatches.forEach((match, index) => {
        console.log(`Processing step li ${index + 1}:`, match.substring(0, 100))
        let text = cleanText(match)
        
        // 追加の前処理
        text = text
          .replace(/^[^a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]*/, '') // 先頭の非文字を除去
          .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s、。！？]*$/, '') // 末尾の非文字を除去
          .trim()
        
        console.log(`Cleaned step text ${index + 1}:`, text)
        if (isValidText(text)) {
          instructions.push(text)
          console.log(`Added instruction:`, text)
        } else {
          console.log(`Rejected instruction:`, text)
        }
      })
    }
  }
  
  // パターン2: 作り方セクションの直後のul/li
  if (instructions.length === 0) {
    const stepsUlSection = html.match(/<h2[^>]*>作り方<\/h2>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i)
    if (stepsUlSection) {
      console.log('Found steps section with ul')
      const liMatches = stepsUlSection[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi)
      if (liMatches) {
        liMatches.forEach(match => {
          const text = cleanText(match)
          if (isValidText(text)) {
            instructions.push(text)
          }
        })
      }
    }
  }
  
  // パターン3: 作り方セクションの直後のdiv
  if (instructions.length === 0) {
    const stepsDiv = html.match(/<h2[^>]*>作り方<\/h2>[\s\S]*?<div[^>]*class="[^"]*step[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)
    if (stepsDiv) {
      console.log('Found steps with div class step:', stepsDiv.length)
      stepsDiv.forEach(match => {
        const text = cleanText(match)
        if (isValidText(text)) {
          instructions.push(text)
        }
      })
    }
  }
  
  // パターン4: 手順の数字付きリスト
  if (instructions.length === 0) {
    const stepNumbers = html.match(/<span[^>]*class="[^"]*step-number[^"]*"[^>]*>\d+<\/span>[\s\S]*?<div[^>]*class="[^"]*step-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)
    if (stepNumbers) {
      console.log('Found step numbers with content:', stepNumbers.length)
      stepNumbers.forEach(match => {
        const text = cleanText(match)
        if (isValidText(text)) {
          instructions.push(text)
        }
      })
    }
  }
  
  // パターン5: 作り方セクション全体を取得して段落を探す
  if (instructions.length === 0) {
    const fullStepsSection = html.match(/<h2[^>]*>作り方<\/h2>([\s\S]*?)(?=<h2|$)/i)
    if (fullStepsSection) {
      console.log('Found full steps section, looking for paragraphs')
      const paragraphs = fullStepsSection[1].match(/<p[^>]*>([\s\S]*?)<\/p>/gi)
      if (paragraphs) {
        paragraphs.forEach(match => {
          const text = cleanText(match)
          if (isValidText(text)) {
            instructions.push(text)
          }
        })
      }
    }
  }
  
  // パターン6: 数字付きの手順（1. 手順内容 2. 手順内容）
  if (instructions.length === 0) {
    const numberedSteps = html.match(/\d+\.\s*([^<\n]+)/g)
    if (numberedSteps) {
      console.log('Found numbered steps:', numberedSteps.length)
      numberedSteps.forEach(match => {
        const text = match.replace(/^\d+\.\s*/, '').trim()
        if (isValidText(text)) {
          instructions.push(text)
        }
      })
    }
  }
  
  // パターン7: 作り方セクション内のdiv要素を全て取得
  if (instructions.length === 0) {
    const stepsDivs = html.match(/<h2[^>]*>作り方<\/h2>[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/gi)
    if (stepsDivs) {
      console.log('Found steps divs:', stepsDivs.length)
      stepsDivs.forEach(match => {
        const text = cleanText(match)
        if (isValidText(text)) {
          instructions.push(text)
        }
      })
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