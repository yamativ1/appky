'use client'

import { ArrowLeft, Mail, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window === 'undefined') return

    // App Router では history.state?.idx が 0 のとき直リンクの可能性あり
    const hasHistory =
      (window.history.state && typeof window.history.state.idx === 'number'
        ? window.history.state.idx > 0
        : window.history.length > 1)

    if (hasHistory) {
      router.back()
      return
    }

    // 直リンク等で履歴がない場合のフォールバック
    const fallback = sessionStorage.getItem('lastListURL') || '/'
    router.push(fallback, { scroll: false })
  }

  return (
    <Button
      variant="outline"
      onClick={handleBack}
      className="mb-4 sm:mb-6 hover:bg-gray-50 h-9 sm:h-10 text-sm sm:text-base"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Network
    </Button>
  )
}

export function ActionButtons({ linkedinurl }: { linkedinurl: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 w-full sm:w-auto">
      <a
        href={linkedinurl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white h-10 sm:h-11 px-4 text-sm sm:text-base rounded-md w-full sm:w-auto"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Connect on LinkedIn
      </a>
    </div>
  )
}

export function ContactButton() {
  return (
    <Button variant="outline" className="w-full h-9 sm:h-10 text-sm sm:text-base">
      <Mail className="w-4 h-4 mr-2" />
      Send Message
    </Button>
  )
}
