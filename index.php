<?php
session_start();

require_once('Include.php');

// secure variables
$GET = [];
foreach($_GET as $K=>$V) {
	$GET[$K] = (String) $V;
}
$POST = [];
foreach($_POST as $K=>$V) {
	$POST[$K] = (String) $V;
}

$data = crossroad($GET, $POST, $FILES);

// HTML
echo('<!DOCTYPE html>');

// HEAD
$head = html_head($GLOBALS['__ROOT_URL__']);
echo($head);
takeAction($data);

?>
