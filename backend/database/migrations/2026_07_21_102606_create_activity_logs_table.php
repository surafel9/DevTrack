<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action'); // e.g. 'added_comment', 'created_phase', 'updated_phase', etc.
            $table->string('subject_type')->nullable(); // e.g. 'phase', 'comment', 'link', 'project'
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('meta')->nullable(); // extra data like phase name, comment snippet, etc.
            $table->timestamps();

            $table->index(['project_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
