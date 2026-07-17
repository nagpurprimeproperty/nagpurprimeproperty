'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Heart, Eye, LogOut, Mail, Phone, MapPin, Save, BadgeCheck, Loader2 } from 'lucide-react'
import { useAuth, useViewed, useClientAuth, useFavorites } from '@/lib/stores'
import { useProfile, useUpdateProfile, useSavedProperties, useAllSavedPropertyIds } from '@/lib/hooks/useProfile'
import { useProperties, useSaveToggle } from '@/lib/hooks/useProperties'
import { useLogout } from '@/lib/hooks/useAuthMutations'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PropertyCard, PropertyCardSkeleton } from '@/components/site/PropertyCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'

function getPaginationRange(current, total) {
  const range = []
  const delta = 1
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }
  const result = []
  let l
  for (const i of range) {
    if (l !== undefined) {
      if (i - l === 2) {
        result.push(l + 1)
      } else if (i - l > 2) {
        result.push('...')
      }
    }
    result.push(i)
    l = i
  }
  return result
}

export default function ProfilePage() {
  const { user: authUser, token } = useClientAuth()  // SSR-safe
  const { login, logout: localLogout } = useAuth()
  const viewedIds = useViewed((s) => s.ids)
  const fav = useFavorites()
  const router = useRouter()

  const [savedPage, setSavedPage] = useState(1)
  const [viewedPage, setViewedPage] = useState(1)

  const { data: profile, isLoading: profileLoading } = useProfile(token)
  const { data: savedProps, isLoading: savedLoading } = useSavedProperties(token, savedPage, 12)
  const { data: allSavedIds } = useAllSavedPropertyIds(token)
  const updateProfileMutation = useUpdateProfile()
  const saveToggleMutation = useSaveToggle()
  const logoutMutation = useLogout()

  // Client-side pagination for viewed properties
  const limit = 12
  const viewedTotalPages = Math.ceil(viewedIds.length / limit) || 1
  const startIndex = (viewedPage - 1) * limit
  const pageViewedIds = viewedIds.slice(startIndex, startIndex + limit)

  const { data: viewedProps, isLoading: viewedLoading } = useProperties(
    pageViewedIds.length > 0 ? { ids: pageViewedIds.join(',') } : {},
    { enabled: pageViewedIds.length > 0 }
  )
  
  const user = profile ?? authUser
  const rawViewed = pageViewedIds.length > 0 ? (Array.isArray(viewedProps) ? viewedProps : viewedProps?.data ?? []) : []
  // Sort viewed to match pageViewedIds order
  const viewed = [...rawViewed].sort((a, b) => {
    const aId = a._id || a.id
    const bId = b._id || b.id
    return pageViewedIds.indexOf(aId) - pageViewedIds.indexOf(bId)
  })

  // Sync database favorites to client-side favorites store
  useEffect(() => {
    if (token && allSavedIds) {
      fav.setIds(allSavedIds)
    }
  }, [token, allSavedIds])

  useEffect(() => {
    // Use getState() — reads store synchronously, avoids hydration false-redirect
    const { token: t, user: u } = useAuth.getState();
    if (!t && !u) router.push('/login')
  }, [router])

  const [form, setForm] = useState({ name: '', email: '', area: '', address: '' })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        area: user.area || '',
        address: user.address || '',
      })
    }
  }, [user])

  if (!token && !authUser) return null

  const saved = savedProps?.data ?? []
  const savedTotal = savedProps?.total ?? 0
  const savedTotalPages = savedProps?.totalPages ?? 1
  const initials = (user?.name || 'U').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      toast.loading('Uploading profile picture...', { id: 'avatar' });
      const updated = await updateProfileMutation.mutateAsync({ data: formData, token });
      if (updated) login(updated, token);
      toast.success('Profile picture updated!', { id: 'avatar' });
    } catch (err) {
      toast.error(err.message || 'Failed to upload profile picture', { id: 'avatar' });
    }
  };

  const handleLogout = async () => {
    try {
      if (token) await logoutMutation.mutateAsync({ token })
    } catch { /* ignore */ }
    localLogout()
    router.push('/')
  }

  const handleSave = async () => {
    try {
      const updated = await updateProfileMutation.mutateAsync({ data: form, token })
      if (updated) login(updated, token)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    }
  }

  return (
    <div className="bg-gradient-to-b from-accent/40 to-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
          <div className="h-32 bg-gradient-primary sm:h-40" />
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-12 flex flex-col items-start gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                <div className="relative group">
                  <div className="relative overflow-hidden h-24 w-24 rounded-2xl border-4 border-card bg-gradient-primary text-3xl font-bold text-primary-foreground shadow-elegant sm:h-28 sm:w-28 flex items-center justify-center">
                    {profileLoading ? (
                      <div className="h-full w-full bg-muted-foreground/15 animate-pulse" />
                    ) : user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user?.name || 'User'}
                        fill
                        sizes="(max-width: 768px) 96px, 112px"
                        className="object-cover"
                      />
                    ) : (
                      <span>{initials || 'U'}</span>
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/45 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[11px] font-semibold">
                    Change Photo
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-bold leading-tight">{user?.name}</h1>
                    <BadgeCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                    {user?.mobile && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{user.mobile}</span>}
                    {user?.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span>}
                    {user?.area && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{user.area}</span>}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending} className="w-full sm:w-auto mt-2 sm:mt-0">
                <LogOut className="mr-1.5 h-4 w-4" /> Logout
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatCard icon={Heart} label="Saved properties" value={savedLoading ? <Skeleton className="h-5 w-8 bg-muted-foreground/15 inline-block" /> : savedTotal} />
              <StatCard icon={Eye} label="Recently viewed" value={viewedIds.length} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="mt-8">
          <TabsList className="flex w-full justify-start overflow-x-auto rounded-full bg-muted/60 p-1">
            <TabsTrigger value="profile" className="rounded-full">Profile</TabsTrigger>
            <TabsTrigger value="saved" className="rounded-full">Saved</TabsTrigger>
            <TabsTrigger value="viewed" className="rounded-full">Viewed</TabsTrigger>
          </TabsList>

          {/* Profile edit */}
          <TabsContent value="profile" className="mt-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-xl font-bold">Personal information</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Full name" id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Field label="Email address" id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Field label="Area / locality" id="area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
                <Field label="Address" id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <Button className="mt-6" onClick={handleSave} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save changes
              </Button>
            </div>
          </TabsContent>

          {/* Saved properties */}
          <TabsContent value="saved" className="mt-6">
            {savedLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : saved.length > 0 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {saved.map((p, i) => <PropertyCard key={p._id || p.id} p={p} index={i} />)}
                </div>
                
                {savedTotalPages > 1 && (
                  <Pagination className="mt-10">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (savedPage > 1) {
                              setSavedPage(savedPage - 1)
                              window.scrollTo({ top: 400, behavior: 'smooth' })
                            }
                          }}
                          className={savedPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {getPaginationRange(savedPage, savedTotalPages).map((p, idx) => (
                        <PaginationItem key={idx}>
                          {p === '...' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              isActive={savedPage === p}
                              onClick={(e) => {
                                e.preventDefault()
                                setSavedPage(p)
                                window.scrollTo({ top: 400, behavior: 'smooth' })
                              }}
                            >
                              {p}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (savedPage < savedTotalPages) {
                              setSavedPage(savedPage + 1)
                              window.scrollTo({ top: 400, behavior: 'smooth' })
                            }
                          }}
                          className={savedPage === savedTotalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <EmptyTab icon={Heart} label="No saved properties" sub="Tap the heart on any listing to save it." />
            )}
          </TabsContent>

          {/* Viewed (Zustand-based) */}
          <TabsContent value="viewed" className="mt-6">
            {viewedLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : viewed.length > 0 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {viewed.map((p, i) => <PropertyCard key={p._id || p.id} p={p} index={i} />)}
                </div>

                {viewedTotalPages > 1 && (
                  <Pagination className="mt-10">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (viewedPage > 1) {
                              setViewedPage(viewedPage - 1)
                              window.scrollTo({ top: 400, behavior: 'smooth' })
                            }
                          }}
                          className={viewedPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {getPaginationRange(viewedPage, viewedTotalPages).map((p, idx) => (
                        <PaginationItem key={idx}>
                          {p === '...' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              isActive={viewedPage === p}
                              onClick={(e) => {
                                e.preventDefault()
                                setViewedPage(p)
                                window.scrollTo({ top: 400, behavior: 'smooth' })
                              }}
                            >
                              {p}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (viewedPage < viewedTotalPages) {
                              setViewedPage(viewedPage + 1)
                              window.scrollTo({ top: 400, behavior: 'smooth' })
                            }
                          }}
                          className={viewedPage === viewedTotalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <EmptyTab icon={Eye} label="No recently viewed" sub="Properties you visit will appear here." />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 shadow-soft">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="font-display text-2xl font-bold leading-tight">{value}</div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function Field({ label, id, type = 'text', value, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={onChange} />
    </div>
  )
}

function EmptyTab({ icon: Icon, label, sub }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-14 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold">{label}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </div>
  )
}
