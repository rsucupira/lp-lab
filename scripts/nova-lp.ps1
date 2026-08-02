param(
  [Parameter(Mandatory=$true)][string]$Slug,
  [Parameter(Mandatory=$true)][string]$Nome,
  [Parameter(Mandatory=$true)][string]$Servico,
  [string]$WhatsApp = "5531999999999"
)

$ErrorActionPreference = "Stop"

if ($Slug -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') {
  throw "Use um slug com letras minúsculas, números e hífens. Ex.: ana-nutricao"
}

$LabRoot = Split-Path -Parent $PSScriptRoot
$Template = Join-Path $LabRoot "templates\lp-servicos"
$Destination = Join-Path (Split-Path -Parent $LabRoot) "lp-$Slug"

if (Test-Path $Destination) {
  throw "A pasta já existe: $Destination"
}

Copy-Item $Template $Destination -Recurse

$Replacements = @{
  '{{NOME}}' = $Nome
  '{{SERVICO}}' = $Servico
  '{{WHATSAPP}}' = $WhatsApp
  '{{TITULO}}' = "$Servico com atendimento direto e claro"
  '{{SUBTITULO}}' = "Explique sua necessidade e descubra a melhor forma de avançar."
  '{{DESCRICAO}}' = "$Servico oferecido por $Nome."
  '{{MENSAGEM_WHATSAPP}}' = "Olá! Gostaria de saber mais sobre o serviço."
  '{{CIDADE}}' = "Atendimento online"
  '{{BENEFICIO_1}}' = "Atendimento próximo"
  '{{TEXTO_BENEFICIO_1}}' = "Conversa direta para entender a necessidade antes de propor o caminho."
  '{{BENEFICIO_2}}' = "Solução objetiva"
  '{{TEXTO_BENEFICIO_2}}' = "Informações organizadas para facilitar a decisão e o próximo passo."
  '{{BENEFICIO_3}}' = "Contato simples"
  '{{TEXTO_BENEFICIO_3}}' = "A pessoa interessada entra em contato sem sair da página."
  '{{CTA_TITULO}}' = "Vamos conversar sobre sua necessidade?"
  '{{CTA_TEXTO}}' = "Envie uma mensagem e explique brevemente o que você procura."
}

Get-ChildItem $Destination -Recurse -File | Where-Object { $_.Extension -in '.html','.css','.js','.md' } | ForEach-Object {
  $Content = Get-Content $_.FullName -Raw -Encoding UTF8
  foreach ($Key in $Replacements.Keys) {
    $Content = $Content.Replace($Key, $Replacements[$Key])
  }
  Set-Content $_.FullName $Content -Encoding UTF8
}

Write-Host "Projeto criado em: $Destination" -ForegroundColor Green
Write-Host "Próximo passo: crie o repositório lp-$Slug e envie estes arquivos." -ForegroundColor Cyan
