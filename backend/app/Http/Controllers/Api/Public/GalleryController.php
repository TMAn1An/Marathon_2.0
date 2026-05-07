<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GalleryImage::query()
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderByDesc('id');

        if ($request->filled('event_id')) {
            $query->where('event_id', $request->integer('event_id'));
        }

        $perPage = min(60, (int) $request->integer('per_page', 24));
        $page = $query->paginate($perPage);

        return response()->json([
            'data' => $page->getCollection()->map(fn (GalleryImage $img) => [
                'id' => $img->id,
                'image_url' => asset('storage/'.$img->image_path),
                'caption' => $img->caption,
                'width' => $img->width,
                'height' => $img->height,
            ]),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ],
        ]);
    }
}
