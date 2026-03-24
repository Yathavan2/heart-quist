<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// --- Database connection ---
$servername = "localhost";
$username = "root";       // default WAMP user
$password = "";           // default WAMP has no password
$dbname = "heartquest_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed."]));
}

// --- Handle POST: Save new score ---
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $name = $conn->real_escape_string($data["name"]);
    $score = (int)$data["score"];
    $difficulty = $conn->real_escape_string($data["difficulty"]);

    $sql = "INSERT INTO leaderboard (name, score, difficulty) VALUES ('$name', '$score', '$difficulty')";
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Score saved"]);
    } else {
        echo json_encode(["error" => "Failed to save score"]);
    }
}

// --- Handle GET: Fetch scores by difficulty ---
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $difficulty = isset($_GET["difficulty"]) ? $conn->real_escape_string($_GET["difficulty"]) : "Easy";
    $sql = "SELECT * FROM leaderboard WHERE difficulty='$difficulty' ORDER BY score DESC LIMIT 20";
    $result = $conn->query($sql);

    $scores = [];
    while ($row = $result->fetch_assoc()) {
        $scores[] = $row;
    }

    echo json_encode($scores);
}

$conn->close();
?>
