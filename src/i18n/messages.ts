// User-facing message catalogs. `en` is the source of truth; `zh` is typed as
// `typeof en`, so the compiler forces every key to be translated (no missing
// strings can ship). Add a new language by adding another `typeof en` catalog
// to `catalogs` below — nothing else needs to change.
//
// `{name}`-style placeholders are filled by t() at call time.

export const en = {
  'common.notLoggedIn': 'Not logged in. Run `tokenmix login` first.',

  // login
  'login.keyMustStart': 'API key should start with sk-tm-',
  'login.verifying': 'Verifying API key against {baseUrl} ...',
  'login.verifyFailed': 'API key verification failed. Double-check at https://tokenmix.ai/dashboard/keys',
  'login.loggedInHint': 'Logged in. Try `tokenmix opencode` to launch your first agent.',
  'login.noKey': 'No API key provided.',
  'login.requesting': 'Requesting device authorization ...',
  'login.couldNotStart': 'Could not start device authorization: {msg}',
  'login.fallbackPaste': 'Falling back to manual paste. Get an API key at https://tokenmix.ai/dashboard/keys',
  'login.openLinkConfirm': 'Open the link below and confirm this code:',
  'login.link': 'Link:',
  'login.browserOpened': '(browser opened; if nothing happens, copy the link above)',
  'login.browserFailed': '(could not open browser; copy the link above into one)',
  'login.waiting': 'Waiting for authorization (expires in {expires}s, polling every {interval}s) ...',
  'login.stillWaiting': '... still waiting ({seconds}s remaining)',
  'login.loggedInAs': 'Logged in as {email} (API key #{id})',
  'login.loggedInId': 'Logged in (API key #{id})',
  'login.tryFirstAgent': 'Try `tokenmix opencode` to launch your first agent.',
  'login.tryAgain': 'Try again?',

  // agent install / configure / launch
  'agent.notInstalled': '{name} is not installed.',
  'agent.notInstallable': '{name} is not installable from the CLI.',
  'agent.installPrompt': '{name} is not installed. Install now?',
  'agent.installing': 'Installing {name} ...',
  'agent.installed': '{name} installed.',
  'agent.installFailed': 'Could not install {name} automatically.',
  'agent.installFailHint1': 'This usually means npm cannot write to its global folder. Options:',
  'agent.installFailHint2': '  • Use a Node version manager (nvm / fnm / volta) — then global installs need no sudo, or',
  'agent.installFailHint3': '  • Install it yourself: {cmd}',
  'agent.installFailHint4': 'Then re-run this command — your TokenMix login is already saved.',
  'agent.configuring': 'Configuring {name} ...',
  'agent.wrote': 'Wrote {path}',
  'agent.configReady': '{name} configuration ready.',
  'agent.launching': 'Launching {name} ...',

  // logout
  'logout.done': 'Logged out. Credentials removed from this machine.',
  'logout.reverted': 'Reverted {name} config',

  // doctor
  'doctor.title': 'TokenMix CLI diagnostic',
  'doctor.credentials': 'Credentials:',
  'doctor.apiKeyLabel': 'API key:',
  'doctor.apiBaseLabel': 'API base:',
  'doctor.keyValid': 'API key is valid.',
  'doctor.keyInvalid': 'API key did NOT validate. Run `tokenmix login` again.',
  'doctor.notLoggedIn': 'Not logged in. Run `tokenmix login`.',
  'doctor.agentStatus': 'Agent install status:',
  'doctor.installed': 'installed',
  'doctor.notInstalled': 'not installed',

  // list
  'list.title': 'Supported agents:',
  'list.usage': 'Usage: tokenmix <agent> [args...]',
  'list.modeAutoNpm': 'auto (npm)',
  'list.modeAutoPip': 'semi (pip)',
  'list.modeManualVscode': 'config-only (VSCode)',
  'list.modeManual': 'manual',

  // models
  'models.none': 'No models match the filter.',
  'models.typeChat': 'Chat',
  'models.typeEmbedding': 'Embedding',
  'models.typeImage': 'Image',
  'models.typeAudio': 'Audio',
  'models.typeVideo': 'Video',
  'models.typeCompletion': 'Completion',
  'models.in': 'in',
  'models.out': 'out',

  // prompt
  'prompt.pasteKey': 'Paste your TokenMix API key (sk-tm-...)',

  // browser
  'balance.opening': 'Opening dashboard to view balance: {url}',
  'topup.opening': 'Opening top-up page: {url}',
  'browser.manual': 'Could not open a browser automatically. Open this URL manually:\n  {url}',

  // agent taglines (shown in `list`)
  'desc.opencode': 'sst/opencode — open source AI coding agent (TUI / Desktop / IDE)',
  'desc.claude': 'anthropics/claude-code — official Anthropic CLI coding agent',
  'desc.aider': 'Aider-AI/aider — paired-programming CLI (requires Python)',
  'desc.kilo': 'Kilo-Org/kilocode — VSCode extension (config-only)',

  // install hints
  'install.willInstallVia': 'Will install via: {cmd}',
  'aider.hintNeedPython': 'Aider requires Python 3. Install Python 3 from https://python.org/downloads, then come back and run `tokenmix aider` again.',
  'aider.hintNotInstalled': 'Aider is not installed. Run this in another terminal:\n    {cmd}\nThen come back and run `tokenmix aider` again — your TokenMix login is already saved, so it will pick up automatically.',

  // opencode configure notes
  'opencode.noteModel': 'Default model set to tokenmix/{model}',
  'opencode.noteSwitch': 'To switch models, run `tokenmix models` or use `/connect` inside OpenCode.',

  // claude configure notes
  'claude.noteModels': 'Available Claude models via tokenmix: claude-opus-4.7, claude-sonnet-4.6, claude-haiku-4.5',
  'claude.noteFullList': 'Run `tokenmix models --type chat` for the full list.',
  'claude.noteReplaced1': '⚠ Replaced your existing Anthropic settings in ~/.claude/settings.json.',
  'claude.noteReplaced2': "  `tokenmix logout` removes TokenMix's entries (your old key cannot be auto-restored).",
  'claude.cleanupNote': 'If you had your own ANTHROPIC_API_KEY here before, re-add it.',

  // aider configure notes
  'aider.noteUsing': 'Aider will use TokenMix via OpenAI-compatible endpoint.',
  'aider.noteModel': 'Default model: openai/{model} — override with --model.',

  // kilo configure notes (prose only; technical lines stay verbatim)
  'kilo.noteNoLauncher': 'Kilo Code is a VSCode extension and does not have a CLI launcher.',
  'kilo.noteConfigWith': 'Configure Kilo Code with the following:',
  'kilo.notePasteJson': 'Or paste this JSON snippet into Kilo Code settings (Settings → Providers → JSON):',
  'kilo.noteKeepPrivate': 'Keep this API key private — anyone with it can spend your TokenMix balance.',
  'kilo.hintMarketplace': 'Install "Kilo Code" from the VSCode marketplace, then paste the snippet below into its settings.',
  'kilo.hintNoVscode': 'VSCode not detected on PATH. Install VSCode, then add the Kilo Code extension, then use the snippet below.',

  // command / option descriptions (--help)
  'cmd.program': 'Zero-config CLI to use any open-source coding agent with TokenMix as the unified LLM backend.',
  'cmd.login': 'Log in to TokenMix (default: browser device authorization)',
  'cmd.loginKey': 'Paste an API key directly (skip browser flow, useful in CI)',
  'cmd.loginPaste': 'Force interactive paste prompt instead of browser flow',
  'cmd.loginUrl': 'Override API base URL (default: https://api.tokenmix.ai)',
  'cmd.logout': 'Remove stored credentials from this machine',
  'cmd.balance': 'Open the dashboard to view your balance',
  'cmd.topup': 'Open the browser to top up your account',
  'cmd.models': 'List available models with prices',
  'cmd.modelsType': 'Filter by type: chat | embedding | image | audio | video',
  'cmd.list': 'List supported coding agents',
  'cmd.doctor': 'Diagnose CLI configuration and agent installation',
  'cmd.agent': 'Configure and launch {name} via TokenMix',
}

export type MessageKey = keyof typeof en

export const zh: typeof en = {
  'common.notLoggedIn': '未登录，请先运行 `tokenmix login`。',

  // login
  'login.keyMustStart': 'API 密钥应以 sk-tm- 开头',
  'login.verifying': '正在通过 {baseUrl} 校验 API 密钥 ...',
  'login.verifyFailed': 'API 密钥校验失败。请到 https://tokenmix.ai/dashboard/keys 核对',
  'login.loggedInHint': '登录成功。试试 `tokenmix opencode` 启动你的第一个 agent。',
  'login.noKey': '未提供 API 密钥。',
  'login.requesting': '正在请求设备授权 ...',
  'login.couldNotStart': '无法发起设备授权：{msg}',
  'login.fallbackPaste': '改用手动粘贴。可在 https://tokenmix.ai/dashboard/keys 获取 API 密钥',
  'login.openLinkConfirm': '打开下方链接并确认此验证码：',
  'login.link': '链接：',
  'login.browserOpened': '（已打开浏览器；若无反应，请复制上面的链接）',
  'login.browserFailed': '（无法打开浏览器；请复制上面的链接到浏览器打开）',
  'login.waiting': '等待授权（{expires}s 后过期，每 {interval}s 轮询一次）...',
  'login.stillWaiting': '... 仍在等待（剩余 {seconds}s）',
  'login.loggedInAs': '已登录：{email}（API 密钥 #{id}）',
  'login.loggedInId': '登录成功（API 密钥 #{id}）',
  'login.tryFirstAgent': '试试 `tokenmix opencode` 启动你的第一个 agent。',
  'login.tryAgain': '重试？',

  // agent install / configure / launch
  'agent.notInstalled': '{name} 尚未安装。',
  'agent.notInstallable': '{name} 无法通过 CLI 安装。',
  'agent.installPrompt': '{name} 尚未安装。现在安装？',
  'agent.installing': '正在安装 {name} ...',
  'agent.installed': '{name} 安装完成。',
  'agent.installFailed': '无法自动安装 {name}。',
  'agent.installFailHint1': '这通常是 npm 无权写入全局目录。可选方案：',
  'agent.installFailHint2': '  • 使用 Node 版本管理器（nvm / fnm / volta）—— 全局安装即无需 sudo；或',
  'agent.installFailHint3': '  • 自行安装：{cmd}',
  'agent.installFailHint4': '随后重新运行本命令 —— 你的 TokenMix 登录已保存。',
  'agent.configuring': '正在配置 {name} ...',
  'agent.wrote': '已写入 {path}',
  'agent.configReady': '{name} 配置已就绪。',
  'agent.launching': '正在启动 {name} ...',

  // logout
  'logout.done': '已登出。凭据已从本机移除。',
  'logout.reverted': '已还原 {name} 配置',

  // doctor
  'doctor.title': 'TokenMix CLI 诊断',
  'doctor.credentials': '凭据：',
  'doctor.apiKeyLabel': 'API 密钥：',
  'doctor.apiBaseLabel': 'API 地址：',
  'doctor.keyValid': 'API 密钥有效。',
  'doctor.keyInvalid': 'API 密钥校验未通过。请重新运行 `tokenmix login`。',
  'doctor.notLoggedIn': '未登录。请运行 `tokenmix login`。',
  'doctor.agentStatus': 'Agent 安装状态：',
  'doctor.installed': '已安装',
  'doctor.notInstalled': '未安装',

  // list
  'list.title': '支持的 agent：',
  'list.usage': '用法：tokenmix <agent> [参数...]',
  'list.modeAutoNpm': '自动 (npm)',
  'list.modeAutoPip': '半自动 (pip)',
  'list.modeManualVscode': '仅配置 (VSCode)',
  'list.modeManual': '手动',

  // models
  'models.none': '没有匹配该筛选条件的模型。',
  'models.typeChat': '对话',
  'models.typeEmbedding': '向量',
  'models.typeImage': '图像',
  'models.typeAudio': '音频',
  'models.typeVideo': '视频',
  'models.typeCompletion': '补全',
  'models.in': '输入',
  'models.out': '输出',

  // prompt
  'prompt.pasteKey': '粘贴你的 TokenMix API 密钥（sk-tm-...）',

  // browser
  'balance.opening': '正在打开仪表盘查看余额：{url}',
  'topup.opening': '正在打开充值页面：{url}',
  'browser.manual': '无法自动打开浏览器。请手动打开此链接：\n  {url}',

  // agent taglines (shown in `list`)
  'desc.opencode': 'sst/opencode — 开源 AI 编程 agent（TUI / 桌面 / IDE）',
  'desc.claude': 'anthropics/claude-code — Anthropic 官方 CLI 编程 agent',
  'desc.aider': 'Aider-AI/aider — 结对编程 CLI（需要 Python）',
  'desc.kilo': 'Kilo-Org/kilocode — VSCode 扩展（仅配置）',

  // install hints
  'install.willInstallVia': '将自动安装：{cmd}',
  'aider.hintNeedPython': 'Aider 需要 Python 3。请从 https://python.org/downloads 安装 Python 3，然后重新运行 `tokenmix aider`。',
  'aider.hintNotInstalled': 'Aider 尚未安装。请在另一个终端运行：\n    {cmd}\n然后重新运行 `tokenmix aider` —— 你的 TokenMix 登录已保存，会自动生效。',

  // opencode configure notes
  'opencode.noteModel': '默认模型已设为 tokenmix/{model}',
  'opencode.noteSwitch': '切换模型：运行 `tokenmix models`，或在 OpenCode 内使用 `/connect`。',

  // claude configure notes
  'claude.noteModels': '可用的 Claude 模型（经 tokenmix）：claude-opus-4.7、claude-sonnet-4.6、claude-haiku-4.5',
  'claude.noteFullList': '完整列表请运行 `tokenmix models --type chat`。',
  'claude.noteReplaced1': '⚠ 已替换你在 ~/.claude/settings.json 中原有的 Anthropic 配置。',
  'claude.noteReplaced2': '  `tokenmix logout` 可移除 TokenMix 写入的项（你的旧密钥无法自动恢复）。',
  'claude.cleanupNote': '如果你之前在此设置过自己的 ANTHROPIC_API_KEY，请重新添加。',

  // aider configure notes
  'aider.noteUsing': 'Aider 将通过 OpenAI 兼容端点使用 TokenMix。',
  'aider.noteModel': '默认模型：openai/{model} —— 可用 --model 覆盖。',

  // kilo configure notes (prose only; technical lines stay verbatim)
  'kilo.noteNoLauncher': 'Kilo Code 是 VSCode 扩展，没有 CLI 启动器。',
  'kilo.noteConfigWith': '请按以下信息配置 Kilo Code：',
  'kilo.notePasteJson': '或将以下 JSON 粘贴到 Kilo Code 设置（Settings → Providers → JSON）：',
  'kilo.noteKeepPrivate': '请妥善保管此 API 密钥 —— 任何人拿到它都能消耗你的 TokenMix 余额。',
  'kilo.hintMarketplace': '从 VSCode 应用市场安装 "Kilo Code"，然后将下面的片段粘贴到它的设置中。',
  'kilo.hintNoVscode': '未在 PATH 中检测到 VSCode。请先安装 VSCode，再添加 Kilo Code 扩展，然后使用下面的片段。',

  // command / option descriptions (--help)
  'cmd.program': '零配置 CLI：以 TokenMix 作为统一 LLM 后端，驱动任意开源编程 agent。',
  'cmd.login': '登录 TokenMix（默认：浏览器设备授权）',
  'cmd.loginKey': '直接粘贴 API 密钥（跳过浏览器流程，适合 CI）',
  'cmd.loginPaste': '强制使用交互式粘贴，而非浏览器流程',
  'cmd.loginUrl': '覆盖 API 基础地址（默认：https://api.tokenmix.ai）',
  'cmd.logout': '从本机移除已保存的凭据',
  'cmd.balance': '打开仪表盘查看余额',
  'cmd.topup': '打开浏览器为账户充值',
  'cmd.models': '列出可用模型及价格',
  'cmd.modelsType': '按类型筛选：chat | embedding | image | audio | video',
  'cmd.list': '列出支持的编程 agent',
  'cmd.doctor': '诊断 CLI 配置与 agent 安装情况',
  'cmd.agent': '通过 TokenMix 配置并启动 {name}',
}

export const ja: typeof en = {
  'common.notLoggedIn': 'ログインしていません。まず `tokenmix login` を実行してください。',

  'login.keyMustStart': 'API キーは sk-tm- で始まる必要があります',
  'login.verifying': '{baseUrl} で API キーを検証しています ...',
  'login.verifyFailed': 'API キーの検証に失敗しました。https://tokenmix.ai/dashboard/keys で確認してください',
  'login.loggedInHint': 'ログインしました。`tokenmix opencode` で最初の agent を起動してみましょう。',
  'login.noKey': 'API キーが入力されていません。',
  'login.requesting': 'デバイス認証をリクエストしています ...',
  'login.couldNotStart': 'デバイス認証を開始できませんでした：{msg}',
  'login.fallbackPaste': '手動貼り付けに切り替えます。API キーは https://tokenmix.ai/dashboard/keys で取得できます',
  'login.openLinkConfirm': '下のリンクを開き、このコードを確認してください：',
  'login.link': 'リンク：',
  'login.browserOpened': '（ブラウザを開きました。反応がない場合は上のリンクをコピーしてください）',
  'login.browserFailed': '（ブラウザを開けませんでした。上のリンクをコピーして開いてください）',
  'login.waiting': '認証を待っています（{expires}秒で期限切れ、{interval}秒ごとに確認）...',
  'login.stillWaiting': '... 待機中（残り {seconds}秒）',
  'login.loggedInAs': '{email} としてログインしました（API キー #{id}）',
  'login.loggedInId': 'ログインしました（API キー #{id}）',
  'login.tryFirstAgent': '`tokenmix opencode` で最初の agent を起動してみましょう。',
  'login.tryAgain': '再試行しますか？',

  'agent.notInstalled': '{name} はインストールされていません。',
  'agent.notInstallable': '{name} は CLI からインストールできません。',
  'agent.installPrompt': '{name} はインストールされていません。今すぐインストールしますか？',
  'agent.installing': '{name} をインストールしています ...',
  'agent.installed': '{name} をインストールしました。',
  'agent.installFailed': '{name} を自動インストールできませんでした。',
  'agent.installFailHint1': 'これは通常、npm がグローバルフォルダに書き込めないことが原因です。対処方法：',
  'agent.installFailHint2': '  • Node バージョンマネージャー（nvm / fnm / volta）を使う — グローバルインストールに sudo が不要になります。または',
  'agent.installFailHint3': '  • 手動でインストール：{cmd}',
  'agent.installFailHint4': 'その後このコマンドを再実行してください — TokenMix のログインは保存済みです。',
  'agent.configuring': '{name} を設定しています ...',
  'agent.wrote': '{path} を書き込みました',
  'agent.configReady': '{name} の設定が完了しました。',
  'agent.launching': '{name} を起動しています ...',

  'logout.done': 'ログアウトしました。認証情報をこのマシンから削除しました。',
  'logout.reverted': '{name} の設定を元に戻しました',

  'doctor.title': 'TokenMix CLI 診断',
  'doctor.credentials': '認証情報：',
  'doctor.apiKeyLabel': 'API キー：',
  'doctor.apiBaseLabel': 'API ベース：',
  'doctor.keyValid': 'API キーは有効です。',
  'doctor.keyInvalid': 'API キーを検証できませんでした。`tokenmix login` を再実行してください。',
  'doctor.notLoggedIn': 'ログインしていません。`tokenmix login` を実行してください。',
  'doctor.agentStatus': 'agent のインストール状況：',
  'doctor.installed': 'インストール済み',
  'doctor.notInstalled': '未インストール',

  'list.title': '対応している agent：',
  'list.usage': '使い方：tokenmix <agent> [引数...]',
  'list.modeAutoNpm': '自動 (npm)',
  'list.modeAutoPip': '半自動 (pip)',
  'list.modeManualVscode': '設定のみ (VSCode)',
  'list.modeManual': '手動',

  'models.none': 'フィルタに一致するモデルがありません。',
  'models.typeChat': 'チャット',
  'models.typeEmbedding': '埋め込み',
  'models.typeImage': '画像',
  'models.typeAudio': '音声',
  'models.typeVideo': '動画',
  'models.typeCompletion': '補完',
  'models.in': '入力',
  'models.out': '出力',

  'prompt.pasteKey': 'TokenMix API キーを貼り付けてください（sk-tm-...）',

  'balance.opening': '残高を表示するダッシュボードを開いています：{url}',
  'topup.opening': 'チャージページを開いています：{url}',
  'browser.manual': 'ブラウザを自動で開けませんでした。この URL を手動で開いてください：\n  {url}',

  'desc.opencode': 'sst/opencode — オープンソースの AI コーディング agent（TUI / デスクトップ / IDE）',
  'desc.claude': 'anthropics/claude-code — Anthropic 公式の CLI コーディング agent',
  'desc.aider': 'Aider-AI/aider — ペアプログラミング CLI（Python が必要）',
  'desc.kilo': 'Kilo-Org/kilocode — VSCode 拡張機能（設定のみ）',

  'install.willInstallVia': '次の方法でインストールします：{cmd}',
  'aider.hintNeedPython': 'Aider には Python 3 が必要です。https://python.org/downloads から Python 3 をインストールし、再度 `tokenmix aider` を実行してください。',
  'aider.hintNotInstalled': 'Aider はインストールされていません。別のターミナルで次を実行してください：\n    {cmd}\nその後 `tokenmix aider` を再実行してください — TokenMix のログインは保存済みなので自動的に反映されます。',

  'opencode.noteModel': 'デフォルトモデルを tokenmix/{model} に設定しました',
  'opencode.noteSwitch': 'モデルを切り替えるには `tokenmix models` を実行するか、OpenCode 内で `/connect` を使用してください。',

  'claude.noteModels': 'tokenmix 経由で利用できる Claude モデル：claude-opus-4.7、claude-sonnet-4.6、claude-haiku-4.5',
  'claude.noteFullList': '完全な一覧は `tokenmix models --type chat` を実行してください。',
  'claude.noteReplaced1': '⚠ ~/.claude/settings.json の既存の Anthropic 設定を置き換えました。',
  'claude.noteReplaced2': '  `tokenmix logout` で TokenMix の項目を削除できます（以前のキーは自動復元されません）。',
  'claude.cleanupNote': '以前ご自身の ANTHROPIC_API_KEY を設定していた場合は、再度追加してください。',

  'aider.noteUsing': 'Aider は OpenAI 互換エンドポイント経由で TokenMix を使用します。',
  'aider.noteModel': 'デフォルトモデル：openai/{model} — --model で上書きできます。',

  'kilo.noteNoLauncher': 'Kilo Code は VSCode 拡張機能で、CLI ランチャーはありません。',
  'kilo.noteConfigWith': '次の内容で Kilo Code を設定してください：',
  'kilo.notePasteJson': 'または次の JSON を Kilo Code の設定（Settings → Providers → JSON）に貼り付けてください：',
  'kilo.noteKeepPrivate': 'この API キーは公開しないでください — 入手した人は誰でもあなたの TokenMix 残高を使えます。',
  'kilo.hintMarketplace': 'VSCode マーケットプレイスから "Kilo Code" をインストールし、下のスニペットを設定に貼り付けてください。',
  'kilo.hintNoVscode': 'PATH に VSCode が見つかりません。VSCode をインストールし、Kilo Code 拡張機能を追加してから、下のスニペットを使用してください。',

  'cmd.program': 'TokenMix を統一 LLM バックエンドとして、あらゆるオープンソースのコーディング agent を使うためのゼロ設定 CLI。',
  'cmd.login': 'TokenMix にログイン（デフォルト：ブラウザでのデバイス認証）',
  'cmd.loginKey': 'API キーを直接貼り付け（ブラウザ認証をスキップ、CI に便利）',
  'cmd.loginPaste': 'ブラウザ認証の代わりに対話的な貼り付けを強制',
  'cmd.loginUrl': 'API ベース URL を上書き（デフォルト：https://api.tokenmix.ai）',
  'cmd.logout': 'このマシンから保存された認証情報を削除',
  'cmd.balance': 'ダッシュボードを開いて残高を表示',
  'cmd.topup': 'ブラウザを開いてアカウントにチャージ',
  'cmd.models': '利用可能なモデルと価格を一覧表示',
  'cmd.modelsType': 'タイプで絞り込み：chat | embedding | image | audio | video',
  'cmd.list': '対応しているコーディング agent を一覧表示',
  'cmd.doctor': 'CLI 設定と agent のインストール状況を診断',
  'cmd.agent': 'TokenMix 経由で {name} を設定して起動',
}

export const ko: typeof en = {
  'common.notLoggedIn': '로그인되어 있지 않습니다. 먼저 `tokenmix login`을 실행하세요.',

  'login.keyMustStart': 'API 키는 sk-tm- 로 시작해야 합니다',
  'login.verifying': '{baseUrl} 에서 API 키를 확인하는 중 ...',
  'login.verifyFailed': 'API 키 확인에 실패했습니다. https://tokenmix.ai/dashboard/keys 에서 확인하세요',
  'login.loggedInHint': '로그인되었습니다. `tokenmix opencode` 로 첫 agent를 실행해 보세요.',
  'login.noKey': 'API 키가 입력되지 않았습니다.',
  'login.requesting': '기기 인증을 요청하는 중 ...',
  'login.couldNotStart': '기기 인증을 시작할 수 없습니다: {msg}',
  'login.fallbackPaste': '수동 붙여넣기로 전환합니다. API 키는 https://tokenmix.ai/dashboard/keys 에서 발급받으세요',
  'login.openLinkConfirm': '아래 링크를 열고 이 코드를 확인하세요:',
  'login.link': '링크:',
  'login.browserOpened': '(브라우저를 열었습니다. 반응이 없으면 위 링크를 복사하세요)',
  'login.browserFailed': '(브라우저를 열 수 없습니다. 위 링크를 복사해 여세요)',
  'login.waiting': '인증을 기다리는 중 ({expires}초 후 만료, {interval}초마다 확인) ...',
  'login.stillWaiting': '... 대기 중 (남은 시간 {seconds}초)',
  'login.loggedInAs': '{email}(으)로 로그인되었습니다 (API 키 #{id})',
  'login.loggedInId': '로그인되었습니다 (API 키 #{id})',
  'login.tryFirstAgent': '`tokenmix opencode` 로 첫 agent를 실행해 보세요.',
  'login.tryAgain': '다시 시도할까요?',

  'agent.notInstalled': '{name}이(가) 설치되어 있지 않습니다.',
  'agent.notInstallable': '{name}은(는) CLI에서 설치할 수 없습니다.',
  'agent.installPrompt': '{name}이(가) 설치되어 있지 않습니다. 지금 설치할까요?',
  'agent.installing': '{name} 설치 중 ...',
  'agent.installed': '{name} 설치 완료.',
  'agent.installFailed': '{name}을(를) 자동으로 설치할 수 없습니다.',
  'agent.installFailHint1': '보통 npm이 전역 폴더에 쓸 수 없을 때 발생합니다. 해결 방법:',
  'agent.installFailHint2': '  • Node 버전 매니저(nvm / fnm / volta)를 사용하세요 — 전역 설치에 sudo가 필요 없습니다. 또는',
  'agent.installFailHint3': '  • 직접 설치: {cmd}',
  'agent.installFailHint4': '그런 다음 이 명령을 다시 실행하세요 — TokenMix 로그인은 이미 저장되어 있습니다.',
  'agent.configuring': '{name} 구성 중 ...',
  'agent.wrote': '{path} 작성 완료',
  'agent.configReady': '{name} 구성이 준비되었습니다.',
  'agent.launching': '{name} 실행 중 ...',

  'logout.done': '로그아웃되었습니다. 자격 증명을 이 기기에서 삭제했습니다.',
  'logout.reverted': '{name} 구성을 되돌렸습니다',

  'doctor.title': 'TokenMix CLI 진단',
  'doctor.credentials': '자격 증명:',
  'doctor.apiKeyLabel': 'API 키:',
  'doctor.apiBaseLabel': 'API 주소:',
  'doctor.keyValid': 'API 키가 유효합니다.',
  'doctor.keyInvalid': 'API 키를 확인할 수 없습니다. `tokenmix login`을 다시 실행하세요.',
  'doctor.notLoggedIn': '로그인되어 있지 않습니다. `tokenmix login`을 실행하세요.',
  'doctor.agentStatus': 'agent 설치 상태:',
  'doctor.installed': '설치됨',
  'doctor.notInstalled': '설치 안 됨',

  'list.title': '지원하는 agent:',
  'list.usage': '사용법: tokenmix <agent> [인자...]',
  'list.modeAutoNpm': '자동 (npm)',
  'list.modeAutoPip': '반자동 (pip)',
  'list.modeManualVscode': '설정만 (VSCode)',
  'list.modeManual': '수동',

  'models.none': '필터와 일치하는 모델이 없습니다.',
  'models.typeChat': '채팅',
  'models.typeEmbedding': '임베딩',
  'models.typeImage': '이미지',
  'models.typeAudio': '오디오',
  'models.typeVideo': '비디오',
  'models.typeCompletion': '완성',
  'models.in': '입력',
  'models.out': '출력',

  'prompt.pasteKey': 'TokenMix API 키를 붙여넣으세요 (sk-tm-...)',

  'balance.opening': '잔액을 보려면 대시보드를 여는 중: {url}',
  'topup.opening': '충전 페이지를 여는 중: {url}',
  'browser.manual': '브라우저를 자동으로 열 수 없습니다. 이 URL을 직접 여세요:\n  {url}',

  'desc.opencode': 'sst/opencode — 오픈소스 AI 코딩 agent (TUI / 데스크톱 / IDE)',
  'desc.claude': 'anthropics/claude-code — Anthropic 공식 CLI 코딩 agent',
  'desc.aider': 'Aider-AI/aider — 페어 프로그래밍 CLI (Python 필요)',
  'desc.kilo': 'Kilo-Org/kilocode — VSCode 확장 (설정 전용)',

  'install.willInstallVia': '다음 방법으로 설치합니다: {cmd}',
  'aider.hintNeedPython': 'Aider에는 Python 3가 필요합니다. https://python.org/downloads 에서 Python 3를 설치한 뒤 다시 `tokenmix aider`를 실행하세요.',
  'aider.hintNotInstalled': 'Aider가 설치되어 있지 않습니다. 다른 터미널에서 다음을 실행하세요:\n    {cmd}\n그런 다음 다시 `tokenmix aider`를 실행하세요 — TokenMix 로그인이 이미 저장되어 있어 자동으로 적용됩니다.',

  'opencode.noteModel': '기본 모델을 tokenmix/{model}(으)로 설정했습니다',
  'opencode.noteSwitch': '모델을 바꾸려면 `tokenmix models`를 실행하거나 OpenCode 안에서 `/connect`를 사용하세요.',

  'claude.noteModels': 'tokenmix를 통해 사용할 수 있는 Claude 모델: claude-opus-4.7, claude-sonnet-4.6, claude-haiku-4.5',
  'claude.noteFullList': '전체 목록은 `tokenmix models --type chat`을 실행하세요.',
  'claude.noteReplaced1': '⚠ ~/.claude/settings.json의 기존 Anthropic 설정을 교체했습니다.',
  'claude.noteReplaced2': '  `tokenmix logout`으로 TokenMix 항목을 제거할 수 있습니다(이전 키는 자동 복원되지 않습니다).',
  'claude.cleanupNote': '이전에 직접 설정한 ANTHROPIC_API_KEY가 있었다면 다시 추가하세요.',

  'aider.noteUsing': 'Aider는 OpenAI 호환 엔드포인트를 통해 TokenMix를 사용합니다.',
  'aider.noteModel': '기본 모델: openai/{model} — --model로 재정의할 수 있습니다.',

  'kilo.noteNoLauncher': 'Kilo Code는 VSCode 확장이며 CLI 런처가 없습니다.',
  'kilo.noteConfigWith': '다음 내용으로 Kilo Code를 설정하세요:',
  'kilo.notePasteJson': '또는 다음 JSON을 Kilo Code 설정(Settings → Providers → JSON)에 붙여넣으세요:',
  'kilo.noteKeepPrivate': '이 API 키를 비공개로 유지하세요 — 키를 가진 사람은 누구나 당신의 TokenMix 잔액을 쓸 수 있습니다.',
  'kilo.hintMarketplace': 'VSCode 마켓플레이스에서 "Kilo Code"를 설치한 뒤 아래 스니펫을 설정에 붙여넣으세요.',
  'kilo.hintNoVscode': 'PATH에서 VSCode를 찾을 수 없습니다. VSCode를 설치하고 Kilo Code 확장을 추가한 뒤 아래 스니펫을 사용하세요.',

  'cmd.program': 'TokenMix를 통합 LLM 백엔드로 사용하여 모든 오픈소스 코딩 agent를 쓰는 제로 설정 CLI.',
  'cmd.login': 'TokenMix에 로그인 (기본값: 브라우저 기기 인증)',
  'cmd.loginKey': 'API 키를 직접 붙여넣기 (브라우저 절차 생략, CI에 유용)',
  'cmd.loginPaste': '브라우저 절차 대신 대화형 붙여넣기를 강제',
  'cmd.loginUrl': 'API 기본 URL 재정의 (기본값: https://api.tokenmix.ai)',
  'cmd.logout': '이 기기에서 저장된 자격 증명 제거',
  'cmd.balance': '대시보드를 열어 잔액 보기',
  'cmd.topup': '브라우저를 열어 계정 충전',
  'cmd.models': '사용 가능한 모델과 가격 목록 표시',
  'cmd.modelsType': '유형으로 필터링: chat | embedding | image | audio | video',
  'cmd.list': '지원하는 코딩 agent 목록 표시',
  'cmd.doctor': 'CLI 구성과 agent 설치 상태 진단',
  'cmd.agent': 'TokenMix를 통해 {name} 구성 및 실행',
}

export const es: typeof en = {
  'common.notLoggedIn': 'No has iniciado sesión. Ejecuta `tokenmix login` primero.',

  'login.keyMustStart': 'La clave de API debe empezar por sk-tm-',
  'login.verifying': 'Verificando la clave de API en {baseUrl} ...',
  'login.verifyFailed': 'Falló la verificación de la clave de API. Compruébala en https://tokenmix.ai/dashboard/keys',
  'login.loggedInHint': 'Sesión iniciada. Prueba `tokenmix opencode` para lanzar tu primer agent.',
  'login.noKey': 'No se proporcionó ninguna clave de API.',
  'login.requesting': 'Solicitando autorización del dispositivo ...',
  'login.couldNotStart': 'No se pudo iniciar la autorización del dispositivo: {msg}',
  'login.fallbackPaste': 'Cambiando a pegado manual. Consigue una clave de API en https://tokenmix.ai/dashboard/keys',
  'login.openLinkConfirm': 'Abre el enlace de abajo y confirma este código:',
  'login.link': 'Enlace:',
  'login.browserOpened': '(navegador abierto; si no pasa nada, copia el enlace de arriba)',
  'login.browserFailed': '(no se pudo abrir el navegador; copia el enlace de arriba en uno)',
  'login.waiting': 'Esperando autorización (expira en {expires}s, consultando cada {interval}s) ...',
  'login.stillWaiting': '... aún esperando (quedan {seconds}s)',
  'login.loggedInAs': 'Sesión iniciada como {email} (clave de API n.º {id})',
  'login.loggedInId': 'Sesión iniciada (clave de API n.º {id})',
  'login.tryFirstAgent': 'Prueba `tokenmix opencode` para lanzar tu primer agent.',
  'login.tryAgain': '¿Reintentar?',

  'agent.notInstalled': '{name} no está instalado.',
  'agent.notInstallable': '{name} no se puede instalar desde la CLI.',
  'agent.installPrompt': '{name} no está instalado. ¿Instalar ahora?',
  'agent.installing': 'Instalando {name} ...',
  'agent.installed': '{name} instalado.',
  'agent.installFailed': 'No se pudo instalar {name} automáticamente.',
  'agent.installFailHint1': 'Esto suele significar que npm no puede escribir en su carpeta global. Opciones:',
  'agent.installFailHint2': '  • Usa un gestor de versiones de Node (nvm / fnm / volta): así la instalación global no necesita sudo, o',
  'agent.installFailHint3': '  • Instálalo tú mismo: {cmd}',
  'agent.installFailHint4': 'Luego vuelve a ejecutar este comando; tu sesión de TokenMix ya está guardada.',
  'agent.configuring': 'Configurando {name} ...',
  'agent.wrote': 'Se escribió {path}',
  'agent.configReady': 'Configuración de {name} lista.',
  'agent.launching': 'Iniciando {name} ...',

  'logout.done': 'Sesión cerrada. Credenciales eliminadas de esta máquina.',
  'logout.reverted': 'Se revirtió la configuración de {name}',

  'doctor.title': 'Diagnóstico de TokenMix CLI',
  'doctor.credentials': 'Credenciales:',
  'doctor.apiKeyLabel': 'Clave de API:',
  'doctor.apiBaseLabel': 'Base de API:',
  'doctor.keyValid': 'La clave de API es válida.',
  'doctor.keyInvalid': 'La clave de API NO se validó. Ejecuta `tokenmix login` de nuevo.',
  'doctor.notLoggedIn': 'No has iniciado sesión. Ejecuta `tokenmix login`.',
  'doctor.agentStatus': 'Estado de instalación de los agents:',
  'doctor.installed': 'instalado',
  'doctor.notInstalled': 'no instalado',

  'list.title': 'Agents compatibles:',
  'list.usage': 'Uso: tokenmix <agent> [args...]',
  'list.modeAutoNpm': 'automático (npm)',
  'list.modeAutoPip': 'semi (pip)',
  'list.modeManualVscode': 'solo config. (VSCode)',
  'list.modeManual': 'manual',

  'models.none': 'Ningún modelo coincide con el filtro.',
  'models.typeChat': 'Chat',
  'models.typeEmbedding': 'Embedding',
  'models.typeImage': 'Imagen',
  'models.typeAudio': 'Audio',
  'models.typeVideo': 'Vídeo',
  'models.typeCompletion': 'Completado',
  'models.in': 'entrada',
  'models.out': 'salida',

  'prompt.pasteKey': 'Pega tu clave de API de TokenMix (sk-tm-...)',

  'balance.opening': 'Abriendo el panel para ver el saldo: {url}',
  'topup.opening': 'Abriendo la página de recarga: {url}',
  'browser.manual': 'No se pudo abrir un navegador automáticamente. Abre esta URL manualmente:\n  {url}',

  'desc.opencode': 'sst/opencode — agent de programación con IA de código abierto (TUI / escritorio / IDE)',
  'desc.claude': 'anthropics/claude-code — agent de programación CLI oficial de Anthropic',
  'desc.aider': 'Aider-AI/aider — CLI de programación en pareja (requiere Python)',
  'desc.kilo': 'Kilo-Org/kilocode — extensión de VSCode (solo configuración)',

  'install.willInstallVia': 'Se instalará mediante: {cmd}',
  'aider.hintNeedPython': 'Aider requiere Python 3. Instala Python 3 desde https://python.org/downloads y vuelve a ejecutar `tokenmix aider`.',
  'aider.hintNotInstalled': 'Aider no está instalado. Ejecuta esto en otra terminal:\n    {cmd}\nLuego vuelve a ejecutar `tokenmix aider`: tu sesión de TokenMix ya está guardada, así que se detectará automáticamente.',

  'opencode.noteModel': 'Modelo predeterminado establecido en tokenmix/{model}',
  'opencode.noteSwitch': 'Para cambiar de modelo, ejecuta `tokenmix models` o usa `/connect` dentro de OpenCode.',

  'claude.noteModels': 'Modelos de Claude disponibles vía tokenmix: claude-opus-4.7, claude-sonnet-4.6, claude-haiku-4.5',
  'claude.noteFullList': 'Ejecuta `tokenmix models --type chat` para ver la lista completa.',
  'claude.noteReplaced1': '⚠ Se reemplazó tu configuración de Anthropic existente en ~/.claude/settings.json.',
  'claude.noteReplaced2': '  `tokenmix logout` elimina las entradas de TokenMix (tu clave anterior no se puede restaurar automáticamente).',
  'claude.cleanupNote': 'Si antes tenías tu propia ANTHROPIC_API_KEY aquí, vuelve a añadirla.',

  'aider.noteUsing': 'Aider usará TokenMix a través del endpoint compatible con OpenAI.',
  'aider.noteModel': 'Modelo predeterminado: openai/{model} — anúlalo con --model.',

  'kilo.noteNoLauncher': 'Kilo Code es una extensión de VSCode y no tiene lanzador de CLI.',
  'kilo.noteConfigWith': 'Configura Kilo Code con lo siguiente:',
  'kilo.notePasteJson': 'O pega este fragmento JSON en la configuración de Kilo Code (Settings → Providers → JSON):',
  'kilo.noteKeepPrivate': 'Mantén privada esta clave de API: cualquiera que la tenga puede gastar tu saldo de TokenMix.',
  'kilo.hintMarketplace': 'Instala "Kilo Code" desde el marketplace de VSCode y pega el fragmento de abajo en su configuración.',
  'kilo.hintNoVscode': 'No se detectó VSCode en el PATH. Instala VSCode, añade la extensión Kilo Code y luego usa el fragmento de abajo.',

  'cmd.program': 'CLI sin configuración para usar cualquier agent de programación de código abierto con TokenMix como backend LLM unificado.',
  'cmd.login': 'Inicia sesión en TokenMix (predeterminado: autorización de dispositivo por navegador)',
  'cmd.loginKey': 'Pega una clave de API directamente (omite el navegador, útil para CI)',
  'cmd.loginPaste': 'Fuerza el pegado interactivo en lugar del flujo del navegador',
  'cmd.loginUrl': 'Anula la URL base de la API (predeterminado: https://api.tokenmix.ai)',
  'cmd.logout': 'Elimina las credenciales guardadas de esta máquina',
  'cmd.balance': 'Abre el panel para ver tu saldo',
  'cmd.topup': 'Abre el navegador para recargar tu cuenta',
  'cmd.models': 'Lista los modelos disponibles con precios',
  'cmd.modelsType': 'Filtrar por tipo: chat | embedding | image | audio | video',
  'cmd.list': 'Lista los agents de programación compatibles',
  'cmd.doctor': 'Diagnostica la configuración de la CLI y la instalación de los agents',
  'cmd.agent': 'Configura e inicia {name} vía TokenMix',
}

export const fr: typeof en = {
  'common.notLoggedIn': 'Non connecté. Exécutez d’abord `tokenmix login`.',

  'login.keyMustStart': 'La clé API doit commencer par sk-tm-',
  'login.verifying': 'Vérification de la clé API sur {baseUrl} ...',
  'login.verifyFailed': 'Échec de la vérification de la clé API. Vérifiez sur https://tokenmix.ai/dashboard/keys',
  'login.loggedInHint': 'Connecté. Essayez `tokenmix opencode` pour lancer votre premier agent.',
  'login.noKey': 'Aucune clé API fournie.',
  'login.requesting': 'Demande d’autorisation de l’appareil ...',
  'login.couldNotStart': 'Impossible de démarrer l’autorisation de l’appareil : {msg}',
  'login.fallbackPaste': 'Passage au collage manuel. Obtenez une clé API sur https://tokenmix.ai/dashboard/keys',
  'login.openLinkConfirm': 'Ouvrez le lien ci-dessous et confirmez ce code :',
  'login.link': 'Lien :',
  'login.browserOpened': '(navigateur ouvert ; s’il ne se passe rien, copiez le lien ci-dessus)',
  'login.browserFailed': '(impossible d’ouvrir le navigateur ; copiez le lien ci-dessus dans un navigateur)',
  'login.waiting': 'En attente de l’autorisation (expire dans {expires}s, vérification toutes les {interval}s) ...',
  'login.stillWaiting': '... toujours en attente ({seconds}s restantes)',
  'login.loggedInAs': 'Connecté en tant que {email} (clé API n° {id})',
  'login.loggedInId': 'Connecté (clé API n° {id})',
  'login.tryFirstAgent': 'Essayez `tokenmix opencode` pour lancer votre premier agent.',
  'login.tryAgain': 'Réessayer ?',

  'agent.notInstalled': '{name} n’est pas installé.',
  'agent.notInstallable': '{name} ne peut pas être installé depuis la CLI.',
  'agent.installPrompt': '{name} n’est pas installé. Installer maintenant ?',
  'agent.installing': 'Installation de {name} ...',
  'agent.installed': '{name} installé.',
  'agent.installFailed': 'Impossible d’installer {name} automatiquement.',
  'agent.installFailHint1': 'Cela signifie généralement que npm ne peut pas écrire dans son dossier global. Options :',
  'agent.installFailHint2': '  • Utilisez un gestionnaire de versions Node (nvm / fnm / volta) — l’installation globale ne nécessite alors pas sudo, ou',
  'agent.installFailHint3': '  • Installez-le vous-même : {cmd}',
  'agent.installFailHint4': 'Puis relancez cette commande — votre connexion TokenMix est déjà enregistrée.',
  'agent.configuring': 'Configuration de {name} ...',
  'agent.wrote': '{path} écrit',
  'agent.configReady': 'Configuration de {name} prête.',
  'agent.launching': 'Lancement de {name} ...',

  'logout.done': 'Déconnecté. Identifiants supprimés de cette machine.',
  'logout.reverted': 'Configuration de {name} rétablie',

  'doctor.title': 'Diagnostic de TokenMix CLI',
  'doctor.credentials': 'Identifiants :',
  'doctor.apiKeyLabel': 'Clé API :',
  'doctor.apiBaseLabel': 'Base API :',
  'doctor.keyValid': 'La clé API est valide.',
  'doctor.keyInvalid': 'La clé API n’a PAS été validée. Relancez `tokenmix login`.',
  'doctor.notLoggedIn': 'Non connecté. Exécutez `tokenmix login`.',
  'doctor.agentStatus': 'État d’installation des agents :',
  'doctor.installed': 'installé',
  'doctor.notInstalled': 'non installé',

  'list.title': 'Agents pris en charge :',
  'list.usage': 'Utilisation : tokenmix <agent> [args...]',
  'list.modeAutoNpm': 'auto (npm)',
  'list.modeAutoPip': 'semi (pip)',
  'list.modeManualVscode': 'config. seule (VSCode)',
  'list.modeManual': 'manuel',

  'models.none': 'Aucun modèle ne correspond au filtre.',
  'models.typeChat': 'Chat',
  'models.typeEmbedding': 'Embedding',
  'models.typeImage': 'Image',
  'models.typeAudio': 'Audio',
  'models.typeVideo': 'Vidéo',
  'models.typeCompletion': 'Complétion',
  'models.in': 'entrée',
  'models.out': 'sortie',

  'prompt.pasteKey': 'Collez votre clé API TokenMix (sk-tm-...)',

  'balance.opening': 'Ouverture du tableau de bord pour voir le solde : {url}',
  'topup.opening': 'Ouverture de la page de recharge : {url}',
  'browser.manual': 'Impossible d’ouvrir un navigateur automatiquement. Ouvrez cette URL manuellement :\n  {url}',

  'desc.opencode': 'sst/opencode — agent de codage IA open source (TUI / bureau / IDE)',
  'desc.claude': 'anthropics/claude-code — agent de codage CLI officiel d’Anthropic',
  'desc.aider': 'Aider-AI/aider — CLI de programmation en binôme (nécessite Python)',
  'desc.kilo': 'Kilo-Org/kilocode — extension VSCode (configuration seule)',

  'install.willInstallVia': 'Sera installé via : {cmd}',
  'aider.hintNeedPython': 'Aider nécessite Python 3. Installez Python 3 depuis https://python.org/downloads, puis relancez `tokenmix aider`.',
  'aider.hintNotInstalled': 'Aider n’est pas installé. Exécutez ceci dans un autre terminal :\n    {cmd}\nPuis relancez `tokenmix aider` — votre connexion TokenMix est déjà enregistrée, elle sera donc prise en compte automatiquement.',

  'opencode.noteModel': 'Modèle par défaut défini sur tokenmix/{model}',
  'opencode.noteSwitch': 'Pour changer de modèle, exécutez `tokenmix models` ou utilisez `/connect` dans OpenCode.',

  'claude.noteModels': 'Modèles Claude disponibles via tokenmix : claude-opus-4.7, claude-sonnet-4.6, claude-haiku-4.5',
  'claude.noteFullList': 'Exécutez `tokenmix models --type chat` pour la liste complète.',
  'claude.noteReplaced1': '⚠ Vos paramètres Anthropic existants dans ~/.claude/settings.json ont été remplacés.',
  'claude.noteReplaced2': '  `tokenmix logout` supprime les entrées TokenMix (votre ancienne clé ne peut pas être restaurée automatiquement).',
  'claude.cleanupNote': 'Si vous aviez votre propre ANTHROPIC_API_KEY ici, rajoutez-la.',

  'aider.noteUsing': 'Aider utilisera TokenMix via le point de terminaison compatible OpenAI.',
  'aider.noteModel': 'Modèle par défaut : openai/{model} — remplacez-le avec --model.',

  'kilo.noteNoLauncher': 'Kilo Code est une extension VSCode et n’a pas de lanceur CLI.',
  'kilo.noteConfigWith': 'Configurez Kilo Code avec les éléments suivants :',
  'kilo.notePasteJson': 'Ou collez cet extrait JSON dans les paramètres de Kilo Code (Settings → Providers → JSON) :',
  'kilo.noteKeepPrivate': 'Gardez cette clé API privée — quiconque la détient peut dépenser votre solde TokenMix.',
  'kilo.hintMarketplace': 'Installez « Kilo Code » depuis la marketplace VSCode, puis collez l’extrait ci-dessous dans ses paramètres.',
  'kilo.hintNoVscode': 'VSCode introuvable dans le PATH. Installez VSCode, ajoutez l’extension Kilo Code, puis utilisez l’extrait ci-dessous.',

  'cmd.program': 'CLI sans configuration pour utiliser n’importe quel agent de codage open source avec TokenMix comme backend LLM unifié.',
  'cmd.login': 'Se connecter à TokenMix (par défaut : autorisation de l’appareil via le navigateur)',
  'cmd.loginKey': 'Coller directement une clé API (ignore le navigateur, utile pour la CI)',
  'cmd.loginPaste': 'Forcer le collage interactif au lieu du flux navigateur',
  'cmd.loginUrl': 'Remplacer l’URL de base de l’API (par défaut : https://api.tokenmix.ai)',
  'cmd.logout': 'Supprimer les identifiants stockés de cette machine',
  'cmd.balance': 'Ouvrir le tableau de bord pour voir votre solde',
  'cmd.topup': 'Ouvrir le navigateur pour recharger votre compte',
  'cmd.models': 'Lister les modèles disponibles avec les prix',
  'cmd.modelsType': 'Filtrer par type : chat | embedding | image | audio | video',
  'cmd.list': 'Lister les agents de codage pris en charge',
  'cmd.doctor': 'Diagnostiquer la configuration de la CLI et l’installation des agents',
  'cmd.agent': 'Configurer et lancer {name} via TokenMix',
}

export const catalogs = { en, zh, ja, ko, es, fr }
