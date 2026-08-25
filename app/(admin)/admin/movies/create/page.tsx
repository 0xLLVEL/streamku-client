import { MovieEditForm } from '@/components/admin/title-editor/MovieEditForm';

export default function CreateMoviePage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto flex flex-col">
      <MovieEditForm />
    </div>
  );
}
