import { fetchApi } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getUserProfile(id: string) {
    try {
        const res = await fetchApi(`/users/${id}/profile`, { next: { revalidate: 0 } });
        if (res.ok) {
            const json = await res.json();
            return json.data;
        }
    } catch (err) {
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

    const { user, favorites, watchlist } = profileData;

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-28 px-4 md:px-12 lg:px-24 pb-24">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-white font-bold text-5xl md:text-6xl shadow-2xl shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center md:text-left flex flex-col justify-center h-full pt-4">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                        {user.name}
                    </h1>
                </div>
            </div>

            {/* Favorites Section */}
            <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">Favorites</h2>
                </div>

                {favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 rounded-3xl liquid-glass border-white/5 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <h3 className="text-xl font-bold text-white mb-2">No favorites yet</h3>
                        <p className="text-white/50 max-w-md">{user.name} hasn't added any favorites.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {favorites.map((item: any) => {
                            const details = item.media_details;
                            const link = item.media_type === 'movie' ? `/movie/${details?.slug}` : `/tv/${details?.slug}`;
                            const poster = details?.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null;

                            return (
                                <div key={item.id} className="relative group cursor-pointer">
                                    <Link href={link}>
                                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow-lg relative">
                                            {poster ? (
                                                <img
                                                    src={poster}
                                                    alt={details?.title || 'Media poster'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-white/30 p-4 text-center">
                                                    <span className="text-xs">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                <div className="w-full">
                                                    <h3 className="text-white font-bold text-sm truncate w-full shadow-black drop-shadow-md">
                                                        {details?.title}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}