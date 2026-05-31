<?php
/**
 * contact.php — Hostinger PHP mailer
 * Change form action in index.html to "contact.php" to use this instead of Formspree.
 * Set $to to your real email address.
 */
$to       = 'koshtiatharva2003@gmail.com'; // ← your email
$from     = 'noreply@yourdomain.com';
$siteName = 'Atharva Koshti Portfolio';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

function clean(string $v): string {
  return htmlspecialchars(strip_tags(trim($v)), ENT_QUOTES, 'UTF-8');
}

$name    = clean($_POST['name']    ?? '');
$email   = clean($_POST['email']   ?? '');
$subject = clean($_POST['subject'] ?? 'New portfolio contact');
$message = clean($_POST['message'] ?? '');

if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  header('Content-Type: application/json');
  echo json_encode(['error' => 'Invalid form data.']);
  exit;
}

$headers  = "From: {$from}\r\nReply-To: {$email}\r\nX-Mailer: PHP/" . phpversion();
$body     = "Name: {$name}\nEmail: {$email}\nSubject: {$subject}\n\n{$message}";
$emailSub = "[{$siteName}] {$subject}";

if (mail($to, $emailSub, $body, $headers)) {
  header('Content-Type: application/json'); echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  header('Content-Type: application/json'); echo json_encode(['error' => 'Mail failed.']);
}
