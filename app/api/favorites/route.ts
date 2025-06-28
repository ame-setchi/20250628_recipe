import { NextRequest, NextResponse } from 'next/server'

// お気に入りレシピの型定義
interface FavoriteRecipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  cooking_time: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  image_url: string | null
  source_url: string
  tags: string[]
  created_at: string
}

// メモリ内でお気に入りを管理（実際のアプリではデータベースを使用）
// eslint-disable-next-line prefer-const
let favorites: FavoriteRecipe[] = []

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: favorites
    })
  } catch (error) {
    console.error('Failed to get favorites:', error)
    return NextResponse.json(
      { error: 'Failed to get favorites' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const recipe: FavoriteRecipe = await request.json()
    
    // 既に存在するかチェック
    const existingIndex = favorites.findIndex(fav => fav.id === recipe.id)
    
    if (existingIndex !== -1) {
      // 既に存在する場合は削除（お気に入り解除）
      favorites.splice(existingIndex, 1)
      return NextResponse.json({
        success: true,
        message: 'Recipe removed from favorites',
        data: favorites
      })
    } else {
      // 新しく追加
      const newFavorite: FavoriteRecipe = {
        ...recipe,
        created_at: new Date().toISOString()
      }
      favorites.push(newFavorite)
      
      return NextResponse.json({
        success: true,
        message: 'Recipe added to favorites',
        data: favorites
      })
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    const index = favorites.findIndex(fav => fav.id === id)
    if (index !== -1) {
      favorites.splice(index, 1)
      return NextResponse.json({
        success: true,
        message: 'Recipe removed from favorites',
        data: favorites
      })
    } else {
      return NextResponse.json(
        { error: 'Recipe not found in favorites' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Failed to remove favorite:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
} 