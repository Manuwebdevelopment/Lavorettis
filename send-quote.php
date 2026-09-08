<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require __DIR__ . '/vendor/autoload.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');


/*
|--------------------------------------------------------------------------
| JSON RESPONSE HELPER
|--------------------------------------------------------------------------
*/

function respond(int $status, bool $success, string $message): void
{
    http_response_code($status);

    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| ONLY ALLOW POST REQUESTS
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, false, 'Method not allowed.');
}


/*
|--------------------------------------------------------------------------
| LIMIT TOTAL REQUEST SIZE
|--------------------------------------------------------------------------
*/

$contentLength = isset($_SERVER['CONTENT_LENGTH'])
    ? (int) $_SERVER['CONTENT_LENGTH']
    : 0;

if ($contentLength > 20 * 1024 * 1024) {
    respond(413, false, 'The uploaded files are too large.');
}


/*
|--------------------------------------------------------------------------
| READ FORM FIELDS
|--------------------------------------------------------------------------
*/

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$location = trim($_POST['location'] ?? '');
$message = trim($_POST['message'] ?? '');
$captcha = trim($_POST['captcha'] ?? '');
$website = trim($_POST['website'] ?? '');


/*
|--------------------------------------------------------------------------
| HONEYPOT ANTI-SPAM
|--------------------------------------------------------------------------
|
| Normal visitors never see this field.
| Basic spambots often fill it in.
|
*/

if ($website !== '') {
    respond(
        200,
        true,
        'Thank you! Your message has been received.'
    );
}


/*
|--------------------------------------------------------------------------
| REQUIRED FIELD VALIDATION
|--------------------------------------------------------------------------
*/

if (
    $name === '' ||
    $email === '' ||
    $phone === '' ||
    $location === '' ||
    $message === '' ||
    $captcha === ''
) {
    respond(
        422,
        false,
        'Please fill in all required fields.'
    );
}


/*
|--------------------------------------------------------------------------
| EMAIL VALIDATION
|--------------------------------------------------------------------------
*/

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(
        422,
        false,
        'Please enter a valid email address.'
    );
}


/*
|--------------------------------------------------------------------------
| CAPTCHA VALIDATION
|--------------------------------------------------------------------------
*/

if ($captcha !== '22') {
    respond(
        422,
        false,
        'Incorrect captcha answer.'
    );
}


/*
|--------------------------------------------------------------------------
| INPUT LENGTH LIMITS
|--------------------------------------------------------------------------
*/

if (
    strlen($name) > 100 ||
    strlen($email) > 254 ||
    strlen($phone) > 50 ||
    strlen($location) > 200 ||
    strlen($message) > 5000
) {
    respond(
        422,
        false,
        'One or more fields are too long.'
    );
}


/*
|--------------------------------------------------------------------------
| IMAGE UPLOAD SETTINGS
|--------------------------------------------------------------------------
*/

$maxFiles = 5;

$maxFileSize = 5 * 1024 * 1024;      // 5 MB per image
$maxTotalSize = 15 * 1024 * 1024;    // 15 MB total

$allowedMimeTypes = [
    'image/jpeg'          => 'jpg',
    'image/png'           => 'png',
    'image/webp'          => 'webp',
    'image/heic'          => 'heic',
    'image/heif'          => 'heif',
    'image/heic-sequence' => 'heic',
    'image/heif-sequence' => 'heif',
];

$attachments = [];


/*
|--------------------------------------------------------------------------
| VALIDATE UPLOADED IMAGES
|--------------------------------------------------------------------------
*/

if (isset($_FILES['propertyImages'])) {

    $files = $_FILES['propertyImages'];

    $names = is_array($files['name'])
        ? $files['name']
        : [$files['name']];

    $tmpNames = is_array($files['tmp_name'])
        ? $files['tmp_name']
        : [$files['tmp_name']];

    $errors = is_array($files['error'])
        ? $files['error']
        : [$files['error']];

    $sizes = is_array($files['size'])
        ? $files['size']
        : [$files['size']];


    /*
    | Count actual uploaded files
    */

    $fileCount = 0;

    foreach ($errors as $error) {

        if (is_array($error)) {
            respond(422, false, 'Invalid upload.');
        }

        if ((int) $error !== UPLOAD_ERR_NO_FILE) {
            $fileCount++;
        }
    }


    if ($fileCount > $maxFiles) {
        respond(
            422,
            false,
            'You can upload a maximum of 5 images.'
        );
    }


    /*
    | Inspect file contents
    */

    $finfo = new finfo(FILEINFO_MIME_TYPE);

    $totalSize = 0;


    foreach ($errors as $i => $error) {

        $error = (int) $error;

        if ($error === UPLOAD_ERR_NO_FILE) {
            continue;
        }


        if ($error !== UPLOAD_ERR_OK) {
            respond(
                422,
                false,
                'One of the images could not be uploaded.'
            );
        }


        $tmpName = $tmpNames[$i] ?? null;
        $size = (int) ($sizes[$i] ?? 0);
        $originalName = $names[$i] ?? 'image';


        if (!is_string($tmpName)) {
            respond(
                422,
                false,
                'Invalid uploaded file.'
            );
        }


        if (!is_uploaded_file($tmpName)) {
            respond(
                422,
                false,
                'Invalid uploaded file.'
            );
        }


        /*
        | Individual file size
        */

        if ($size <= 0 || $size > $maxFileSize) {
            respond(
                422,
                false,
                'Each image must be 5 MB or smaller.'
            );
        }


        /*
        | Combined attachment size
        */

        $totalSize += $size;

        if ($totalSize > $maxTotalSize) {
            respond(
                422,
                false,
                'The total size of all images must be 15 MB or less.'
            );
        }


        /*
        | Detect actual file type
        */

        $mimeType = $finfo->file($tmpName);

        if (
            !is_string($mimeType) ||
            !isset($allowedMimeTypes[$mimeType])
        ) {
            respond(
                422,
                false,
                'Only JPG, PNG, WebP, HEIC and HEIF images are accepted.'
            );
        }


        /*
        | Create safe attachment filename
        */

        $baseName = pathinfo(
            (string) $originalName,
            PATHINFO_FILENAME
        );

        $baseName = preg_replace(
            '/[^A-Za-z0-9._-]+/',
            '-',
            $baseName
        );

        if (!$baseName) {
            $baseName = 'image';
        }

        $safeName =
            substr($baseName, 0, 80)
            . '.'
            . $allowedMimeTypes[$mimeType];


        $attachments[] = [
            'tmp_name' => $tmpName,
            'name' => $safeName
        ];
    }
}


/*
|--------------------------------------------------------------------------
| LOAD PRIVATE SMTP PASSWORD
|--------------------------------------------------------------------------
|
| This file will live OUTSIDE public_html on Hostinger.
| It will NOT be stored in GitHub.
|
| We will create it once the customer gives us the Google App Password.
|
*/

$configPath = dirname(__DIR__)
    . '/lavorettis-mail-config.php';


if (!is_file($configPath)) {

    error_log(
        'Lavorettis: mail configuration file is missing.'
    );

    respond(
        503,
        false,
        'The quote service is temporarily unavailable.'
    );
}


$config = require $configPath;


if (
    !is_array($config) ||
    empty($config['smtp_password'])
) {

    error_log(
        'Lavorettis: SMTP configuration is invalid.'
    );

    respond(
        503,
        false,
        'The quote service is temporarily unavailable.'
    );
}


/*
|--------------------------------------------------------------------------
| SEND EMAIL THROUGH GMAIL SMTP
|--------------------------------------------------------------------------
*/

try {

    $mail = new PHPMailer(true);

    $mail->isSMTP();

    $mail->Host = 'smtp.gmail.com';

    $mail->SMTPAuth = true;

    $mail->Username = 'info@lavorettis.com';

    $mail->Password = $config['smtp_password'];

    $mail->SMTPSecure =
        PHPMailer::ENCRYPTION_STARTTLS;

    $mail->Port = 587;

    $mail->Timeout = 20;

    $mail->CharSet = 'UTF-8';


    /*
    | Sender
    */

    $mail->setFrom(
        'info@lavorettis.com',
        "Lavoretti's Website"
    );


    /*
    | Recipient
    */

    $mail->addAddress(
        'info@lavorettis.com'
    );


    /*
    | Reply button replies to customer
    */

    $mail->addReplyTo(
        $email,
        $name
    );


    /*
    | Subject
    */

    $safeSubjectName = preg_replace(
        '/[\r\n]+/',
        ' ',
        $name
    );

    $mail->Subject =
        'New Quote Request - ' . $safeSubjectName;


    /*
    | Email body
    */

    $submittedAt = new DateTimeImmutable(
        'now',
        new DateTimeZone('Australia/Sydney')
    );


    $mail->Body = implode("\n", [

        'NEW WEBSITE QUOTE REQUEST',

        '',

        'Name:',
        $name,

        '',

        'Email:',
        $email,

        '',

        'Phone:',
        $phone,

        '',

        'Property Location:',
        $location,

        '',

        'Message:',
        $message,

        '',

        'Submitted:',
        $submittedAt->format(
            'j F Y, g:i A T'
        )
    ]);


    /*
    | Attach photographs
    */

    foreach ($attachments as $attachment) {

        $mail->addAttachment(
            $attachment['tmp_name'],
            $attachment['name']
        );
    }


    /*
    | Send
    */

    $mail->send();


    respond(
        200,
        true,
        "Thank you! Your message has been received. We'll get back to you within 24 hours."
    );


} catch (Exception $e) {

    error_log(
        'Lavorettis PHPMailer error: '
        . $e->getMessage()
    );

    respond(
        500,
        false,
        'We could not send your request right now. Please try again or contact us directly.'
    );


} catch (Throwable $e) {

    error_log(
        'Lavorettis server error: '
        . $e->getMessage()
    );

    respond(
        500,
        false,
        'We could not send your request right now. Please try again or contact us directly.'
    );
}