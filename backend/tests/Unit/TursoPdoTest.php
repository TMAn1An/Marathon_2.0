<?php

namespace Tests\Unit;

use App\Database\Turso\TursoPdo;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use PDO;
use PDOException;
use PHPUnit\Framework\TestCase;

class TursoPdoTest extends TestCase
{
    /** @var list<array> */
    private array $history = [];

    /** @param list<array> $responses */
    private function pdo(array $responses): TursoPdo
    {
        $mock = new MockHandler(array_map(fn ($b) => new Response(200, [], json_encode($b)), $responses));
        $stack = HandlerStack::create($mock);
        $stack->push(Middleware::history($this->history));

        return new TursoPdo('https://db.example.turso.io', 'tok', new Client(['handler' => $stack, 'base_uri' => 'https://db.example.turso.io/', 'http_errors' => false]));
    }

    private static function ok(array $result = []): array
    {
        return ['baton' => 'B1', 'results' => [['type' => 'ok', 'response' => ['type' => 'execute', 'result' => $result + ['cols' => [], 'rows' => [], 'affected_row_count' => 0, 'last_insert_rowid' => null]]]]];
    }

    private function sent(int $i): array
    {
        return json_decode((string) $this->history[$i]['request']->getBody(), true);
    }

    public function test_select_decodes_typed_values_and_binds_positionally(): void
    {
        $pdo = $this->pdo([self::ok([
            'cols' => [['name' => 'id'], ['name' => 'name'], ['name' => 'score'], ['name' => 'note']],
            'rows' => [[['type' => 'integer', 'value' => '7'], ['type' => 'text', 'value' => 'Ada'], ['type' => 'float', 'value' => 1.5], ['type' => 'null']]],
        ])]);

        $stmt = $pdo->prepare('select * from t where a = ? and b = ?');
        $stmt->setFetchMode(PDO::FETCH_OBJ);
        $stmt->bindValue(1, 5, PDO::PARAM_INT);
        $stmt->bindValue(2, "it's", PDO::PARAM_STR);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $this->assertSame(7, $rows[0]->id);
        $this->assertSame('Ada', $rows[0]->name);
        $this->assertSame(1.5, $rows[0]->score);
        $this->assertNull($rows[0]->note);

        $req = $this->sent(0);
        $this->assertSame('integer', $req['requests'][0]['stmt']['args'][0]['type']);
        $this->assertSame('5', $req['requests'][0]['stmt']['args'][0]['value']);
        $this->assertSame("it's", $req['requests'][0]['stmt']['args'][1]['value']);
        // One-shot statements close their own stream.
        $this->assertSame('close', $req['requests'][1]['type']);
        $this->assertSame('Bearer tok', $this->history[0]['request']->getHeaderLine('Authorization'));
    }

    public function test_transactions_reuse_the_stream_baton_and_close_on_commit(): void
    {
        $pdo = $this->pdo([self::ok(), self::ok(['last_insert_rowid' => '42', 'affected_row_count' => 1]), self::ok()]);

        $pdo->beginTransaction();
        $this->assertTrue($pdo->inTransaction());
        $stmt = $pdo->prepare('insert into t (a) values (?)');
        $stmt->bindValue(1, 'x');
        $stmt->execute();
        $this->assertSame(1, $stmt->rowCount());
        $this->assertSame('42', $pdo->lastInsertId());
        $pdo->commit();
        $this->assertFalse($pdo->inTransaction());

        $this->assertNull($this->sent(0)['baton']);
        $this->assertCount(1, $this->sent(0)['requests']);          // BEGIN keeps the stream open
        $this->assertSame('B1', $this->sent(1)['baton']);            // insert continues it
        $this->assertSame('B1', $this->sent(2)['baton']);            // COMMIT continues it…
        $this->assertSame('close', $this->sent(2)['requests'][1]['type']); // …and closes it
    }

    public function test_sql_errors_become_pdo_exceptions_with_the_server_message(): void
    {
        $pdo = $this->pdo([['baton' => null, 'results' => [['type' => 'error', 'error' => ['message' => 'UNIQUE constraint failed: participants.email']]]]]);

        try {
            $pdo->exec('insert into participants (email) values (1)');
            $this->fail('Expected PDOException');
        } catch (PDOException $e) {
            $this->assertStringContainsString('UNIQUE constraint failed: participants.email', $e->getMessage());
        }
    }

    public function test_quote_escapes_single_quotes(): void
    {
        $this->assertSame("'O''Neil'", $this->pdo([])->quote("O'Neil"));
    }
}
