import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen, Heart, Clock, Users, ChefHat, Sparkles, TrendingUp, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 mb-8">
              <Sparkles className="h-4 w-4 mr-2" />
              レシピ管理を簡単に
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              お気に入りの
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">レシピ</span>
              <br />
              を管理しよう
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              料理サイトのURLや手動入力でレシピを保存し、カテゴリ分けや検索で簡単に見つけられます。
              <br />
              あなただけの料理レパートリーを作りましょう。
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 text-lg px-8 py-6" 
                asChild
              >
                <Link href="/recipes/new">
                  <Plus className="h-6 w-6 mr-3" />
                  レシピを追加
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 transition-all duration-300 text-lg px-8 py-6" 
                asChild
              >
                <Link href="/recipes">
                  <BookOpen className="h-6 w-6 mr-3" />
                  レシピ一覧を見る
                </Link>
              </Button>
            </div>
            
            {/* 統計情報 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-orange-400 mb-2">0</div>
                <div className="text-gray-300 text-sm">保存済みレシピ</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-pink-400 mb-2">0</div>
                <div className="text-gray-300 text-sm">お気に入り</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-purple-400 mb-2">0</div>
                <div className="text-gray-300 text-sm">カテゴリ</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-blue-400 mb-2">0</div>
                <div className="text-gray-300 text-sm">今月の追加</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-20">
        {/* 機能紹介 */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">主な機能</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              レシピ管理を楽しく、効率的にする機能をご紹介します
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white shadow-lg hover:shadow-orange-500/10">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-slate-900">レシピ保存</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg leading-relaxed text-slate-600">
                  Cookpadなどの料理サイトのURLを入力するだけで、レシピ情報を自動取得して保存できます。
                  手動入力も簡単で、あなたのオリジナルレシピも管理できます。
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white shadow-lg hover:shadow-pink-500/10">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-slate-900">お気に入り管理</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg leading-relaxed text-slate-600">
                  お気に入りのレシピにマークを付けて、いつでも簡単に見つけられるように整理できます。
                  家族みんなで共有できる料理レパートリーを作りましょう。
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white shadow-lg hover:shadow-blue-500/10">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-slate-900">調理時間管理</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg leading-relaxed text-slate-600">
                  調理時間や難易度でレシピを検索・フィルタリングして、時間に合わせた料理を選べます。
                  忙しい日でも最適なレシピを見つけられます。
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-12 mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">なぜMy Recipeなのか？</h2>
            <p className="text-xl text-slate-600">他のレシピ管理アプリにはない特徴があります</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3 text-slate-900">簡単なレシピ保存</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">URLを貼るだけで自動取得。手間をかけずにレシピを整理できます。</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3 text-slate-900">効率的な検索</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">材料、調理時間、難易度で絞り込み。欲しいレシピをすぐに見つけられます。</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3 text-slate-900">カスタマイズ可能</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">カテゴリやタグで自由に分類。あなたの好みに合わせて整理できます。</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3 text-slate-900">家族で共有</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">家族みんなで使えるシンプルな設計。料理の楽しさを共有しましょう。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA セクション */}
        <section className="text-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">今すぐ始めましょう</h2>
            <p className="text-2xl mb-12 opacity-90 leading-relaxed">あなたの料理ライフをより楽しく、効率的に</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white text-slate-900 hover:bg-gray-100 text-lg px-8 py-6 shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105" 
                asChild
              >
                <Link href="/recipes/new">
                  <Plus className="h-6 w-6 mr-3" />
                  最初のレシピを追加
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 text-lg px-8 py-6 transition-all duration-300" 
                asChild
              >
                <Link href="/recipes">
                  <BookOpen className="h-6 w-6 mr-3" />
                  レシピ一覧を見る
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
