<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['project_id', 'name', 'status', 'order'])]
class Phase extends Model {}
