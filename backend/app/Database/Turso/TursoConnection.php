<?php

namespace App\Database\Turso;

use Illuminate\Database\Schema\SQLiteBuilder;
use Illuminate\Database\SQLiteConnection;

class TursoConnection extends SQLiteConnection
{
    public function getSchemaBuilder()
    {
        if ($this->schemaGrammar === null) {
            $this->useDefaultSchemaGrammar();
        }

        return new class($this) extends SQLiteBuilder
        {
            /** There is no local file to truncate: drop every table remotely instead. */
            public function dropAllTables()
            {
                foreach ($this->connection->select("select name from sqlite_master where type = 'table' and name not like 'sqlite_%'") as $row) {
                    $this->connection->statement('drop table if exists "'.str_replace('"', '""', $row->name).'"');
                }
            }

            public function dropAllViews()
            {
                foreach ($this->connection->select("select name from sqlite_master where type = 'view'") as $row) {
                    $this->connection->statement('drop view if exists "'.str_replace('"', '""', $row->name).'"');
                }
            }
        };
    }
}
