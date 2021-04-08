<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header("Access-Control-Allow-Headers: X-Requested-With");

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

include_once './Configs/Database.php';
include_once './Objects/Symbol.php';


$route = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

$route = substr($route, 1);
$route = explode("?", $route);
$route = explode("/", $route[0]);
$route = array_diff($route, array('API_Restful', 'api'));
$route = array_values($route);

switch ($route[0]) {
    case "symbols";
    case "finance-api";
        if ($method == 'GET') {
            $symbols = new Symbol();
            $only_symbols = $symbols->getSymbolLabels();
            $transactions = $symbols->get();
            echo json_encode(['symbols' => $only_symbols, 'transactions'=> $transactions]);
        } elseif ($method == 'POST') {

            $symbol = new Symbol();

            if ($_POST["symbol"] != null) {
                $symbol->symbol = $_POST['symbol'];
                $symbol->name = $_POST['name'];
                $symbol->type = $_POST['type'];
                $symbol->date = $_POST['date'];
                $symbol->shares = $_POST['shares'];
                $symbol->price = $_POST['price'];
                $symbol->cashValue = $_POST['cashValue'];
                $symbol->commission = $_POST['commission'];
                $symbol->notes = $_POST['notes'];
                $symbol->exSuffix = $_POST['exSuffix']; ////    Code By Faisal
                $symbol->create($symbol);
            }
        } elseif ($method == 'DELETE'){
            $data = json_decode(file_get_contents('php://input'), true);
            $symbol = new Symbol();
            $symbol->delete($data['ids']);
        }
}