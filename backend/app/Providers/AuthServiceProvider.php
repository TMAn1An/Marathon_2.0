<?php

namespace App\Providers;

use App\Models\Admin;
use App\Models\CertificateTemplate;
use App\Models\Event;
use App\Models\Participant;
use App\Models\Post;
use App\Policies\AdminPolicy;
use App\Policies\CertificateTemplatePolicy;
use App\Policies\EventPolicy;
use App\Policies\ParticipantPolicy;
use App\Policies\PostPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::policy(Admin::class, AdminPolicy::class);
        Gate::policy(Event::class, EventPolicy::class);
        Gate::policy(Post::class, PostPolicy::class);
        Gate::policy(Participant::class, ParticipantPolicy::class);
        Gate::policy(CertificateTemplate::class, CertificateTemplatePolicy::class);
    }
}
