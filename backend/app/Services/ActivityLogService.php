<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogService
{
    public function log(?int $userId, string $entityType, int $entityId, string $action, string $description, array $meta = []): void
    {
        ActivityLog::create([
            'user_id' => $userId,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'action' => $action,
            'description' => $description,
            'meta' => $meta,
        ]);
    }
}
