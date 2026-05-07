<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Post;

class PostPolicy
{
    public function viewAny(Admin $admin): bool
    {
        return $admin->isAdmin();
    }

    public function view(Admin $admin, Post $post): bool
    {
        return $admin->isAdmin();
    }

    public function create(Admin $admin): bool
    {
        return $admin->isAdmin();
    }

    public function update(Admin $admin, Post $post): bool
    {
        return $admin->isAdmin();
    }

    public function delete(Admin $admin, Post $post): bool
    {
        return $admin->isAdmin();
    }
}
