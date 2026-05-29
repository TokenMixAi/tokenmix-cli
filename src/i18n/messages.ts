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

export const catalogs = { en, zh }
