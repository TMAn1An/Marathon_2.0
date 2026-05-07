<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Post::query()
            ->where('is_published', true)
            ->where('published_at', '<=', now())
            ->orderByDesc('published_at');

        if ($request->filled('type')) {
            $query->where('post_type', $request->string('type'));
        }

        $posts = $query->paginate(min(50, (int) $request->integer('per_page', 12)));

        return response()->json([
            'data' => $posts->getCollection()->map(fn (Post $p) => $this->summary($p)),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function show(Post $post): JsonResponse
    {
        if (! $post->is_published || $post->published_at > now()) {
            abort(404);
        }

        return response()->json([
            'data' => array_merge($this->summary($post), [
                'content' => $post->content,
            ]),
        ]);
    }

    protected function summary(Post $post): array
    {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'post_type' => $post->post_type,
            'image_url' => $post->image_path ? asset('storage/'.$post->image_path) : null,
            'published_at' => $post->published_at?->toIso8601String(),
            'excerpt' => $this->excerpt($post->content),
        ];
    }

    protected function excerpt(?string $html): string
    {
        if (! $html) {
            return '';
        }
        $plain = trim(strip_tags($html));

        return mb_strlen($plain) > 220 ? mb_substr($plain, 0, 220).'…' : $plain;
    }
}
