<?php
/**
 * 다솜인터내셔널 홈페이지 문의 폼 - 메일 발송 스크립트
 * ------------------------------------------------------
 * contact.html / contact_02.html 의 #contact-form 이 이 파일로 제출됩니다.
 * 카페24 웹호스팅처럼 PHP mail() 이 동작하는 환경에서 별도 유료 폼
 * 서비스(Web3Forms Pro 등) 없이 파일 첨부까지 무료로 처리하기 위한 스크립트입니다.
 *
 * 반드시 확인/수정할 항목:
 *   1. 아래 $to 를 실제로 문의를 받으실 이메일 주소로 바꿔주세요.
 *   2. 이 파일을 index.html 과 같은 위치(다솜홈페이지 최상위 폴더)에 업로드하세요.
 *   3. 카페24 호스팅관리자 > PHP 설정에서 upload_max_filesize / post_max_size 가
 *      5MB 이상인지 확인하세요 (기본값이 낮으면 첨부파일이 잘릴 수 있습니다).
 */

// ─── 설정 ────────────────────────────────────────────────────────────
$to        = 'contact@dasom-international.com'; // TODO: 실제 수신 이메일 주소로 변경
$siteName  = 'DASOM INTERNATIONAL';
$maxBytes  = 5 * 1024 * 1024; // 5MB
$allowExt  = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip'];

header('Content-Type: application/json; charset=utf-8');

function respond($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, '허용되지 않은 요청입니다.');
}

// 스팸봇 방지용 허니팟 — 사람 눈에는 안 보이는 체크박스가 채워져 있으면
// 봇에게는 성공한 것처럼 응답만 하고 실제 메일은 보내지 않습니다.
if (!empty($_POST['botcheck'])) {
    respond(true, 'OK');
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');
$subject = trim($_POST['subject'] ?? ($siteName . ' 웹사이트 문의'));

if ($name === '' || $email === '' || $message === '') {
    respond(false, '이름, 이메일, 메세지를 모두 입력해주세요.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, '이메일 주소 형식이 올바르지 않습니다.');
}

// ─── 첨부파일 검증 ────────────────────────────────────────────────────
$attachment = null;
if (!empty($_FILES['attachment']) && $_FILES['attachment']['error'] !== UPLOAD_ERR_NO_FILE) {
    $file = $_FILES['attachment'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        respond(false, '파일 업로드 중 오류가 발생했습니다.');
    }
    if ($file['size'] > $maxBytes) {
        respond(false, '첨부파일은 5MB 이하만 가능합니다.');
    }
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowExt, true)) {
        respond(false, '허용되지 않는 파일 형식입니다.');
    }
    $attachment = $file;
}

// ─── 메일 조립 (첨부파일 포함 멀티파트 MIME) ──────────────────────────
$boundary = md5((string) microtime());

$host       = $_SERVER['HTTP_HOST'] ?? 'dasomshop.net';
$hostDomain = preg_replace('/^www\./', '', $host);
// 카페24 등 대부분의 호스팅은 발신 주소 도메인이 호스팅 도메인과 일치해야
// 스팸으로 분류되지 않습니다. 실제 도메인에 맞는 발신 주소를 쓰는 것이 안전합니다.
$fromEmail = 'noreply@' . $hostDomain;

$headers  = "From: {$siteName} <{$fromEmail}>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";

$body  = "--{$boundary}\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= "이름: {$name}\n이메일: {$email}\n\n메세지:\n{$message}\n\r\n";

if ($attachment) {
    $fileName    = str_replace(['"', "\r", "\n"], '', $attachment['name']);
    $fileContent = chunk_split(base64_encode(file_get_contents($attachment['tmp_name'])));
    $fileType    = $attachment['type'] ?: 'application/octet-stream';

    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: {$fileType}; name=\"{$fileName}\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n";
    $body .= "Content-Disposition: attachment; filename=\"{$fileName}\"\r\n\r\n";
    $body .= $fileContent . "\r\n";
}
$body .= "--{$boundary}--";

$mailSubject = '=?UTF-8?B?' . base64_encode("[{$siteName}] {$subject}") . '?=';

$sent = @mail($to, $mailSubject, $body, $headers);

if ($sent) {
    respond(true, '문의가 정상적으로 전송되었습니다.');
}
respond(false, '메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
