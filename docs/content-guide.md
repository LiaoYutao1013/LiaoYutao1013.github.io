# 内容维护

站点继续使用 Jekyll / Academic Pages，可部署到 GitHub Pages。新版不依赖前端框架或第三方字体服务。

## 本地运行

使用 Ruby 3.1 和 Bundler：

```sh
bundle install
bundle exec jekyll serve --livereload
```

正式构建：`bundle exec jekyll build`。GitHub Pages 使用相同的 Liquid 模板与内容集合。不要提交 `_site`、本地依赖或浏览器草稿。

## 内容工作台

访问 `/admin/` 可写作、保存当前浏览器的草稿、下载 Markdown，并跳转至 GitHub 创建文件。该页是静态写作工具，不是独立服务器或认证系统。它不直接写入仓库；修改权限由 GitHub 校验。草稿包含标题、时间、标签、类型和正文，只在点击“保存草稿”时保存到当前浏览器，请及时下载备份。

## 添加内容

工作台会生成下面格式的文件。所有内容应使用真实资料，时间使用北京时间。

```markdown
---
title: "ROS 2 学习记录"
date: 2026-10-18 19:30:00 +0800
description: "一段简短摘要。"
tags: ["ROS 2", "机器人"]
activity_type: "learning"
---

在这里写 Markdown 正文。
```

| 类型 | 文件位置 | 展示位置 |
| --- | --- | --- |
| 博客 | `_posts/YYYY-MM-DD-title.md` | 博客列表、首页最近三篇、混合动态 |
| 学习 | `_learning/YYYY-MM-DD-title.md` | 日历蓝点、按日筛选、学习归档、混合动态 |
| 动态 | `_updates/YYYY-MM-DD-title.md` | 混合动态；类型可为 blog / learning / research / competition |
| 学术 / 竞赛经历 | `_experiences/YYYY-MM-DD-title.md` | 经历列表；可添加 role、venue、activity_type |
| 讲座 | `_talks/YYYY-MM-DD-title.md` | 学术笔记、经历、混合动态 |

`display_title` 可选，用于显示中文标题，原始 `title` 仍保留在内容中。首页动态最多 5 条，经历最多 4 条。无已发布内容时显示空状态，不创建示例成果。未来日期内容不会提前发布。

## 个人资料与照片

- `_config.yml`：姓名、邮件、GitHub 和可选的 Google Scholar / ORCID。空账号不会生成链接。
- `_data/identity.yml`：首屏介绍、研究标签、背景图、简历路径、仓库与分支。
- `_data/projects.yml`：工程项目资料，无日期的项目独立标为“项目记录”。
- `_data/gallery.yml`：照片列表。将图片上传到 `images/`，填写 image、alt、title，可选 category、date。避免将图片中第三人的私人信息公开。

```yaml
- image: /images/conference.jpg
  alt: "会议现场的具体文字说明"
  title: "会议记录"
  category: CONFERENCE
  date: 2026-10-18
```

`assets/css/identity.css` 是前台与工作台共用的设计系统；`assets/js/identity.js` 提供主题、菜单、日历、文章目录与草稿导出。默认主题跟随系统，手动选择保存在浏览器。减少动态效果设置会关闭脉冲与进入动画。关闭 JavaScript 仍可阅读和导航。

## 评论

当前未启用评论服务，界面提供真实的邮件交流入口。不会展示模拟登录、模拟评论或可提交但不保存的表单。

可选启用 Giscus（需要由仓库所有者先安装 Giscus GitHub App、启用 Discussions，并从 https://giscus.app 获取 repo_id 与 category_id）：

```yaml
comments:
  provider: giscus
  giscus:
    repo: LiaoYutao1013/LiaoYutao1013.github.io
    repo_id: 填写真实仓库 ID
    category: General
    category_id: 填写真实分类 ID
```

评论服务启用后，博客详情页加载 Giscus，使用对应的毛玻璃明暗样式，GitHub 负责登录与权限。无需 OAuth client secret。原有 Academic Pages 评论模板保留，切换到其他服务前需确认对应配置与加载脚本。

“管理入口”默认不生成。若未来接入自有管理服务，可配置同源的 `management.session_endpoint`，该服务必须在验证管理员身份后返回 `{"authenticated":true,"is_admin":true}`。前端据此显示入口；真正的管理操作必须由服务端鉴权。不能用 localStorage、隐藏按钮或静态页面代替权限控制。

## 设计参考

借鉴 [TermHub](https://github.com/H-Freax/TermHub) 的内容层级、终端字形细节与个人标识，以及 [XinghuisamaBlogs](https://github.com/heiehiehi/XinghuisamaBlogs) 的毛玻璃表面和评论区质感。新版模板、CSS 与交互为本项目重新实现，未引入参考项目代码或资产。
