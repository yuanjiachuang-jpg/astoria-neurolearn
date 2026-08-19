# NeuroLearn V2

A Next.js portfolio-style prototype for the Astoria Bio internship.

## 技术

- Next.js App Router
- TypeScript
- Tailwind CSS 4
- Motion for React
- Lucide icons

## 第一次运行

### 1. 安装 Node.js

安装官方 **LTS** 版本。安装后在 VS Code 终端输入：

```bash
node -v
npm -v
```

只要能显示版本号就行。

### 2. 用 VS Code 打开整个文件夹

不要只打开某一个代码文件。

```text
File → Open Folder → neurolearn-v2-nextjs
```

### 3. 安装依赖

打开：

```text
Terminal → New Terminal
```

输入：

```bash
npm install
```

第一次可能需要几分钟。

### 4. 运行

```bash
npm run dev
```

浏览器打开：

```text
http://localhost:3000
```

关闭网站服务器时，在终端按：

```text
Ctrl + C
```

## 后续主要修改位置

### 改神经科学内容、AI回答、分数

```text
data/content.ts
```

### 改首页排列

```text
app/page.tsx
```

### 改颜色、字体、公共样式

```text
app/globals.css
```

### 改单个功能

```text
components/
```

## 上传 GitHub

先在 GitHub 建立一个空仓库，然后在项目终端执行：

```bash
git init
git add .
git commit -m "Initial NeuroLearn V2"
git branch -M main
git remote add origin 你的仓库地址
git push -u origin main
```

## 部署到 Vercel

1. 使用 GitHub 登录 Vercel。
2. 选择 Add New → Project。
3. 选中该 GitHub 仓库。
4. 直接点击 Deploy。
5. 以后每次 push，线上网站会自动更新。

## 注意

现在的AI回答和评分只是界面占位数据，不是正式研究结论。正式展示前要替换成实际实验结果。

## Week 5 comparison extension

The `Compare & Score` section now expands the original three-model comparison while keeping the same rubric interaction style as the Week 3 evaluation system.

It supports:

- Three prompt strategies: Analogy, Lesson, Comparison
- One controlled prompt shared by ChatGPT, Claude, and Gemini
- Editable AI response fields
- 1–5 scoring for Scientific Accuracy, Clarity, and Educational Usefulness
- AI evaluation/comment field for each model
- Total score out of 15
- Summary cards at the bottom
- Local progress saving
- CSV export across all topics, prompt strategies, and models

The fields begin blank so placeholder text is not confused with actual research results.

## Week 5 guided workflow update

The Compare section now supports a complete in-browser experiment workflow:

1. Enter a preset or custom neuroscience topic.
2. Choose Analogy, Lesson, Comparison, or a custom prompting strategy.
3. Paste ChatGPT, Claude, and Gemini responses.
4. Score all three responses using the same 1–5 rubric.
5. Add an evaluation comment for each model.
6. Review the final comparison, save locally, and export the current run to CSV.

The interface is intentionally structured so a future API route can replace manual response/evaluation entry without redesigning the scoring workflow.
