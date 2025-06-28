import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Heart, Clock, ChefHat, Star, Eye } from 'lucide-react'
import Link from 'next/link'

export default function RecipesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* ページヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">レシピ一覧</h1>
            </div>
            <p className="text-gray-600">保存されたレシピを管理できます</p>
          </div>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            asChild
          >
            <Link href="/recipes/new">
              <Plus className="h-5 w-5 mr-2" />
              レシピを追加
            </Link>
          </Button>
        </div>

        {/* 検索・フィルター */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="レシピ名、材料、タグで検索..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-orange-200 hover:bg-orange-50 hover:border-orange-300">
                  <Filter className="h-4 w-4 mr-2" />
                  フィルター
                </Button>
                <Button variant="outline" className="border-orange-200 hover:bg-orange-50 hover:border-orange-300">
                  <Star className="h-4 w-4 mr-2" />
                  お気に入り
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* レシピ一覧 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* サンプルレシピカード */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute top-3 right-3">
                <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white text-gray-700">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge variant="secondary" className="bg-white/90 text-gray-700">
                  <Clock className="h-3 w-3 mr-1" />
                  30分
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg group-hover:text-orange-600 transition-colors duration-200">カレーライス</CardTitle>
                <Badge variant="outline" className="text-xs">簡単</Badge>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                定番の家庭料理。野菜とお肉をたっぷり使った栄養満点のカレーです。
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">和食</Badge>
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">人気</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                  <Eye className="h-4 w-4 mr-1" />
                  詳細
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute top-3 right-3">
                <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white text-red-500">
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge variant="secondary" className="bg-white/90 text-gray-700">
                  <Clock className="h-3 w-3 mr-1" />
                  15分
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg group-hover:text-orange-600 transition-colors duration-200">パスタカルボナーラ</CardTitle>
                <Badge variant="outline" className="text-xs">普通</Badge>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                クリーミーでコクのあるカルボナーラ。卵とチーズの絶妙なバランス。
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">洋食</Badge>
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">パスタ</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                  <Eye className="h-4 w-4 mr-1" />
                  詳細
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-green-100 to-teal-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute top-3 right-3">
                <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white text-gray-700">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge variant="secondary" className="bg-white/90 text-gray-700">
                  <Clock className="h-3 w-3 mr-1" />
                  10分
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg group-hover:text-orange-600 transition-colors duration-200">味噌汁</CardTitle>
                <Badge variant="outline" className="text-xs">簡単</Badge>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                毎日の定番。具材を変えるだけで様々な味を楽しめます。
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">和食</Badge>
                  <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700">汁物</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                  <Eye className="h-4 w-4 mr-1" />
                  詳細
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 空の状態 */}
        <Card className="text-center py-16 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent>
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChefHat className="h-10 w-10 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">まだレシピが登録されていません</h3>
            <p className="text-gray-600 mb-6">最初のレシピを追加して、料理ライフを始めましょう</p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
            >
              <Link href="/recipes/new">
                <Plus className="h-5 w-5 mr-2" />
                最初のレシピを追加
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 