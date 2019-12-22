<?php
$topicName = filter_input(INPUT_POST, "topic", FILTER_SANITIZE_URL);
$history = filter_input(INPUT_POST, "history", FILTER_VALIDATE_BOOLEAN);
// Create a stream
$options = [
    "http" => [
        "method" => "GET",
        "header" => "history: ". $history
    ]
];

$context = stream_context_create($options);
$linkName = "http://192.168.0.4:8183/sensor" . $topicName;
$response = file_get_contents($linkName, false, $context);
echo $response;
?>
