<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Participant;

class ParticipantPolicy
{
    public function viewAny(Admin $admin): bool
    {
        return $admin->isAdmin();
    }

    public function view(Admin $admin, Participant $participant): bool
    {
        return $admin->isAdmin();
    }

    public function update(Admin $admin, Participant $participant): bool
    {
        return $admin->isAdmin();
    }

    public function recordResults(Admin $admin, Participant $participant): bool
    {
        return $admin->isAdmin() && $participant->isConfirmed();
    }

    public function delete(Admin $admin, Participant $participant): bool
    {
        return $admin->isSuperAdmin();
    }
}
