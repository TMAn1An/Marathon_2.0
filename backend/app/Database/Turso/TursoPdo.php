<?php

namespace App\Database\Turso;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use PDO;
use PDOException;
use PDOStatement;

/**
 * A minimal PDO facade over Turso's HTTP API (Hrana "pipeline" protocol), so
 * Laravel's stock SQLite connection can talk to a remote libSQL database from
 * environments without the libSQL extension (e.g. Vercel). Only the PDO
 * surface Laravel actually uses is implemented.
 *
 * Transactions keep one server-side stream open across requests via the
 * protocol's "baton"; outside a transaction every statement is a one-shot
 * request that closes its own stream.
 */
class TursoPdo extends PDO
{
    private Client $http;

    private string $token;

    private ?string $baton = null;

    private bool $inTransaction = false;

    private string $lastInsertId = '0';

    /** @noinspection PhpMissingParentConstructorInspection The parent would open a real DSN. */
    public function __construct(string $url, string $token, ?Client $http = null)
    {
        $this->token = $token;
        $this->http = $http ?? new Client([
            'base_uri' => rtrim(str_replace('libsql://', 'https://', $url), '/').'/',
            'timeout' => 25,
            'connect_timeout' => 8,
            'http_errors' => false,
        ]);
    }

    public function prepare(string $query, array $options = []): PDOStatement|false
    {
        return new TursoStatement($this, $query);
    }

    public function exec(string $statement): int|false
    {
        $result = $this->run($statement, []);

        return (int) ($result['affected_row_count'] ?? 0);
    }

    public function query(string $query, ?int $fetchMode = null, mixed ...$fetchModeArgs): PDOStatement|false
    {
        $statement = new TursoStatement($this, $query);
        $statement->execute();

        return $statement;
    }

    public function beginTransaction(): bool
    {
        $this->run('BEGIN', []);

        return true;
    }

    public function commit(): bool
    {
        $this->run('COMMIT', []);

        return true;
    }

    public function rollBack(): bool
    {
        try {
            $this->run('ROLLBACK', []);
        } catch (PDOException) {
            // The stream may already be gone (error/expiry); nothing left to undo.
        }
        $this->inTransaction = false;
        $this->baton = null;

        return true;
    }

    public function inTransaction(): bool
    {
        return $this->inTransaction;
    }

    public function lastInsertId(?string $name = null): string|false
    {
        return $this->lastInsertId;
    }

    public function quote(string $string, int $type = PDO::PARAM_STR): string|false
    {
        return "'".str_replace("'", "''", $string)."'";
    }

    public function getAttribute(int $attribute): mixed
    {
        return match ($attribute) {
            PDO::ATTR_DRIVER_NAME => 'sqlite',
            PDO::ATTR_SERVER_VERSION, PDO::ATTR_CLIENT_VERSION => 'libSQL (Turso HTTP)',
            default => null,
        };
    }

    public function setAttribute(int $attribute, mixed $value): bool
    {
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

    /**
     * Executes one statement and returns the raw Hrana result.
     *
     * @param  list<array<string, mixed>>  $args  Hrana-encoded positional args
     * @return array<string, mixed>
     */
    public function run(string $sql, array $args, array $named = []): array
    {
        $isBegin = (bool) preg_match('/^\s*BEGIN\b/i', $sql);
        $endsTransaction = (bool) preg_match('/^\s*(COMMIT|END|ROLLBACK)\b(?!\s+TO)/i', $sql);
        $keepOpen = ($this->inTransaction || $isBegin) && ! $endsTransaction;

        $stmt = ['sql' => $sql, 'want_rows' => true];
        if ($args !== []) {
            $stmt['args'] = $args;
        }
        if ($named !== []) {
            $stmt['named_args'] = $named;
        }

        $requests = [['type' => 'execute', 'stmt' => $stmt]];
        if (! $keepOpen) {
            $requests[] = ['type' => 'close'];
        }

        try {
            $response = $this->http->post('v2/pipeline', [
                'headers' => ['Authorization' => "Bearer {$this->token}"],
                'json' => ['baton' => $this->baton, 'requests' => $requests],
            ]);
        } catch (GuzzleException $e) {
            $this->resetStream();
            throw new PDOException('SQLSTATE[HY000]: General error: Turso request failed: '.$e->getMessage(), 0, $e);
        }

        $body = json_decode((string) $response->getBody(), true);
        if ($response->getStatusCode() >= 400 || ! is_array($body)) {
            $this->resetStream();
            $message = is_array($body) ? ($body['error'] ?? json_encode($body)) : (string) $response->getBody();
            throw new PDOException("SQLSTATE[HY000]: General error: Turso HTTP {$response->getStatusCode()}: {$message}");
        }

        $first = $body['results'][0] ?? [];
        if (($first['type'] ?? null) === 'error') {
            // A failed statement leaves an open stream usable for ROLLBACK.
            $this->baton = $keepOpen ? ($body['baton'] ?? $this->baton) : null;
            $message = $first['error']['message'] ?? 'unknown error';
            $exception = new PDOException("SQLSTATE[HY000]: General error: 1 {$message}", 1);
            $exception->errorInfo = ['HY000', 1, $message];
            throw $exception;
        }

        $this->baton = $keepOpen ? ($body['baton'] ?? null) : null;
        if ($isBegin) {
            $this->inTransaction = true;
        } elseif ($endsTransaction) {
            $this->inTransaction = false;
        }

        $result = $first['response']['result'] ?? [];
        if (($result['last_insert_rowid'] ?? null) !== null) {
            $this->lastInsertId = (string) $result['last_insert_rowid'];
        }

        return $result;
    }

    private function resetStream(): void
    {
        $this->baton = null;
        $this->inTransaction = false;
    }
}
