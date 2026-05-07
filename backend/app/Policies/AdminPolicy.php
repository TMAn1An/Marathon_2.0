<?php

namespace App\Policies;

use App\Models\Admin;

class AdminPolicy
{
    public function viewAny(Admin $actor): bool
    {
        return $actor->isSuperAdmin();
    }

    public function create(Admin $actor): bool
    {
        return $actor->isSuperAdmin();
    }

    public function update(Admin $actor, Admin $target): bool
    {
        return $actor->isSuperAdmin();
    }

    public function delete(Admin $actor, Admin $target): bool
    {
        // Super admin only — cannot delete own account.
        return $actor->isSuperAdmin() && $actor->id !== $target->id;
    }
}
