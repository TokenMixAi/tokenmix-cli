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
}

export const catalogs = { en, zh }
