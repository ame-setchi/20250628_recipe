import { NextRequest, NextResponse } from 'next/server'

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

    // 実際のスクレイピング処理（簡易版）
    // 本格的な実装では、cheerioやpuppeteerを使用
    const mockRecipeData = {
      title: 'サンプルレシピ',
      description: 'URLから取得したレシピの説明',
      ingredients: ['材料1', '材料2', '材料3'],
      instructions: ['手順1', '手順2', '手順3'],
      cooking_time: 30,
      servings: 2,
      difficulty: 'medium' as const,
      image_url: null,
      source_url: url,
      tags: ['サンプル', 'テスト']
    }

    return NextResponse.json({
      success: true,
      data: mockRecipeData
    })

  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape recipe data' },
      { status: 500 }
    )
  }
} 