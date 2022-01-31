<?php
$diminuto_api_url = "http://localhost/api/diminuto";

function get_diminuto_url($url) {
    global $diminuto_api_url;
    $payload = json_encode(array("longUrl" => $url));
    $ch=curl_init($diminuto_api_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
    curl_setopt($ch, CURLOPT_HTTPHEADER,array('Content-Type:application/json'));

    $result = curl_exec($ch);
    curl_close($ch);
    $decoded = json_decode($result, true);
    return $decoded["shortUrl"];
}

$short = get_diminuto_url("https://www.google.com");
print($short);
