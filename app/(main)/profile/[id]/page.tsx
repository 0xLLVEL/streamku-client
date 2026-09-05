import { fetchApi } from '@/lib/api.utils';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { avatarUrl, tmdbImageUrl } from '@/lib/config.utils';
import type { MediaListItem, ProfileUser } from '../profile-types';

interface ProfileData {
  user: ProfileUser;
  favorites: MediaListItem[];
  watchlist: MediaListItem[];
}

async function getUserProfile(id: string): Promise<ProfileData | null> {
    try {
        const res = await fetchApi(`/users/${id}/profile`, { next: { revalidate: 0 } });
        if (res.ok) {
            const json = await res.json();
            return json.data;
        }
    } catch {
        return null;
    }
    return null;
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const profileData = await getUserProfile(id);

    if (!profileData || !profileData.user) {
        notFound();
    }

    const { user, favorites } = profileData;

    const displayName = user.nickname ?? user.name;

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-24">
            <div className="h-48 md:h-56 w-full bg-gradient-to-br from-zinc-800 via-[#0a0a0a] to-zinc-900 border-b border-white/5" aria-hidden />
            <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-24">
                <div className="-mt-16 md:-mt-20 flex flex-col md:flex-row md:items-end gap-6 mb-12">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-white font-bold text-5xl md:text-6xl shadow-2xl shrink-0 border-4 border-[#0a0a0a] ring-1 ring-white/10">
                        {user.avatar ? <Image src={avatarUrl(user.avatar) ?? ''} alt={`${user.name} avatar`} fill sizes="160px" unoptimized className="object-cover" /> : ((user.nickname || user.name) ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="pb-1">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">{displayName}</h1>
                        {user.nickname && <p className="text-white/60 mt-1">{user.name}</p>}
                        <p className="text-white/40 text-sm mt-2">{favorites.length} favorites • Public profile</p>
                    </div>
                </div>

                <section aria-labelledby="favorites-heading" className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center" aria-hidden>
                            <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                        </span>
                        <h2 id="favorites-heading" className="text-xl md:text-2xl font-bold text-white">Favorites</h2>
                        <span className="ml-auto text-sm text-white/40">{favorites.length} titles</span>
                    </div>

                    {favorites.length === 0 ? (
                        <div role="status" className="flex flex-col items-center justify-center p-12 md:p-16 rounded-3xl bg-white/[0.03] border border-white/5 text-center">
                            <p className="text-white font-semibold">No favorites yet</p>
                            <p className="text-white/50 text-sm mt-1 max-w-md">{displayName} hasn&apos;t added any favorites.</p>
                        </div>
                    ) : (
                        <ul role="list" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {favorites.map((item) => {
                                const details = item.media_details;
                                const link = item.media_type === 'movie' ? `/movie/${details?.slug}` : `/tv/${details?.slug}`;
                                const poster = details?.poster_path ? tmdbImageUrl(details.poster_path, 'w342') : null;
                                return (
                                    <li key={item.id} className="group">
                                        <Link href={link} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-xl">
                                            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-black/40 border border-white/10 relative">
                                                {poster ? <Image src={poster} alt={details?.title || ''} fill sizes="180px" className="object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">No Image</div>}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-end p-3">
                                                    <h3 className="text-white font-semibold text-sm truncate">{details?.title}</h3>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}