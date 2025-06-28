'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Link as LinkIcon, Loader2, Search, X } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  url: string
  title: string
  image_url: string | null
}

export default function NewRecipePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [url, setUrl] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [recipeData, setRecipeData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    cooking_time: '',
    servings: '',
    difficulty: '',
    tags: ''
  })

  const handleUrlFetch = async () => {
    if (!url.trim()) {
      alert('URLを入力してください')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() })
      })

      const result = await response.json()

      if (result.success) {
        const data = result.data
        setRecipeData({
          title: data.title || '',
          description: data.description || '',
          ingredients: data.ingredients || [''],
          instructions: data.instructions || [''],
          cooking_time: data.cooking_time?.toString() || '',
          servings: data.servings?.toString() || '',
          difficulty: data.difficulty || '',
          tags: data.tags?.join(', ') || ''
        })
        alert('レシピ情報を取得しました！')
      } else {
        alert(result.error || 'レシピ情報の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching recipe:', error)
      alert('レシピ情報の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('検索キーワードを入力してください')
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
      const result = await response.json()

      if (result.success) {
        setSearchResults(result.data.recipes || [])
        setShowSearchResults(true)
      } else {
        alert(result.error || '検索に失敗しました')
      }
    } catch (error) {
      console.error('Error searching recipes:', error)
      alert('検索に失敗しました')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectRecipe = async (recipeUrl: string) => {
    setUrl(recipeUrl)
    setShowSearchResults(false)
    setSearchQuery('')
    
    // 選択したレシピを自動取得
    await handleUrlFetch()
  }

  const addIngredient = () => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }))
  }

  const updateIngredient = (index: number, value: string) => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? value : ingredient
      )
    }))
  }

  const addInstruction = () => {
    setRecipeData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const updateInstruction = (index: number, value: string) => {
    setRecipeData(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => 
        i === index ? value : instruction
      )
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* ページヘッダー */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/recipes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">レシピを追加</h1>
            <p className="text-gray-600 mt-2">新しいレシピを登録します</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* メインフォーム */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>レシピ情報</CardTitle>
                <CardDescription>
                  レシピの基本情報を入力してください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* レシピタイトル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    レシピタイトル *
                  </label>
                  <Input 
                    placeholder="例: カレーライス" 
                    value={recipeData.title}
                    onChange={(e) => setRecipeData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                {/* 説明 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明
                  </label>
                  <Textarea 
                    placeholder="レシピの簡単な説明を入力してください"
                    rows={3}
                    value={recipeData.description}
                    onChange={(e) => setRecipeData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* 調理時間 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      調理時間（分）
                    </label>
                    <Input 
                      type="number" 
                      placeholder="30" 
                      value={recipeData.cooking_time}
                      onChange={(e) => setRecipeData(prev => ({ ...prev, cooking_time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      難易度
                    </label>
                    <Select value={recipeData.difficulty} onValueChange={(value) => setRecipeData(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="難易度を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">簡単</SelectItem>
                        <SelectItem value="medium">普通</SelectItem>
                        <SelectItem value="hard">難しい</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 材料 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    材料 *
                  </label>
                  <div className="space-y-2">
                    {recipeData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          placeholder="例: 米 2合" 
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                        />
                        <Button variant="outline" size="sm" onClick={addIngredient}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 手順 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    調理手順 *
                  </label>
                  <div className="space-y-2">
                    {recipeData.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <Textarea 
                          placeholder="調理手順を入力してください" 
                          rows={2} 
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                        />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addInstruction} className="ml-10">
                      <Plus className="h-4 w-4 mr-2" />
                      手順を追加
                    </Button>
                  </div>
                </div>

                {/* タグ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タグ
                  </label>
                  <Input 
                    placeholder="例: 和食, 簡単, 人気" 
                    value={recipeData.tags}
                    onChange={(e) => setRecipeData(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* クックパッド検索 */}
            <Card>
              <CardHeader>
                <CardTitle>クックパッド検索</CardTitle>
                <CardDescription>
                  クックパッドでレシピを検索して選択
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="例: カレーライス" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* 検索結果 */}
                {showSearchResults && (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">検索結果</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowSearchResults(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        searchResults.map((recipe) => (
                          <button
                            key={recipe.id}
                            onClick={() => handleSelectRecipe(recipe.url)}
                            className="w-full text-left p-2 rounded hover:bg-white transition-colors text-sm"
                          >
                            <div className="font-medium">{recipe.title}</div>
                            <div className="text-xs text-gray-500">{recipe.url}</div>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">検索結果が見つかりませんでした</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* URL入力 */}
            <Card>
              <CardHeader>
                <CardTitle>URLから取得</CardTitle>
                <CardDescription>
                  Cookpadなどの料理サイトのURLを入力して自動取得
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://cookpad.com/recipe/..." 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleUrlFetch}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LinkIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  対応サイト: Cookpad, クックパッド, その他の料理サイト
                </p>
              </CardContent>
            </Card>

            {/* 画像アップロード */}
            <Card>
              <CardHeader>
                <CardTitle>レシピ画像</CardTitle>
                <CardDescription>
                  レシピの完成写真をアップロード
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-gray-400 mb-2">
                    <Plus className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">画像をドラッグ&ドロップ</p>
                  <p className="text-xs text-gray-500 mt-1">またはクリックして選択</p>
                </div>
              </CardContent>
            </Card>

            {/* 保存ボタン */}
            <div className="space-y-2">
              <Button className="w-full" size="lg">
                レシピを保存
              </Button>
              <Button variant="outline" className="w-full">
                下書きとして保存
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 