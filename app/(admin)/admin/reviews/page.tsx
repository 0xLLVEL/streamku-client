import { ModerationClient } from '@/components/admin/moderation/ModerationClient';

export default async function AdminReviewsPage() {
  return (
    <ModerationClient
      target="reviews"
      title="Reviews"
      description="Moderate user reviews — hide inappropriate content or delete it outright. Hidden reviews are excluded from public averages and lists."
      showRating
    />
  );
}
