<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Participant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CertificateAndResultsTest extends TestCase
{
    use RefreshDatabase;

    private function runner(array $attrs = []): Participant
    {
        return Participant::factory()->confirmed()->create(array_merge([
            'bib_number' => 'IUB0001',
            'phone' => '+8801712345678',
        ], $attrs));
    }

    public function test_certificate_requires_bib_and_matching_phone(): void
    {
        $this->runner(['finish_time_seconds' => 3100]);

        $this->getJson('/api/certificates/lookup?bib=IUB0001&phone=%2B8801712345678')->assertOk()
            ->assertJsonPath('data.participant.finish_time', '0:51:40');
        $this->getJson('/api/certificates/lookup?bib=IUB0001&phone=01999999999')->assertNotFound();
        $this->getJson('/api/certificates/lookup?bib=IUB0001')->assertStatus(422);
    }

    public function test_no_certificate_until_a_finish_time_is_recorded(): void
    {
        $this->runner();
        $this->getJson('/api/certificates/lookup?bib=IUB0001&phone=%2B8801712345678')->assertNotFound();

        config(['marathon.certificates.require_finish' => false]);
        $this->getJson('/api/certificates/lookup?bib=IUB0001&phone=%2B8801712345678')->assertOk();
    }

    public function test_certificate_pdf_renders(): void
    {
        $this->runner(['finish_time_seconds' => 3100]);
        $uuid = $this->getJson('/api/certificates/lookup?bib=IUB0001&phone=%2B8801712345678')->json('data.certificate_uuid');

        $res = $this->get("/api/certificates/{$uuid}/download")->assertOk();
        $this->assertStringStartsWith('%PDF', $res->getContent());
    }

    public function test_admin_imports_results_and_public_leaderboard_ranks_them(): void
    {
        $this->runner();
        $this->runner(['bib_number' => 'IUB0002', 'phone' => '01700000002', 'category' => 'faculty']);
        $admin = Admin::create(['name' => 'A', 'email' => 'a@example.com', 'password' => 'secret-password-1', 'role' => 'admin', 'is_active' => true]);

        $this->actingAs($admin, 'admin')->postJson('/api/admin/results/import', ['rows' => [
            ['bib' => 'IUB0001', 'time' => '0:55:00'],
            ['bib' => 'iub0002', 'time' => '48:30'],
            ['bib' => 'IUB9999', 'time' => '0:50:00'],
            ['bib' => 'IUB0001', 'time' => 'fast'],
        ]])->assertOk()->assertJsonPath('data.updated', 2)->assertJsonCount(2, 'data.errors');

        $this->getJson('/api/results')->assertOk()
            ->assertJsonPath('data.0.bib_number', 'IUB0002')
            ->assertJsonPath('data.0.finish_time', '0:48:30')
            ->assertJsonPath('data.1.rank', 2)
            ->assertJsonMissingPath('data.0.phone');
    }

    public function test_finish_time_parser(): void
    {
        $this->assertSame(3725, Participant::parseFinishTime('1:02:05'));
        $this->assertSame(2910, Participant::parseFinishTime('48:30'));
        $this->assertNull(Participant::parseFinishTime('1:75:00'));
        $this->assertNull(Participant::parseFinishTime('soon'));
    }
}
