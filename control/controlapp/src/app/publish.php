<?php
$topicName = filter_input(INPUT_POST, "topic");
$history = filter_input(INPUT_POST, "value");
// Create a stream
$url = 'http://192.168.0.4:8183/publish';
$timestamp = (new DataTime())->format('c');
$json_data = json_encode(
    array(
        'topic' => $topic, 
        'reason' => array('message' => 'Request by browser', 'timestamp' => $timestamp),
        'value' => $value));

$options = array(
    'http' => array(
        'method'  => 'PUT',
        'header'  =>
            "Content-type: application/json\r\n" .
            "Accept: application/json\r\n".
            "Connection: close\r\n".
            "Content-length: " . strlen($json_data) . "\r\n",
        'content' => $json_data
    )
);


$context = stream_context_create($options);

$response = file_get_contents($url, false, $context);
echo $response;
?>