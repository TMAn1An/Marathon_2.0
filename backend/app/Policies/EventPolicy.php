<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Event;

class EventPolicy
{
    public function viewAny(Admin $admin): bool
    {
        return $admin->isAdmin();
    }

    public function view(Admin $admin, Event $event): bool
    {
        return $admin->isAdmin();
    }

    public function create(Admin $admin): bool
    {
        return $admin->isAdmin();
    }

    public function update(Admin $admin, Event $event): bool
    {
        return $admin->isAdmin();
    }

    public function delete(Admin $admin, Event $event): bool
    {
        return $admin->isSuperAdmin();
    }
}
