<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PhaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'project_id' => $this->project_id,
            'parent_id'  => $this->parent_id,
            'name'       => $this->name,
            'status'     => $this->status,
            'order'      => $this->order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'children'   => PhaseResource::collection(
                $this->whenLoaded('childrenRecursive')
            ),
        ];
    }
}
