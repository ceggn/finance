<?php


class Symbol
{

    private $connection;
    private $table_name = "symbols";

    public $id;
    public $symbol;
    public $name;
    public $type;
    public $date;
    public $shares;
    public $price;
    public $cashValue;
    public $commission;
    public $notes;
    public $exSuffix;    ////    Code By Faisal

    // constructor with $db as database connection
    public function __construct()
    {
        $db = new Database();
        $this->connection = $db->getConnection();
    }

    public function get()
    {
        $query = "SELECT * FROM $this->table_name";
        $stmt = $this->connection->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_CLASS, Symbol::class);
    }

    public function getSymbolLabels()
    {
        $query = "SELECT symbol FROM $this->table_name";
        $stmt = $this->connection->prepare($query);
        $stmt->execute();
        return array_column($stmt->fetchAll(), 'symbol');
    }

    public function create(Symbol $symbol)
    {

        try {
            $statement = $this->connection->prepare('INSERT INTO ' . $this->table_name . '(symbol, name, type, date, shares, price, cashValue, commission, notes, exSuffix) VALUES (:symbol,:name, :type, :date, :shares, :price, :cashValue, :commission, :notes, :exSuffix)');

            $statement->execute([
                'symbol' => $symbol->symbol,
                "name" => $symbol->name,
                "type" => $symbol->type,
                "date" => $symbol->date,
                "shares" => $symbol->shares,
                "price" => $symbol->price,
                "cashValue" => null,
                "commission" => $symbol->commission,
                "notes" => "",
                "exSuffix" => $symbol->exSuffix,    ////    Code By Faisal
            ]);

        } catch (PDOException $e) {
            echo $e->getMessage();
        }

    }

    public function delete($ids){
        try {
            $query = 'DELETE FROM ' . $this->table_name . ' WHERE `id` IN ('.implode(',',$ids).')';
            echo $query;
            $statement = $this->connection->prepare($query);
            $statement->execute();
        } catch (PDOException $e){
            echo $e->getMessage();
        }
    }
}