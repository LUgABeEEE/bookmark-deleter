# Bookmark Deleter

<img src="icons/icon128.png" width="72" align="right" alt="Bookmark Deleter icon">

一个 MV3 浏览器扩展（Chrome / Edge）：拿一份死链清单去比对书签，**只标记、不自动删**；
要删，得由你在工具栏图标上连续点两次。

它解决的是一个很小的别扭：书签里躺着几十个早就打不开的链接，手动一个个删太烦；
而"自动清理书签"的扩展又让人不敢装——删错了可没有回收站。

## 安全设计：一次点击永远删不掉东西

| 时机 | 行为 |
| --- | --- |
| 扩展启动 3 秒后 | **只扫描**：命中的书签数量显示为灰色角标，**不删除任何东西** |
| 第一次点图标 | 进入待确认：角标变成红色 `OK?`，此时仍未删除 |
| 第二次点图标 | 才真正删除命中的书签，完成后角标清空 |

没有"全自动清理"模式，也没有快捷键能跳过第二步。浏览器重启或图标状态丢失时，armed 标记随之失效。

## 安装

扩展还没上架商店，目前用「加载已解压」：

1. 下载或 clone 本仓库；
2. 打开 `chrome://extensions`（Edge 为 `edge://extensions`），打开右上角「开发者模式」；
3. 点「加载已解压的扩展程序」，选择本仓库目录；
4. 点扩展图标旁的「固定」，让它在工具栏可见。

## 维护死链清单

清单就是仓库根目录的 [`deadlinks.json`](deadlinks.json)——一个 URL 数组，可以手动增删：

```json
[
  "https://example.com/",
  "https://httpbin.org/status/404"
]
```

改完在扩展页点「重新加载」即可生效，**不需要改代码**。匹配是**整条 URL 精确相等**，
不做前缀或域名匹配——这样不会因为一个规则误伤整站书签。

仓库里自带的清单只是三个示例（`example.com` / `localhost:1` / `httpbin 404`），
换你自己的清单就行。

## 权限与隐私

- 只申请一个权限：`bookmarks`（读树 + 删除）。
- **不联网**：没有任何网络请求，清单随扩展一起加载。
- 不上传、不统计、不注入页面；没有 content script。
- 删除是调用 `chrome.bookmarks.remove`，属于普通删除，**没有回收站**——所以才有那道二次确认。

## 开发

```bash
npm test          # node --test：遍历匹配、清单归一化（5 个用例）
tools/package.sh  # 打一个可上传商店的 zip（排除 .git / node_modules）
```

代码里 `lib/match.js` 是纯函数（不含 `chrome.*`），所以能脱离浏览器直接测；
`background.js` 只负责生命周期和角标。

CI（GitHub Actions）在每次 push 时跑：`node --check`、`node --test`、
manifest 结构校验（v3 / module service worker / 三档图标存在）、gitleaks 密钥扫描。

## English summary

**Bookmark Deleter** is a small MV3 extension for Chrome and Edge. It compares your
bookmarks against a plain JSON list of dead URLs (`deadlinks.json`) and shows how many
match as a badge count — **it never deletes anything on its own**. Deleting takes two
deliberate clicks on the toolbar icon: the first arms it (badge turns red `OK?`), the
second performs the deletion. The only permission requested is `bookmarks`; the
extension makes no network requests and has no content scripts. Matching is exact URL
equality, so one entry cannot wipe out a whole domain. MIT licensed.

## License

MIT — see [LICENSE](LICENSE).
