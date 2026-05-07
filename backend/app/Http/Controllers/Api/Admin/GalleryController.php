<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GalleryImage::query()->orderBy('sort_order')->orderByDesc('id');

        if ($request->filled('event_id')) {
            $query->where('event_id', $request->integer('event_id'));
        }

        return response()->json($query->paginate(min(60, (int) $request->integer('per_page', 30))));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'caption' => ['nullable', 'string', 'max:200'],
            'sort_order' => ['nullable', 'integer'],
            'is_published' => ['nullable', 'boolean'],
            'image' => ['required', 'image', 'max:8192'],
        ]);

        $path = $request->file('image')->store('gallery', 'public');
        $abs = Storage::disk('public')->path($path);
        [$width, $height] = @getimagesize($abs) ?: [null, null];

        $image = GalleryImage::create([
            'event_id' => $data['event_id'] ?? null,
            'image_path' => $path,
            'caption' => $data['caption'] ?? null,
            'width' => $width,
            'height' => $height,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_published' => $data['is_published'] ?? true,
        ]);

        return response()->json(['data' => $image->only(['id', 'event_id', 'image_path', 'caption', 'width', 'height', 'sort_order', 'is_published']) + ['image_url' => asset('storage/'.$image->image_path)]], 201);
    }

    public function destroy(GalleryImage $gallery): JsonResponse
    {
        if ($gallery->image_path && Storage::disk('public')->exists($gallery->image_path)) {
            Storage::disk('public')->delete($gallery->image_path);
        }
        $gallery->delete();

        return response()->json(['message' => 'Image removed.']);
    }
}
