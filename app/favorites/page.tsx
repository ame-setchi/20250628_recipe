'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Clock, Users, Trash2 } from 'lucide-react'
import { Recipe } from '@/lib/types'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (recipeId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: recipeId }),
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(recipe => recipe.id !== recipeId))
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">お気に入りを読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">お気に入りレシピ</h1>
        <p className="text-muted-foreground">
          保存したレシピを管理できます
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">お気に入りがありません</h3>
          <p className="text-muted-foreground mb-4">
            レシピをお気に入りに追加すると、ここに表示されます
          </p>
          <Button asChild>
            <a href="/recipes">レシピを探す</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{recipe.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {recipe.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(recipe.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.cooking_time}分</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings}人分</span>
                  </div>
                  <Badge variant="secondary">
                    {recipe.difficulty === 'easy' && '簡単'}
                    {recipe.difficulty === 'medium' && '普通'}
                    {recipe.difficulty === 'hard' && '難しい'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">材料 ({recipe.ingredients.length}個)</h4>
                    <div className="text-sm text-muted-foreground">
                      {recipe.ingredients.slice(0, 3).join('、')}
                      {recipe.ingredients.length > 3 && '...'}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">手順 ({recipe.instructions.length}ステップ)</h4>
                    <div className="text-sm text-muted-foreground">
                      {recipe.instructions[0]?.substring(0, 50)}...
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    詳細を見る
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 