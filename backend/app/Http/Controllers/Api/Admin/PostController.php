<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PostRequest;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Post::class);

        $query = Post::query()->with('admin:id,name,email')->orderByDesc('created_at');

        if ($request->filled('type')) {
            $query->where('post_type', $request->string('type'));
        }
        if ($request->filled('published')) {
            $query->where('is_published', $request->boolean('published'));
        }

        $perPage = min(50, (int) $request->integer('per_page', 20));

        return response()->json($query->paginate($perPage));
    }

    public function show(Post $post): JsonResponse
    {
        $this->authorize('view', $post);

        return response()->json(['data' => $this->serialize($post)]);
    }

    public function store(PostRequest $request): JsonResponse
    {
        $this->authorize('create', Post::class);

        $data = $request->validated();
        $data['admin_id'] = $request->user()->id;
        $data['slug'] = ! empty($data['slug'])
            ? Post::generateUniqueSlug($data['slug'])
            : Post::generateUniqueSlug($data['title']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('posts', 'public');
        }

        if (($data['is_published'] ?? false) && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        unset($data['image'], $data['remove_image']);

        $post = Post::create($data);

        return response()->json(['data' => $this->serialize($post)], 201);
    }

    public function update(PostRequest $request, Post $post): JsonResponse
    {
        $this->authorize('update', $post);

        $data = $request->validated();

        if (! empty($data['slug']) && $data['slug'] !== $post->slug) {
            $data['slug'] = Post::generateUniqueSlug($data['slug']);
        }

        if ($request->boolean('remove_image') && $post->image_path) {
            Storage::disk('public')->delete($post->image_path);
            $data['image_path'] = null;
        }
        if ($request->hasFile('image')) {
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }
            $data['image_path'] = $request->file('image')->store('posts', 'public');
        }

        if (($data['is_published'] ?? $post->is_published) && empty($data['published_at']) && empty($post->published_at)) {
            $data['published_at'] = now();
        }

        unset($data['image'], $data['remove_image']);
        $post->fill($data)->save();

        return response()->json(['data' => $this->serialize($post->fresh())]);
    }

    public function destroy(Post $post): JsonResponse
    {
        $this->authorize('delete', $post);

        if ($post->image_path) {
            Storage::disk('public')->delete($post->image_path);
        }
        $post->delete();

        return response()->json(['message' => 'Post deleted.']);
    }

    public function publish(Post $post): JsonResponse
    {
        $this->authorize('update', $post);

        $post->is_published = true;
        $post->published_at = $post->published_at ?? now();
        $post->save();

        return response()->json(['data' => $this->serialize($post)]);
    }

    public function unpublish(Post $post): JsonResponse
    {
        $this->authorize('update', $post);

        $post->is_published = false;
        $post->save();

        return response()->json(['data' => $this->serialize($post)]);
    }

    protected function serialize(Post $post): array
    {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'content' => $post->content,
            'post_type' => $post->post_type,
            'image_url' => $post->image_path ? asset('storage/'.$post->image_path) : null,
            'is_published' => $post->is_published,
            'published_at' => $post->published_at?->toIso8601String(),
            'event_id' => $post->event_id,
            'admin' => $post->admin?->only(['id', 'name', 'email']),
            'created_at' => $post->created_at?->toIso8601String(),
            'updated_at' => $post->updated_at?->toIso8601String(),
        ];
    }
}
