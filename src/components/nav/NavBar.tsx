'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/(auth)/actions'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const NAV_ITEMS = [
  { label: 'Feed',     href: '/feed' },
  { label: 'Plants',   href: '/plants' },
  { label: 'Activity', href: '/activity' },
  { label: 'Messages', href: '/messages' },
]

interface NavBarProps {
  username: string
  displayName: string
  avatarUrl: string | null
  userId: string
}

export function NavBar({ username, displayName, avatarUrl, userId }: NavBarProps) {
  const pathname = usePathname()
  const [hasUnread, setHasUnread] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  // Ref so the Realtime INSERT callback always reads the current pathname
  // without needing to re-subscribe when pathname changes.
  const pathnameRef = useRef(pathname)
  useEffect(() => { pathnameRef.current = pathname }, [pathname])

  // Initial count on mount.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', userId)
      if (!cancelled) setHasUnread((count ?? 0) > 0)
    })()
    return () => { cancelled = true }
  }, [supabase, userId])

  // Fallback: re-query when leaving /messages in case the user navigated away
  // before the Realtime UPDATE event arrived (race condition).
  useEffect(() => {
    if (pathname.startsWith('/messages')) return
    let cancelled = false
    ;(async () => {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', userId)
      if (!cancelled) setHasUnread((count ?? 0) > 0)
    })()
    return () => { cancelled = true }
  }, [pathname, supabase, userId])

  // INSERT → light up immediately when a new message arrives.
  // UPDATE → re-query in real-time when ConversationView marks messages as read.
  //          Requires REPLICA IDENTITY FULL on messages (migration 20260611000002).
  useEffect(() => {
    const requery = async () => {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', userId)
      setHasUnread((count ?? 0) > 0)
    }

    const channel = supabase
      .channel('nav-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // Skip if user is already on /messages — they can see the message right now.
          // The fallback re-query handles unread state when they eventually leave.
          if (payload.new.sender_id !== userId && !pathnameRef.current.startsWith('/messages')) {
            setHasUnread(true)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => { requery() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, userId])

  const showUnreadDot = hasUnread && !pathname.startsWith('/messages')

  const initials = (displayName || username)
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        <div className="flex items-center gap-6 min-w-0">
          <Link href="/feed" className="font-bold text-lg shrink-0">
            LeafSwap
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map(({ label, href }) => {
              const isMessages = href === '/messages'
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    pathname.startsWith(href)
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {label}
                  {isMessages && showUnreadDot && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{displayName || username}</p>
              <p className="text-xs text-muted-foreground">@{username}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/profile/${username}`}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut} className="w-full">
                <button type="submit" className="w-full text-left text-destructive">
                  Log out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex z-50">
        {NAV_ITEMS.map(({ label, href }) => {
          const isMessages = href === '/messages'
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex-1 py-3 text-xs font-medium text-center transition-colors',
                pathname.startsWith(href) ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {label}
              {isMessages && showUnreadDot && (
                <span className="absolute top-2 left-1/2 translate-x-3 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
              )}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
