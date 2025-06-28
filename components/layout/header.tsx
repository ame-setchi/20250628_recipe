'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Search, Heart, BookOpen, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">My Recipe</span>
              <div className="text-xs text-orange-600 font-medium">レシピ管理</div>
            </div>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 relative group"
            >
              ホーム
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/recipes" 
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 relative group"
            >
              レシピ一覧
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/categories" 
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 relative group"
            >
              カテゴリ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/favorites" 
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 relative group"
            >
              お気に入り
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* デスクトップアクションボタン */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="hover:bg-orange-50 hover:text-orange-600">
              <Search className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
              asChild
            >
              <Link href="/recipes/new">
                <Plus className="h-4 w-4 mr-2" />
                レシピ追加
              </Link>
            </Button>
          </div>

          {/* モバイルメニューボタン */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-orange-50 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-orange-100">
            <nav className="flex flex-col space-y-3 pt-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-orange-600 font-medium py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ホーム
              </Link>
              <Link 
                href="/recipes" 
                className="text-gray-600 hover:text-orange-600 font-medium py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                レシピ一覧
              </Link>
              <Link 
                href="/categories" 
                className="text-gray-600 hover:text-orange-600 font-medium py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                カテゴリ
              </Link>
              <Link 
                href="/favorites" 
                className="text-gray-600 hover:text-orange-600 font-medium py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                お気に入り
              </Link>
            </nav>
            <div className="flex items-center space-x-3 pt-4">
              <Button variant="ghost" size="sm" className="flex-1 hover:bg-orange-50 hover:text-orange-600">
                <Search className="h-4 w-4 mr-2" />
                検索
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                asChild
              >
                <Link href="/recipes/new" onClick={() => setIsMobileMenuOpen(false)}>
                  <Plus className="h-4 w-4 mr-2" />
                  レシピ追加
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 