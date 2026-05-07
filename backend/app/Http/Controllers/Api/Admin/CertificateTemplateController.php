<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateTemplate;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CertificateTemplateController extends Controller
{
    public function show(Event $event): JsonResponse
    {
        $this->authorize('manage', CertificateTemplate::class);

        $template = $event->certificateTemplate ?? CertificateTemplate::create([
            'event_id' => $event->id,
            'primary_color' => '#ED1C24',
        ]);

        return response()->json(['data' => $this->serialize($template)]);
    }

    public function update(Event $event, Request $request): JsonResponse
    {
        $this->authorize('manage', CertificateTemplate::class);

        $data = $request->validate([
            'primary_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'signature_1_name' => ['nullable', 'string', 'max:120'],
            'signature_1_designation' => ['nullable', 'string', 'max:160'],
            'signature_2_name' => ['nullable', 'string', 'max:120'],
            'signature_2_designation' => ['nullable', 'string', 'max:160'],
            'signature_1' => ['nullable', 'image', 'max:2048'],
            'signature_2' => ['nullable', 'image', 'max:2048'],
            'remove_signature_1' => ['nullable', 'boolean'],
            'remove_signature_2' => ['nullable', 'boolean'],
        ]);

        $template = $event->certificateTemplate ?? new CertificateTemplate(['event_id' => $event->id]);

        foreach (['primary_color', 'signature_1_name', 'signature_1_designation', 'signature_2_name', 'signature_2_designation'] as $field) {
            if (array_key_exists($field, $data)) {
                $template->{$field} = $data[$field];
            }
        }

        if ($request->boolean('remove_signature_1') && $template->signature_1_path) {
            Storage::disk('public')->delete($template->signature_1_path);
            $template->signature_1_path = null;
        }
        if ($request->hasFile('signature_1')) {
            if ($template->signature_1_path) {
                Storage::disk('public')->delete($template->signature_1_path);
            }
            $template->signature_1_path = $request->file('signature_1')->store('cert-signatures', 'public');
        }

        if ($request->boolean('remove_signature_2') && $template->signature_2_path) {
            Storage::disk('public')->delete($template->signature_2_path);
            $template->signature_2_path = null;
        }
        if ($request->hasFile('signature_2')) {
            if ($template->signature_2_path) {
                Storage::disk('public')->delete($template->signature_2_path);
            }
            $template->signature_2_path = $request->file('signature_2')->store('cert-signatures', 'public');
        }

        $template->save();

        return response()->json(['data' => $this->serialize($template->fresh())]);
    }

    public function duplicate(Event $event, Event $source): JsonResponse
    {
        $this->authorize('manage', CertificateTemplate::class);

        $sourceTemplate = $source->certificateTemplate;
        if (! $sourceTemplate) {
            return response()->json([
                'message' => 'Source event has no certificate template configured.',
            ], 404);
        }

        $template = $event->certificateTemplate ?? new CertificateTemplate(['event_id' => $event->id]);
        $template->primary_color = $sourceTemplate->primary_color;
        $template->signature_1_name = $sourceTemplate->signature_1_name;
        $template->signature_1_designation = $sourceTemplate->signature_1_designation;
        $template->signature_2_name = $sourceTemplate->signature_2_name;
        $template->signature_2_designation = $sourceTemplate->signature_2_designation;

        // Copy signature files (deep copy so deleting source doesn't break this one)
        $template->signature_1_path = $this->copyAsset($sourceTemplate->signature_1_path);
        $template->signature_2_path = $this->copyAsset($sourceTemplate->signature_2_path);

        $template->save();

        return response()->json(['data' => $this->serialize($template->fresh())]);
    }

    protected function copyAsset(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        $ext = pathinfo($path, PATHINFO_EXTENSION) ?: 'png';
        $copy = 'cert-signatures/'.bin2hex(random_bytes(8)).'.'.$ext;
        Storage::disk('public')->copy($path, $copy);

        return $copy;
    }

    protected function serialize(CertificateTemplate $template): array
    {
        return [
            'id' => $template->id,
            'event_id' => $template->event_id,
            'primary_color' => $template->primary_color,
            'signature_1_name' => $template->signature_1_name,
            'signature_1_designation' => $template->signature_1_designation,
            'signature_1_url' => $template->signature_1_path ? asset('storage/'.$template->signature_1_path) : null,
            'signature_2_name' => $template->signature_2_name,
            'signature_2_designation' => $template->signature_2_designation,
            'signature_2_url' => $template->signature_2_path ? asset('storage/'.$template->signature_2_path) : null,
        ];
    }
}
