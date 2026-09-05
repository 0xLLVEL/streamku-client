export function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-500 text-sm tracking-wide" aria-label={`${rating} out of 10`}>
      {'★'.repeat(rating)}
      <span className="text-white/20">{'★'.repeat(10 - rating)}</span>
    </span>
  );
}
