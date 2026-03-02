<?php
// Require correct API key
if (!isset($_GET['key']) || $_GET['key'] !== 'ag91jagg1') {
    http_response_code(403);
    exit; // No output if key is missing or wrong
}

// Optionally set content type
header('Content-Type: text/html; charset=UTF-8');
?>

<!-- URL:https://d1srn6k5rwdbiy.cloudfront.net/ -->
