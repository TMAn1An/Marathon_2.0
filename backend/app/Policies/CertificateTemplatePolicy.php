<?php

namespace App\Policies;

use App\Models\Admin;

class CertificateTemplatePolicy
{
    public function manage(Admin $admin): bool
    {
        return $admin->isAdmin();
    }
}
