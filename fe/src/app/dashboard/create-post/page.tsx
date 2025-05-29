import CreatePostsForm from "./_components/create-posts-form";

export default function CreatePostPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Post</h1>
        <p className="text-muted-foreground mt-1">
          Create and publish content to your social media accounts
        </p>
      </div>
      <CreatePostsForm />
    </div>
  );
}
