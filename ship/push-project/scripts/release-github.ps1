<#
.SYNOPSIS
  GitHub-only 一键发版：打 annotated tag → 推 master → 推 tag → 建 Release → 加 topics。
  只走 push-project 技能的「只发 GitHub」章节，**不做 npm publish**。

.DESCRIPTION
  为什么单独一份：push-project 技能要求第 0 步先确认发布目标；本脚本固化的就是
  「只发 GitHub」这一条路径，避免把 npm 动作混进 GitHub 发版。

  默认行为（按顺序，任一步失败即停止）：
    1. 检查工作树 clean（有未提交改动时拒绝，除非 -Force）
    2. 读版本号（-Version 优先，否则取 package.json 的 version）
    3. 拒绝重复 tag（本地或远程已存在则退出）
    4. 若仓库内有技能库校验器（_shared/validate-skills.cjs），跑三级扫描，任一失败即停止
    5. 交互确认（-Force 跳过）
    6. git tag -a v<版本> → git push origin <分支> → git push origin v<版本>
    7. gh release create（notes 取自 CHANGELOG 对应版本段，取不到则 --generate-notes）
    8. gh repo edit --add-topic（-Topics 非空时）

.EXAMPLE
  pwsh -File scripts\release-github.ps1 -Topics dsh-plugin
  pwsh -File scripts\release-github.ps1 -Version 1.12.0 -Force
#>
[CmdletBinding()]
param(
    [string]$RepoRoot = (Get-Location).Path,
    [string]$Version,
    [string]$Message,
    [string[]]$Topics = @(),
    [switch]$SkipChecks,
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Info { param([string]$Text) Write-Host "==> $Text" -ForegroundColor Cyan }
function Fail { param([string]$Text) Write-Host "ERROR: $Text" -ForegroundColor Red; exit 1 }

$root = (Resolve-Path $RepoRoot).Path
if (-not (Test-Path (Join-Path $root '.git'))) { Fail "$root 不是 git 仓库" }
Set-Location $root

# ---- 1. 工作树 ----
Info '检查工作树'
$dirty = git status --porcelain
if ($dirty -and -not $Force) {
    Write-Host $dirty
    Fail '工作树有未提交改动。先提交，或加 -Force 明确接受把未提交改动排除在本次发版之外。'
}
if ($dirty) { Write-Host '（-Force：忽略未提交改动）' -ForegroundColor Yellow }

# ---- 2. 版本号 ----
if (-not $Version) {
    $pkg = Join-Path $root 'package.json'
    if (-not (Test-Path $pkg)) { Fail '没给 -Version，且仓库内没有 package.json' }
    $Version = (Get-Content $pkg -Raw | ConvertFrom-Json).version
}
if ($Version -notmatch '^\d+\.\d+\.\d+$') { Fail "版本号格式不对：$Version（期望 X.Y.Z）" }
$tag = "v$Version"
Info "目标版本 $tag"

# ---- 3. 重复 tag ----
$branch = (git rev-parse --abbrev-ref HEAD).Trim()
$localTag = (git tag --list $tag)
if ($localTag) { Fail "本地已有 tag $tag；先删（git tag -d $tag）或换版本号" }
$remoteTag = git ls-remote --tags origin "refs/tags/$tag" 2>$null
if ($remoteTag) { Fail "远程已有 tag $tag；换版本号，或先删远程 tag" }

# ---- 4. 可选：技能库三级扫描 ----
if (-not $SkipChecks) {
    $gate = Join-Path $root '_shared/validate-skills.cjs'
    if (Test-Path $gate) {
        Info '跑技能库三级扫描'
        $checks = @(
            @{ name = '硬门禁';   cmd = 'node'; args = @($gate) },
            @{ name = '宽口径';   cmd = 'node'; args = @((Join-Path $root 'skill-audit/scripts/audit-library.cjs')) },
            @{ name = '单技能体检'; cmd = 'node'; args = @((Join-Path $root 'skill-audit/scripts/audit-skill.cjs')) }
        )
        foreach ($c in $checks) {
            if (-not (Test-Path $c.args[0])) { Write-Host "  跳过 $($c.name)（脚本不存在）" -ForegroundColor Yellow; continue }
            & $c.cmd @($c.args) | Out-Null
            if ($LASTEXITCODE -ne 0) { Fail "$($c.name) 未通过（退出码 $LASTEXITCODE），发版已中止" }
            Write-Host "  $($c.name) 通过"
        }
    } else {
        Write-Host '  跳过技能库扫描（本仓库没有 _shared/validate-skills.cjs）' -ForegroundColor Yellow
    }
}

# ---- 5. 确认 ----
$ownerRepo = (git config --get remote.origin.url) -replace '.*github\.com[:/]', '' -replace '\.git$', ''
if (-not $ownerRepo) { Fail '读不到 origin 远程地址' }
Info "将执行：tag $tag → push $branch → push $tag → gh release create → topics[$($Topics -join ', ')]  （repo: $ownerRepo）"
if (-not $Force) {
    $answer = Read-Host '确认继续？(y/N)'
    if ($answer -notmatch '^(y|Y|yes|YES)$') { Write-Host '已取消'; exit 0 }
}

# ---- 6. tag 与推送 ----
if (-not $Message) { $Message = "$tag 发布" }
Info "打 annotated tag $tag"
git tag -a $tag -m $Message
if ($LASTEXITCODE -ne 0) { Fail 'git tag 失败' }

Info "推送 $branch"
git push origin $branch
if ($LASTEXITCODE -ne 0) { Fail "git push origin $branch 失败（国内网络可先设 `$env:HTTPS_PROXY）" }

Info "推送 tag $tag"
git push origin $tag
if ($LASTEXITCODE -ne 0) { Fail "git push origin $tag 失败" }

# ---- 7. Release ----
$notes = $null
$changelog = Join-Path $root 'CHANGELOG.md'
if (Test-Path $changelog) {
    $text = Get-Content $changelog -Raw
    $pattern = "(?ms)^##\s*\[$([regex]::Escape($Version))\][^\r\n]*\r?\n(.*?)(?=^##\s*\[|\z)"
    $m = [regex]::Match($text, $pattern)
    if ($m.Success) { $notes = $m.Groups[1].Value.Trim() }
}
Info '创建 GitHub Release'
if ($notes) {
    gh release create $tag --repo $ownerRepo --title "v$Version" --notes $notes
} else {
    gh release create $tag --repo $ownerRepo --title "v$Version" --generate-notes
}
if ($LASTEXITCODE -ne 0) { Fail 'gh release create 失败（国内网络可先设 $env:HTTPS_PROXY）' }

# ---- 8. topics ----
if ($Topics.Count -gt 0) {
    Info "添加 topics: $($Topics -join ', ')"
    $topicArgs = @()
    foreach ($t in $Topics) { $topicArgs += '--add-topic'; $topicArgs += $t }
    gh repo edit $ownerRepo @topicArgs
    if ($LASTEXITCODE -ne 0) { Write-Host 'gh repo edit 失败（Release 已建，可稍后手动补 topics）' -ForegroundColor Yellow }
}

Write-Host ''
Write-Host "发布完成：$tag" -ForegroundColor Green
Write-Host "  Release : https://github.com/$ownerRepo/releases/tag/$tag"
Write-Host "  Tag     : https://github.com/$ownerRepo/releases/tag/$tag (git tag $tag)"
Write-Host '  npm     : 本次未选择（本脚本不做 npm publish）'
