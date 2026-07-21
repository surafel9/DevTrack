<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user    = $this->user();
        $project = $this->route('project');

        // Admins can always edit
        if ($user->isCompanyAdmin()) {
            return true;
        }

        // Employees need the edit_project permission
        return $user->hasPermission('edit_project');
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'        => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'start_date'  => ['sometimes', 'nullable', 'date'],
            'end_date'    => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}
