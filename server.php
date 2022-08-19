<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header("Access-Control-Allow-Headers: X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    print_r(parse_url($_SERVER['REQUEST_URI'], PHP_URL_SCHEME));
    $path =  parse_url($_SERVER['REQUEST_URI'])['path'];
    if ($path == '/api/hit') {
        $script_start = microtime(true);
        if (isset($_GET['r']) && isset($_GET['x']) && isset($_GET['y'])) {
            header('Content-Type: text/html');
            $xValue = floatval($_GET['x']);
            $yValue = floatval($_GET['y']);
            $rValue = floatval($_GET['r']);
            $hit = hit($xValue, $yValue, $rValue);
            $hitted = $hit ? 'hitted' : 'miss';
            // echo ("x: " . $xValue . " y: " . $yValue . " r: " . $rValue . " hit: " . $hitted);
            $currentTime = date_format(new DateTime(),microtime(true));
            $currentTime = gmDate("H:i:s",time() + 3600*(3+date("I")));
                $execution_time = ceil((microtime(true) - $script_start) * 100000000) /100;
                echo "
                <tr style='text-align: center;'>
                    <td>$xValue</td>
                    <td>$yValue</td>
                    <td>$rValue</td>
                    <td>$hitted</td>
                    <td>$currentTime</td>
                    <td>$execution_time ms</td>
                </tr>";
        } else {
            http_response_code(400);
            echo 'Bad request';
            exit(400);
        }
        // echo print_r(parse_url($_SERVER['REQUEST_URI']));
    }
    // if (explode("?", $_SERVER['REQUEST_URI'])[0] == '/api/xui') {
    //     header('Content-Type: text/html');
    //     if (isset($_GET['q'])) {
    //         $params = $_GET['q'];
    //         echo "<h1>xui in xui <br/> <span style='color: red'>$params</span>  </h1>";
    //     } else {
    //         echo "<h1>xui in xui</h1>";
    //     }
    // }
    // if ($_SERVER['REQUEST_URI'] == '/api/clear') {
    //     echo '<h1>Clear</h1>';
    // }
}

function hit($x, $y, $r)
{
    if (
        $x <= 0 &&
        $y <= 0 &&
        ($y >= - ($x + $r) / 2)
    ) {
        return true;
    } elseif (
        $x >= 0 &&
        $y <= 0 &&
        $x <= $r &&
        $y >= -$r / 2
    ) {
        return true;
    } elseif (
        $x <= 0 &&
        $y >= 0 &&
        ($x ** 2 + $y ** 2) <= ($r / 2) ** 2
    ) {
        return true;
    } else return false;
}
