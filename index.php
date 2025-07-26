<?php

// Carrega os dados de login a partir de uma URL remota
$logins_url = 'https://rede-storagecloud.github.io/StorageCloud/index.json';
$json_data = @file_get_contents($logins_url);

if (!$json_data) {
    http_response_code(500);
    die("Erro ao acessar o JSON remoto.");
}

$logins = json_decode($json_data, true);
if (!$logins) {
    http_response_code(500);
    die("Erro ao decodificar JSON.");
}

// Substitui host e senha por valores fixos
$hostFixo = 'ftpupload.net';
$senhaFixa = 'Senha123456@';
foreach ($logins as &$cfg) {
    $cfg['host'] = $hostFixo;
    $cfg['pass'] = $senhaFixa;
}
unset($cfg);

// Função para verificar espaço disponível no FTP
function espacoDisponivel($conn) {
    $resposta = @ftp_raw($conn, "STAT /");
    if (!$resposta) return false;

    foreach ($resposta as $linha) {
        if (preg_match('/(\d+)\s+Kbytes\s+free/', $linha, $m)) {
            return $m[1] * 1024;
        }
    }
    return false;
}

// Função para localizar servidor que tem o arquivo
function localizarServidorComArquivo($relPath, $logins) {
    foreach ($logins as $cfg) {
        $c = @ftp_connect($cfg['host']);
        if (!$c) continue;

        ftp_set_option($c, FTP_TIMEOUT_SEC, 15);

        if (!@ftp_login($c, $cfg['user'], $cfg['pass'])) {
            @ftp_close($c);
            continue;
        }
        ftp_pasv($c, true);

        $raizDetectada = false;
        foreach (['public_html','www','htdocs'] as $d) {
            if (@ftp_chdir($c, $d)) {
                $raizDetectada = true;
                break;
            }
        }

        if (!$raizDetectada) {
            ftp_close($c);
            continue;
        }

        $pastas = explode('/', $relPath);
        $arquivo = array_pop($pastas);
        $existe = true;
        foreach ($pastas as $pasta) {
            if (!@ftp_chdir($c, $pasta)) {
                $existe = false;
                break;
            }
        }

        if ($existe && @ftp_size($c, $arquivo) > -1) {
            ftp_close($c);
            return $cfg;
        }

        ftp_close($c);
    }
    return false;
}

// Sanitiza o caminho
function sanitizaCaminho($path) {
    return preg_replace('/[^\w\-\/\.]/', '', trim($path, '/\\'));
}

// ================== ENVIO DE ARQUIVO ==================
if (isset($_FILES['file']) && isset($_POST['punch'])) {
    $arquivo_temp = $_FILES['file']['tmp_name'];
    $punch = sanitizaCaminho($_POST['punch']);
    $relPath = str_replace('\\', '/', $punch);
    $tamanhoArquivo = filesize($arquivo_temp);

    $destino = localizarServidorComArquivo($relPath, $logins);
    if (!$destino) {
        foreach ($logins as $cfg) {
            $c = @ftp_connect($cfg['host']);
            if (!$c) continue;

            ftp_set_option($c, FTP_TIMEOUT_SEC, 15);

            if (!@ftp_login($c, $cfg['user'], $cfg['pass'])) {
                @ftp_close($c);
                continue;
            }
            ftp_pasv($c, true);

            $raizDetectada = false;
            foreach (['public_html','www','htdocs'] as $d) {
                if (@ftp_chdir($c, $d)) {
                    $raizDetectada = true;
                    break;
                }
            }

            if (!$raizDetectada) {
                ftp_close($c);
                continue;
            }

            $esp = espacoDisponivel($c);
            if ($esp !== false && $esp < $tamanhoArquivo) {
                ftp_close($c);
                continue;
            }

            ftp_close($c);
            $destino = $cfg;
            break;
        }
    }

    if (!$destino) {
        http_response_code(507);
        die("Erro: nenhum servidor disponível com espaço suficiente.");
    }

    // Conecta e envia
    $c = @ftp_connect($destino['host']);
    if (!$c) {
        http_response_code(500);
        die("Falha na conexão FTP.");
    }

    ftp_set_option($c, FTP_TIMEOUT_SEC, 15);

    if (!@ftp_login($c, $destino['user'], $destino['pass'])) {
        @ftp_close($c);
        http_response_code(500);
        die("Falha ao conectar no servidor de destino.");
    }
    ftp_pasv($c, true);

    $raizDetectada = false;
    foreach (['public_html','www','htdocs'] as $d) {
        if (@ftp_chdir($c, $d)) {
            $raizDetectada = true;
            break;
        }
    }
    if (!$raizDetectada) {
        ftp_close($c);
        http_response_code(500);
        die("Não foi possível localizar a raiz do FTP.");
    }

    $pastas = explode('/', $relPath);
    $arquivoFinal = array_pop($pastas);
    foreach ($pastas as $pasta) {
        if (!@ftp_chdir($c, $pasta)) {
            ftp_mkdir($c, $pasta);
            ftp_chdir($c, $pasta);
        }
    }

    if (ftp_put($c, $arquivoFinal, $arquivo_temp, FTP_BINARY)) {
        $baseUrl = 'https://' . rtrim($destino['domain'], '/');
        $urlFinal = $baseUrl . '/' . $relPath;

        header('Content-Type: text/plain');
        echo "Arquivo enviado com sucesso para:\n$urlFinal\n";

        $host = $_SERVER['HTTP_HOST'];
        $url_php = "https://{$host}/" . $relPath;
        echo "URL pública de download:\n$url_php\n";
    } else {
        http_response_code(500);
        echo "Falha ao enviar o arquivo via FTP.\n";
    }
    ftp_close($c);
    exit;
}

// ================== DOWNLOAD DO ARQUIVO ==================
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$relPath = sanitizaCaminho($request_uri);

if (!$relPath) {
    http_response_code(400);
    die("URL inválida. Caminho não especificado.");
}

$destino = localizarServidorComArquivo($relPath, $logins);
if ($destino) {

    // Conecta no FTP
    $c = @ftp_connect($destino['host']);
    if (!$c) {
        http_response_code(500);
        die("Falha na conexão FTP.");
    }

    ftp_set_option($c, FTP_TIMEOUT_SEC, 15);

    if (!@ftp_login($c, $destino['user'], $destino['pass'])) {
        ftp_close($c);
        http_response_code(500);
        die("Falha ao logar no FTP.");
    }
    ftp_pasv($c, true);

    // Detecta a raiz
    $raizDetectada = false;
    foreach (['public_html','www','htdocs'] as $d) {
        if (@ftp_chdir($c, $d)) {
            $raizDetectada = true;
            break;
        }
    }
    if (!$raizDetectada) {
        ftp_close($c);
        http_response_code(500);
        die("Não foi possível localizar a raiz do FTP.");
    }

    // Navega até o caminho do arquivo
    $pastas = explode('/', $relPath);
    $arquivo = array_pop($pastas);

    foreach ($pastas as $pasta) {
        if (!@ftp_chdir($c, $pasta)) {
            ftp_close($c);
            http_response_code(404);
            die("Pasta não encontrada no FTP.");
        }
    }

    // Cria arquivo temporário para download
    $arquivo_temp = tempnam(sys_get_temp_dir(), 'ftp_');
    if (@ftp_get($c, $arquivo_temp, $arquivo, FTP_BINARY)) {
        ftp_close($c);

        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($arquivo) . '"');
        header('Content-Length: ' . filesize($arquivo_temp));
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Expires: 0');

        readfile($arquivo_temp);
        unlink($arquivo_temp);
        exit;
    } else {
        ftp_close($c);
        http_response_code(500);
        die("Erro ao obter o conteúdo do arquivo via FTP.");
    }
}

http_response_code(404);
echo "Arquivo não encontrado em nenhum servidor.";

?>