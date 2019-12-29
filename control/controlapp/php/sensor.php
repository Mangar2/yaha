<?php

$topic ='';
$history = 'false';
$levelAmount = 1;

$postdata = file_get_contents("php://input");

if (empty($postdata)) {
    $request = json_decode($postdata);
    if (!empty($request)) {
        if (property_exists($request, "topic")) {
            $topic = filter_var($request->topic);
        }
        if (property_exists($request, "history")) {
            $history = filter_var($request->history, FILTER_VALIDATE_BOOLEAN, [
                'options' => [
                    'default' => false
                ]
            ]);
            
        }
        if (property_exists($request, "levelAmount")) {
            $levelAmount = filter_var($request->levelAmount, FILTER_VALIDATE_INT, [
                'options' => [
                    'default' => 1,
                    'min-range' => 1,
                    'max-range' => 10
                ]
            ]);
        }
    }
}

if (!empty($topic) && $topic[0] != '/') {
    $topic = '/' . $topic;
}
$topic = str_replace(' ', '%20', $topic);

// Create a stream
$opts = [
    "http" => [
        "method" => "GET",
        "header" => "history: " . $history . "\r\n".
            "levelAmount: " . $levelAmount . "\r\n"
    ]
];

$context = stream_context_create($opts);
$linkName = "http://192.168.0.4:8183/sensor" . $topic;
$response = file_get_contents($linkName, false, $context);
echo $response;
?>
