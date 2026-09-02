import { ModerationClient } from '@/components/admin/moderation/ModerationClient';

export default async function AdminCommentsPage() {
  return (
    <ModerationClient
      target="comments"
      title="Comments"
      description="Moderate user comments — hide inappropriate content or delete it outright. Hidden comments and replies are excluded from public threads."
    />
  );
}
