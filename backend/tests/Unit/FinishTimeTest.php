<?php

namespace Tests\Unit;

use App\Models\Participant;
use PHPUnit\Framework\TestCase;

class FinishTimeTest extends TestCase
{
    public function test_parses_hms_and_ms(): void
    {
        $this->assertSame(3725, Participant::parseFinishTime('1:02:05'));
        $this->assertSame(2910, Participant::parseFinishTime('48:30'));
    }

    public function test_rejects_invalid_values(): void
    {
        $this->assertNull(Participant::parseFinishTime('1:75:00'));
        $this->assertNull(Participant::parseFinishTime('soon'));
        $this->assertNull(Participant::parseFinishTime(null));
    }
}
