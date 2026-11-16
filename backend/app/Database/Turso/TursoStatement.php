<?php

namespace App\Database\Turso;

use PDO;
use PDOStatement;

class TursoStatement extends PDOStatement
{
    /** @var array<int|string, mixed> */
    private array $bindings = [];

    /** @var list<string> */
    private array $columns = [];

    /** @var list<list<mixed>> */
    private array $rows = [];

    private int $cursor = 0;

    private int $affected = 0;

    private int $fetchMode = PDO::FETCH_BOTH;

    /** @noinspection PhpMissingParentConstructorInspection */
    public function __construct(private readonly TursoPdo $pdo, string $sql)
    {
        $this->queryString = $sql;
    }

    public function bindValue(string|int $param, mixed $value, int $type = PDO::PARAM_STR): bool
    {
        $this->bindings[$param] = $value;

        return true;
    }

    public function bindParam(string|int $param, mixed &$var, int $type = PDO::PARAM_STR, int $maxLength = 0, mixed $driverOptions = null): bool
    {
        $this->bindings[$param] = $var;

        return true;
    }

    public function execute(?array $params = null): bool
    {
        $bindings = $params ?? $this->bindings;
        $positional = [];
        $named = [];

        foreach ($bindings as $key => $value) {
            if (is_int($key)) {
                // Laravel binds 1-based positions; execute([..]) arrays are 0-based.
                $positional[$params === null ? $key - 1 : $key] = self::encode($value);
            } else {
                $named[] = ['name' => ltrim($key, ':'), 'value' => self::encode($value)];
            }
        }
        ksort($positional);

        $result = $this->pdo->run($this->queryString, array_values($positional), $named);

        $this->columns = array_map(fn (array $c) => $c['name'], $result['cols'] ?? []);
        $this->rows = array_map(
            fn (array $row) => array_map(self::decode(...), $row),
            $result['rows'] ?? []
        );
        $this->affected = (int) ($result['affected_row_count'] ?? 0);
        $this->cursor = 0;

        return true;
    }

    public function setFetchMode(int $mode, mixed ...$args): bool
    {
        $this->fetchMode = $mode;

        return true;
    }

    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $cursorOrientation = PDO::FETCH_ORI_NEXT, int $cursorOffset = 0): mixed
    {
        if (! isset($this->rows[$this->cursor])) {
            return false;
        }

        return $this->shape($this->rows[$this->cursor++], $mode);
    }

    public function fetchAll(int $mode = PDO::FETCH_DEFAULT, mixed ...$args): array
    {
        $out = [];
        while (isset($this->rows[$this->cursor])) {
            $row = $this->rows[$this->cursor++];
            $out[] = $mode === PDO::FETCH_COLUMN
                ? ($row[$args[0] ?? 0] ?? null)
                : $this->shape($row, $mode);
        }

        return $out;
    }

    public function fetchColumn(int $column = 0): mixed
    {
        if (! isset($this->rows[$this->cursor])) {
            return false;
        }

        return $this->rows[$this->cursor++][$column] ?? null;
    }

    public function rowCount(): int
    {
        return $this->affected;
    }

    public function columnCount(): int
    {
        return count($this->columns);
    }

    public function closeCursor(): bool
    {
        $this->cursor = count($this->rows);

        return true;
    }

    public function errorCode(): ?string
    {
        return null;
    }

    public function errorInfo(): array
    {
        return ['00000', null, null];
    }

    /** @param list<mixed> $row */
    private function shape(array $row, int $mode): mixed
    {
        $mode = $mode === PDO::FETCH_DEFAULT ? $this->fetchMode : $mode;
        $assoc = array_combine($this->columns, $row);

        return match ($mode) {
            PDO::FETCH_ASSOC => $assoc,
            PDO::FETCH_NUM => $row,
            PDO::FETCH_OBJ => (object) $assoc,
            default => $assoc + $row,
        };
    }

    /** @return array<string, mixed> Hrana value */
    private static function encode(mixed $value): array
    {
        return match (true) {
            $value === null => ['type' => 'null'],
            is_bool($value) => ['type' => 'integer', 'value' => (string) (int) $value],
            is_int($value) => ['type' => 'integer', 'value' => (string) $value],
            is_float($value) => ['type' => 'float', 'value' => $value],
            is_resource($value) => ['type' => 'blob', 'base64' => base64_encode(stream_get_contents($value))],
            default => ['type' => 'text', 'value' => (string) $value],
        };
    }

    private static function decode(array $cell): mixed
    {
        return match ($cell['type'] ?? 'null') {
            'integer' => (int) $cell['value'],
            'float' => (float) $cell['value'],
            'text' => (string) $cell['value'],
            'blob' => base64_decode((string) ($cell['base64'] ?? ''), true),
            default => null,
        };
    }
}
