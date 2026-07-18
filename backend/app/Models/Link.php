<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Link extends Model
{
    //
    protected $fillable = [
        'title',
        'url',
    ];


    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
