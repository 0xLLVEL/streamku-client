export function pageTitle(pathname: string): string {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname === '/admin/content') return 'Titles';
  if (pathname === '/admin/content/create') return 'Add Title';
  if (pathname === '/admin/cast') return 'Cast';
  if (pathname.startsWith('/admin/cast/')) return 'Edit Cast';
  if (pathname === '/admin/genres') return 'Genres';
  if (pathname.startsWith('/admin/genres/')) return 'Edit Genre';
  if (pathname === '/admin/reviews') return 'Reviews';
  if (pathname === '/admin/comments') return 'Comments';
  if (pathname.startsWith('/admin/movies/create')) return 'Create Movie';
  if (pathname.startsWith('/admin/movies/')) return 'Edit Movie';
  if (pathname.startsWith('/admin/tv-shows/create')) return 'Create TV Show';
  if (pathname.startsWith('/admin/tv-shows/')) return 'Edit TV Show';
  return 'Admin';
}

/** Full-height editor shells (EditFormShell) render their own chrome. */
export function isImmersiveRoute(pathname: string): boolean {
  return pathname.startsWith('/admin/movies/') || pathname.startsWith('/admin/tv-shows/');
}
