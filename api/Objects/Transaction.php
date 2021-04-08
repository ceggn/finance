<?php


class Transaction
{
    private $conn;
    private $table_name = "transactions";

    public $id;
    public $symbol;
    public $name;
    public $type;
    public $data;
    public $shares;
    public $price;
    public $cashValue;
    public $commission;
    public $notes;

    // constructor with $db as database connection
    public function __construct()
    {
        $db = new Database();
        $this->conn = $db->getConnection();
    }
}