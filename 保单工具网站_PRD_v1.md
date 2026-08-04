# 退休养老内容+工具网站 产品需求文档（PRD）v1.0

> 面向开发者（Trae）的技术实现文档  
> 文档版本：v1.0 | 目标市场：香港 + 台湾  
> 技术栈：Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui  
> 部署目标：Vercel 免费方案  

---

## 1. 产品概述与目标

### 1.1 产品定位

繁体中文退休养老领域的**深度内容 + 实用工具**混合型网站。通过高质量 SEO 内容获取免费搜索流量，以计算器工具作为核心留存和转化抓手，通过 AdSense 广告和联盟营销实现变现。

### 1.2 商业目标

| 阶段 | 时间 | 目标 |
|------|------|------|
| MVP | 第1-4周 | 4个计算器上线 + 5篇种子文章 + 基础SEO |
| V1.0 | 第5-8周 | 15篇种子文章 + 博客框架 + AdSense接入 |
| V1.5 | 第9-12周 | 20+篇文章 + 联盟营销接入 + 地区路径分流 |
| V2.0 | 第13周+ | 咨询导流 + 邮件订阅 + 社交分享优化 |

### 1.3 核心指标（上线后6个月）

- 月均自然搜索流量 ≥ 10,000 UV
- AdSense 月收入 ≥ $200 USD
- 计算器平均使用时长 ≥ 90秒
- 页面跳出率 ≤ 65%
- Core Web Vitals 全绿（LCP < 2.5s, FID < 100ms, CLS < 0.1）

### 1.4 项目约束

| 约束项 | 具体要求 |
|--------|---------|
| 技术约束 | 纯前端，零 API 调用，零后端数据库 |
| 部署约束 | Vercel 免费方案（Hobby plan），带宽 100GB/月 |
| 成本约束 | 除域名（约 $10/年）外，运营零成本 |
| 语言约束 | 全站繁体中文，UI文案需港式繁体与台式繁体区分 |
| 合规约束 | 不持有金融牌照，所有内容标注免责声明 |

---

## 2. 用户画像与使用场景

### 2.1 用户画像

#### 画像 A：香港打工族（主力用户，占比约55%）

- **人口特征**：25-45岁，月收入 HKD 15,000-50,000，有强积金供款
- **核心痛点**：不知道 MPF 退休能攒多少、不知道退休后够不够用
- **搜索关键词**：`MPF计算器`、`退休几多钱先够`、`退休规划`
- **典型场景**：午休时用手机搜"MPF 计到几多"，花3分钟填完计算器，截图发WhatsApp群

#### 画像 B：台湾上班族（占比约35%）

- **人口特征**：28-50岁，月收入 TWD 35,000-80,000，有劳退新制+劳保
- **核心痛点**：劳保年金到底领得到多少、劳退新制退休金够不够
- **搜索关键词**：`劳退试算`、`劳保老年给付计算`、`退休准备金`
- **典型场景**：下班后在电脑上看"劳退新制退休金怎么算"，仔细对比不同情境

#### 画像 C：临近退休者（占比约10%）

- **人口特征**：50-64岁，距退休5-15年，有一定积蓄
- **核心痛点**：退休后每月能花多少、会不会活太久钱不够用
- **搜索关键词**：`退休生活费`、`退休金规划`、`退休够不够用`
- **典型场景**：周末认真做退休规划，在计算器上反复调整参数

### 2.2 使用场景地图

```
用户旅程：
搜索"MPF计算器" → 落地到计算器页面 → 填写参数 → 看到结果 
    → 点击"了解更多" → 阅读相关文章 → 看到广告 → 返回再试不同参数
    → 分享结果给同事（后期功能）
```

---

## 3. 网站架构

### 3.1 页面结构

```
首页 (/)
├── 计算器工具 (/tools)
│   ├── 退休缺口计算器 (/tools/retirement-gap-calculator)
│   ├── 退休生活费规划器 (/tools/living-cost-planner)
│   ├── MPF强积金计算器 (/hk/tools/mpf-calculator)
│   └── 劳退劳保试算器 (/tw/tools/labor-pension-calculator)
├── 文章博客 (/blog)
│   ├── 香港退休 (/hk/blog)
│   ├── 台湾退休 (/tw/blog)
│   └── 通用退休 (/blog)
├── 文章详情页 (/blog/[slug])
├── 关于 (/about)
├── 隐私政策 (/privacy)
└── 免责声明 (/disclaimer)
```

### 3.2 URL 规划（带地区路径）

| 页面 | 通用路径 | 香港路径 | 台湾路径 |
|------|---------|---------|---------|
| 首页 | `/` | `/hk` | `/tw` |
| 退休缺口计算器 | `/tools/retirement-gap-calculator` | `/hk/tools/retirement-gap-calculator` | `/tw/tools/retirement-gap-calculator` |
| 生活费规划器 | `/tools/living-cost-planner` | `/hk/tools/living-cost-planner` | `/tw/tools/living-cost-planner` |
| MPF计算器 | — | `/hk/tools/mpf-calculator` | — |
| 劳退试算器 | — | — | `/tw/tools/labor-pension-calculator` |
| 博客列表 | `/blog` | `/hk/blog` | `/tw/blog` |

**地区判断逻辑**：
1. 首次访问时通过 `Accept-Language` header 判断（zh-HK → 香港，zh-TW → 台湾）
2. 用户手动切换地区时，存入 localStorage（key: `preferred_region`，value: `hk` | `tw`）
3. URL 带地区前缀时以 URL 为准
4. **不自动重定向**，仅在页面顶部显示地区切换提示条

### 3.3 导航结构

```
顶部导航栏（桌面端）：
Logo | 计算工具 ▼ | 退休知识 ▼ | 关于我们 | [🇭🇰/🇹🇼 地区切换]

计算工具下拉：
  - 退休缺口计算器（通用）
  - 退休生活费规划器（通用）
  - MPF强积金计算器（🇭🇰 香港专属）
  - 劳退劳保试算器（🇹🇼 台湾专属）

退休知识下拉：
  - 香港退休攻略
  - 台湾退休攻略
  - 通用退休知识

移动端导航：汉堡菜单，同上结构
```

---

## 4. 计算器详细功能规格

### 4.1 退休缺口计算器（Retirement Gap Calculator）

#### 4.1.1 功能描述

根据用户当前年龄、目标退休年龄、期望退休后月收入，计算出退休时需要攒够多少本金，以及当前每月需要储蓄多少。

#### 4.1.2 输入字段

| 字段名 | 字段ID | 类型 | 默认值 | 最小值 | 最大值 | 步进 | 单位 | 必填 | 校验规则 |
|--------|--------|------|--------|--------|--------|------|------|------|---------|
| 当前年龄 | `currentAge` | number | 30 | 18 | 70 | 1 | 岁 | 是 | 整数，18-70 |
| 目标退休年龄 | `retireAge` | number | 65 | 30 | 80 | 1 | 岁 | 是 | 整数，必须 > currentAge + 5 |
| 期望退休后月收入 | `targetMonthlyIncome` | number | 20000 | 1000 | 200000 | 1000 | 当地货币 | 是 | 正数，1000-200000 |
| 预期投资年回报率 | `annualReturnRate` | number | 5 | 0 | 15 | 0.1 | % | 是 | 0-15，支持一位小数 |
| 预期通胀率 | `inflationRate` | number | 2.5 | 0 | 10 | 0.1 | % | 是 | 0-10，支持一位小数 |
| 预期退休后年数 | `retirementYears` | number | 25 | 5 | 45 | 1 | 年 | 是 | 整数，5-45 |
| 现有退休储蓄 | `currentSavings` | number | 0 | 0 | 10000000 | 1000 | 当地货币 | 是 | ≥ 0 |
| 地区 | `region` | select | hk | — | — | — | — | 是 | hk / tw |

**货币单位规则**：
- `region = hk` → 显示"港币 (HKD)"
- `region = tw` → 显示"新台币 (TWD)"

#### 4.1.3 计算公式

**第一步：计算退休时需要的总本金（PV of Annuity）**

退休后每月收入需要按通胀调整（实际购买力不变），同时剩余本金仍在产生投资收益。

```
实际月回报率 r = (1 + annualReturnRate/100) / (1 + inflationRate/100) - 1
实际月数 n = retirementYears × 12

退休后需要的总本金（在退休那一刻的价值）：
FV_needed = targetMonthlyIncome × [1 - (1 + r)^(-n)] / r

当 r = 0 时（回报率=通胀率）：
FV_needed = targetMonthlyIncome × n
```

**第二步：计算缺口**

```
现有储蓄在退休时的终值：
FV_current = currentSavings × (1 + annualReturnRate/100)^(retireAge - currentAge)

缺口 Gap = FV_needed - FV_current

如果 Gap ≤ 0，显示"您目前的储蓄已足够覆盖退休目标！"
```

**第三步：计算每月需要储蓄的金额（PMT）**

```
距退休年数 Y = retireAge - currentAge
距退休月数 M = Y × 12
月回报率 i = annualReturnRate / 100 / 12

每月需储蓄 PMT = Gap × i / [(1 + i)^M - 1]

当 i = 0 时：
PMT = Gap / M
```

#### 4.1.4 输出展示

**主要结果卡片**：
1. 🔴 **退休需要的总本金**：大字体显示，带货币符号
2. 🔴 **退休金缺口**：红色（正值）/绿色（零或负值）
3. 🔴 **每月需储蓄金额**：醒目展示

**辅助展示**：
- 简易柱状图：现有储蓄 vs 目标总额（用 CSS 实现，不用图表库）
- 情景对比表：乐观/基准/保守三种情景（回报率 ±1%）

**结果文案示例**：
```
按照您目前的规划：
- 您退休时需要准备 HKD 6,234,000 的总本金
- 扣除现有储蓄的预计增长后，缺口为 HKD 4,156,000
- 您每月需要额外储蓄 HKD 5,230 才能达成目标

💡 如果将退休年龄延后3年到68岁，每月储蓄金额可降至 HKD 3,980
```

#### 4.1.5 边界条件

| 条件 | 处理方式 |
|------|---------|
| `retireAge ≤ currentAge` | 红色提示"退休年龄必须大于当前年龄"，禁用计算按钮 |
| `retireAge - currentAge < 5` | 警告提示"距离退休不足5年，计算结果可能不够准确" |
| `annualReturnRate = 0` | 正常计算，公式使用 r=0 的退化形式 |
| `inflationRate > annualReturnRate` | 警告提示"通胀率高于回报率，实际购买力将持续下降"，但仍正常计算 |
| `currentSavings ≥ FV_needed` | 绿色展示"恭喜！现有储蓄已足够"，PMT 显示为 0 |
| `targetMonthlyIncome` 过高（>月入的3倍） | 不限制，但提示"请确认此金额合理" |

---

### 4.2 退休生活费规划器（Living Cost Planner）

#### 4.2.1 功能描述

根据用户当前每月生活开销，结合通胀率，推算在不同退休年龄时，每月需要多少钱才能维持**相同的生活水平**（等购买力）。

#### 4.2.2 输入字段

| 字段名 | 字段ID | 类型 | 默认值 | 最小值 | 最大值 | 步进 | 单位 | 必填 | 校验规则 |
|--------|--------|------|--------|--------|--------|------|------|------|---------|
| 当前每月生活开销 | `currentMonthlyExpense` | number | 15000 | 2000 | 200000 | 1000 | 当地货币 | 是 | 正数 |
| 距退休年数 | `yearsToRetire` | number | 20 | 1 | 50 | 1 | 年 | 是 | 整数，1-50 |
| 预期年通胀率 | `inflationRate` | number | 2.5 | 0 | 10 | 0.1 | % | 是 | 0-10 |
| 退休后生活水平调整 | `lifestyleFactor` | number | 80 | 50 | 150 | 5 | % | 是 | 50-150，默认80表示退休后消费降为目前的80% |
| 地区 | `region` | select | hk | — | — | — | — | 是 | hk / tw |

**`lifestyleFactor` 说明**：
- 80% = 退休后减少外出就餐、旅游等，消费降低
- 100% = 维持当前消费水平
- 120% = 退休后消费增加（如医疗开支增大）

#### 4.2.3 计算公式

**第一步：计算退休时每月需要的金额（通胀调整后）**

```
retirementMonthlyExpense = currentMonthlyExpense × (lifestyleFactor / 100) × (1 + inflationRate/100)^yearsToRetire
```

**第二步：计算各开支类别的明细（按通胀拆分）**

预设开支类别及其占总支出的默认比例和各自的通胀率：

```javascript
const EXPENSE_CATEGORIES = [
  { key: 'housing',     label: '住屋开支',    defaultRatio: 0.30, inflationOverride: 0.03 },  // 住屋通胀通常较高
  { key: 'food',        label: '饮食开支',    defaultRatio: 0.20, inflationOverride: null },   // 跟随总体通胀
  { key: 'transport',   label: '交通开支',    defaultRatio: 0.10, inflationOverride: null },
  { key: 'medical',     label: '医疗健康',    defaultRatio: 0.15, inflationOverride: 0.05 },   // 医疗通胀较高
  { key: 'leisure',     label: '休闲娱乐',    defaultRatio: 0.10, inflationOverride: null },
  { key: 'other',       label: '其他开支',    defaultRatio: 0.15, inflationOverride: null },
]
```

每个类别退休时的月支出：
```
categoryMonthlyExpense[i] = currentMonthlyExpense × defaultRatio[i] × (lifestyleFactor/100) × (1 + (inflationOverride[i] ?? inflationRate/100))^yearsToRetire
```

**第三步：计算退休后总需求（简单版，配合缺口计算器使用）**

```
// 退休后N年的总生活费（考虑退休后仍有通胀）
totalRetirementFund = retirementMonthlyExpense × 12 × retirementYears × (1 + inflationRate/100)^(retirementYears/2)
// 注：这里用 retirementYears/2 作为平均通胀年数，是简化算法
// 更精确的做法是逐年求和：
totalRetirementFund = Σ(year=1 to retirementYears) retirementMonthlyExpense × 12 × (1 + inflationRate/100)^year
```

#### 4.2.4 输出展示

1. **退休后每月需要（通胀调整后）**：大字体
2. **开支类别饼图**：用 CSS conic-gradient 实现
3. **通胀影响对比**：当前月开销 vs 退休时月开销，差额用红色标注
4. **时间线可视化**：显示从当前到退休，每年月开销的增长曲线（CSS实现）

#### 4.2.5 边界条件

| 条件 | 处理方式 |
|------|---------|
| `inflationRate = 0` | 正常计算，结果等于当前开销 × lifestyleFactor |
| `lifestyleFactor = 100` | 不显示调整提示 |
| `yearsToRetire > 40` | 提示"距退休超过40年，通胀影响将非常显著" |
| 某类别计算结果 < 0 | 不可能出现（所有输入为正数），无需处理 |

---

### 4.3 MPF强积金计算器（Hong Kong MPF Calculator）

#### 4.3.1 功能描述

根据香港强积金制度规则，估算退休时 MPF 账户的累积金额。支持显示雇主+雇员双方供款、税前/税后金额、以及不同基金类型的预估回报。

#### 4.3.2 MPF 制度关键参数（硬编码常量）

```typescript
const MPF_CONSTANTS = {
  // 2024年数据，可配置
  MIN_INCOME_FOR_MPF: 7100,        // 最低有关入息水平（港币/月）
  MAX_RELEVANT_INCOME: 30000,      // 最高有关入息水平（港币/月）—— 注意：2024年6月起调至$30,000 但实际计算需核实最新
  EMPLOYEE_CONTRUTION_RATE: 0.05,  // 雇员供款比例 5%
  EMPLOYER_CONTRIBUTION_RATE: 0.05,// 雇主供款比例 5%
  MAX_MONTHLY_EMPLOYEE_CONTRIBUTION: 1500,  // 雇员月供上限 = 30000 × 5%
  MAX_MONTHLY_EMPLOYER_CONTRIBUTION: 1500,  // 雇主月供上限
  SELF_EMPLOYED_RATE: 0.05,        // 自雇人士供款比例
  NORMAL_RETIREMENT_AGE: 65,       // 正常退休年龄
  EARLY_RETIREMENT_AGE: 60,        // 提早退休年龄（可提取）
}
```

**⚠️ 重要**：`MAX_RELEVANT_INCOME` 的值为 $30,000（自2019年起），请在代码中加注释标注数据来源和日期，方便后续更新。

#### 4.3.3 输入字段

| 字段名 | 字段ID | 类型 | 默认值 | 最小值 | 最大值 | 步进 | 单位 | 必填 | 校验规则 |
|--------|--------|------|--------|--------|--------|------|------|------|---------|
| 每月有关入息 | `monthlyRelevantIncome` | number | 25000 | 0 | 999999 | 500 | HKD | 是 | ≥ 0 |
| 当前年龄 | `currentAge` | number | 30 | 18 | 64 | 1 | 岁 | 是 | 18-64 |
| 目标提取年龄 | `withdrawAge` | number | 65 | 60 | 75 | 1 | 岁 | 是 | 60-75 |
| 现有MPF结余 | `currentMPFBalance` | number | 100000 | 0 | 5000000 | 1000 | HKD | 是 | ≥ 0 |
| 自选投资策略年回报率 | `fundReturnRate` | number | 5 | -5 | 15 | 0.1 | % | 是 | -5到15 |
| 基金类型 | `fundType` | select | balanced | — | — | — | — | 是 | conservative/balanced/growth |
| 自雇人士 | `isSelfEmployed` | boolean | false | — | — | — | — | 是 | — |
| 额外自愿性供款（月） | `voluntaryContribution` | number | 0 | 0 | 50000 | 500 | HKD | 是 | ≥ 0 |

**基金类型预设回报率**（仅供参考，用户可手动覆盖）：

```javascript
const FUND_PRESETS = {
  conservative: { rate: 3.0, label: '保守基金（债券/货币）' },
  balanced:     { rate: 5.0, label: '平衡基金（股债混合）' },
  growth:       { rate: 7.0, label: '增长基金（股票为主）' },
}
```

#### 4.3.4 计算公式

**第一步：计算每月供款额**

```
// 受雇人士
if (monthlyRelevantIncome < MPF_CONSTANTS.MIN_INCOME_FOR_MPF) {
  雇员月供 = 0
  雇主月供 = 0  // 入息低于最低水平，无需供款
} else {
  const relevantIncome = min(monthlyRelevantIncome, MPF_CONSTANTS.MAX_RELEVANT_INCOME)
  雇员月供 = min(relevantIncome × 0.05, MPF_CONSTANTS.MAX_MONTHLY_EMPLOYEE_CONTRIBUTION)
  雇主月供 = min(relevantIncome × 0.05, MPF_CONSTANTS.MAX_MONTHLY_EMPLOYER_CONTRIBUTION)
}

// 自雇人士
if (isSelfEmployed) {
  自雇月供 = min(monthlyRelevantIncome × 0.05, MPF_CONSTANTS.MAX_MONTHLY_EMPLOYEE_CONTRIBUTION)
  // 注意：自雇人士没有雇主供款
}

totalMonthlyContribution = 雇员月供 + 雇主月供 + voluntaryContribution
// 或 selfEmployed月供 + voluntaryContribution（自雇时）
```

**第二步：计算退休时累积金额（含复利）**

使用**逐月复利**计算（更精确，不用年化简化）：

```
月回报率 = fundReturnRate / 100 / 12
总月数 M = (withdrawAge - currentAge) × 12

// 现有余额的终值
FV_balance = currentMPFBalance × (1 + 月回报率)^M

// 每月供款的年金终值
FV_contributions = totalMonthlyContribution × [(1 + 月回报率)^M - 1] / 月回报率
// 当月回报率 = 0 时：FV_contributions = totalMonthlyContribution × M

// 总累积金额
totalAccumulated = FV_balance + FV_contributions
```

**第三步：提取阶段说明**

```
// 65岁正常退休：可一次过或分期提取
// 60-64岁提早退休：每年最多提取 1/12 的累积权益

if (withdrawAge < 65) {
  earlyRetireNote = "提早退休提取，每年最多可提取账户总额的1/12"
}
```

#### 4.3.5 输出展示

1. **退休时MPF预计总额**：HKD X,XXX,XXX（大字体）
2. **明细拆分**：
   - 雇员供款累积：HKD XXX,XXX
   - 雇主供款累积：HKD XXX,XXX
   - 自愿性供款累积：HKD XXX,XXX
   - 投资回报累积：HKD XXX,XXX（总额 - 总供款）
3. **时间线**：每5年一个节点的累积金额表格
4. **与目标对比**：如果配合"退休缺口计算器"的结果，显示MPF能覆盖多少百分比

#### 4.3.6 边界条件

| 条件 | 处理方式 |
|------|---------|
| `monthlyRelevantIncome < 7100` | 显示"您的入息低于最低有关入息水平（HKD 7,100），无需供款强积金"，月供显示0，但仍可计算现有余额的增长 |
| `currentAge ≥ 65` | 禁用计算，提示"您已达正常退休年龄" |
| `fundReturnRate < 0` | 允许（基金可能亏损），但红色警告"负回报率将导致本金缩水" |
| `withdrawAge = 60` | 显示提早退休提取规则的提示 |
| `currentMPFBalance = 0 && monthlyRelevantIncome < 7100` | 显示"您目前无需供款，建议考虑其他退休储蓄方式" |

---

### 4.4 劳退劳保试算器（Taiwan Labor Pension + Insurance Calculator）

#### 4.4.1 功能描述

根据台湾劳工退休金制度（劳退新制）和劳保年金制度，计算：
1. 劳退新制：雇主每月提缴6% + 劳工自提（0-6%），退休时的个人专户累积金额
2. 劳保老年给付：根据投保薪资和保险年资，计算每月可领的劳保年金金额

#### 4.4.2 制度关键参数（硬编码常量）

```typescript
const TAIWAN_LABOR_CONSTANTS = {
  // 劳退新制
  EMPLOYER_CONTRIBUTION_RATE: 0.06,  // 雇主强制提缴 6%
  VOLUNTARY_CONTRIBUTION_MIN: 0.01,  // 劳工自提最低 1%
  VOLUNTARY_CONTRIBUTION_MAX: 0.06,  // 劳工自提最高 6%
  GUARANTEED_MIN_RETURN: 0.02,       // 保证收益率不低于 2%（台湾银行两年定存利率）
  
  // 劳保老年给付
  INSURANCE_SALARY_CAP: 45800,       // 劳保投保薪资上限 TWD 45,800（2024年）
  MIN_INSURANCE_SALARY: 27470,       // 最低投保薪资 TWD 27,470
  
  // 年金给付率
  PENSION_FORMULA_A: 0.0155,         // 平均月投保薪资 × 保险年资 × 1.55%（一般公式）
  PENSION_FORMULA_B: 0.013,          //  alternative formula rate
  
  // 劳保年金请领年龄（逐年调高）
  // 2009年：60岁 → 2026年：65岁
  CLAIM_AGE_2026: 65,                // 2026年起全面65岁
}
```

#### 4.4.3 输入字段

| 字段名 | 字段ID | 类型 | 默认值 | 最小值 | 最大值 | 步进 | 单位 | 必填 | 校验规则 |
|--------|--------|------|--------|--------|--------|------|------|------|---------|
| 当前月投保薪资 | `insuranceSalary` | number | 36000 | 27470 | 45800 | 500 | TWD | 是 | 27470-45800 |
| 当前年龄 | `currentAge` | number | 35 | 15 | 64 | 1 | 岁 | 是 | 15-64 |
| 预计退休年龄 | `retireAge` | number | 65 | 50 | 70 | 1 | 岁 | 是 | ≥ currentAge+5, ≤ 70 |
| 劳退现有专户金额 | `laborPensionBalance` | number | 200000 | 0 | 10000000 | 10000 | TWD | 是 | ≥ 0 |
| 劳工自提比例 | `voluntaryRate` | number | 0 | 0 | 6 | 1 | % | 是 | 0-6，整数 |
| 劳保年资（已有） | `existingInsuranceYears` | number | 10 | 0 | 50 | 1 | 年 | 是 | ≥ 0 |
| 劳退专户预期年收益率 | `pensionFundReturn` | number | 4 | -5 | 10 | 0.1 | % | 是 | -5到10 |
| 劳保平均月投保薪资 | `avgInsuranceSalary` | number | 36000 | 19047 | 45800 | 500 | TWD | 是 | 用于年金计算，默认等于当前投保薪资 |

#### 4.4.4 计算公式

**Part A：劳退新制退休金（个人专户累积金额）**

```
// 每月提缴总额
employerMonthly = insuranceSalary × 0.06
voluntaryMonthly = insuranceSalary × (voluntaryRate / 100)
totalMonthly = employerMonthly + voluntaryMonthly

// 距退休月数
M = (retireAge - currentAge) × 12
月回报率 = pensionFundReturn / 100 / 12

// 现有专户终值
FV_balance = laborPensionBalance × (1 + 月回报率)^M

// 每月提缴年金终值
FV_contributions = totalMonthly × [(1 + 月回报率)^M - 1] / 月回报率
// 月回报率 = 0 时：FV_contributions = totalMonthly × M

// 劳退新制总累积
laborPensionTotal = FV_balance + FV_contributions

// 退休后每月可领（按20年平均领取）
monthlyPension = laborPensionTotal / (20 × 12)
```

**Part B：劳保老年给付（年金）**

```
// 总保险年资
totalInsuranceYears = existingInsuranceYears + (retireAge - currentAge)

// 平均月投保薪资（简化：假设退休前5年平均）
// 更精确做法：用户可输入"退休前60个月平均投保薪资"
avgSalary = avgInsuranceSalary  // 用户输入值

// 劳保年金公式（现行主流公式）
monthlyInsurancePension = avgSalary × totalInsuranceYears × PENSION_FORMULA_A
// 即：月年金 = 平均月投保薪资 × 保险年资 × 1.55%

// 注意：实际有A案B案择优，简化为使用1.55%公式
// PENSION_FORMULA_A = 0.0155（含展期年金）
```

**Part C：合计**

```
// 退休后每月总收入估算
totalMonthlyRetirementIncome = monthlyPension + monthlyInsurancePension
// = 劳退月领 + 劳保年金
```

#### 4.4.5 输出展示

1. **退休后每月预估收入**：TWD XX,XXX（最大字体）
   - 劳退新制月领：TWD XX,XXX
   - 劳保年金月领：TWD XX,XXX
2. **劳退专户总累积**：TWD X,XXX,XXX
3. **明细表格**：
   | 项目 | 金额 |
   |------|------|
   | 雇主6%提缴累积 | TWD XXX,XXX |
   | 自提累积 | TWD XXX,XXX |
   | 投资收益 | TWD XXX,XXX |
   | 劳保年金（月） | TWD XX,XXX |
4. **替代率显示**：`totalMonthlyRetirementIncome / insuranceSalary × 100%`，显示为"所得替代率约 XX%"

#### 4.4.6 边界条件

| 条件 | 处理方式 |
|------|---------|
| `retireAge < 60` | 警告"提早退休可能导致劳保年金减额" |
| `retireAge > 65` | 提示"劳保年金请领年龄上限为65岁（2026年起）" |
| `totalInsuranceYears < 15` | 警告"保险年资未满15年，仅能请领一次给付而非年金" |
| `voluntaryRate = 0` | 正常计算，提示"您未自提，建议考虑自提以增加退休准备" |
| `pensionFundReturn = 0` | 正常计算，使用退化公式 |
| `currentAge = 15` | 正常计算（台湾最低工作年龄15岁） |

---

## 5. 内容系统规格

### 5.1 内容架构

```
内容分类：
├── 香港退休攻略 (/hk/blog)
│   ├── 强积金MPF
│   ├── 退休规划
│   └── 退休生活
├── 台湾退休攻略 (/tw/blog)
│   ├── 劳退劳保
│   ├── 退休规划
│   └── 退休生活
└── 通用退休知识 (/blog)
    ├── 退休心理
    ├── 投资策略基础
    └── 全球退休趋势
```

### 5.2 文章模板结构

每篇文章使用统一的 Markdown 结构：

```markdown
---
title: "文章标题（繁体中文）"
slug: "article-slug"
description: "Meta描述，150字以内（繁体中文）"
region: "hk | tw | all"          // 地区标签
category: "mpf | labor-pension | retirement-planning | retirement-life"
tags: ["退休", "MPF", "强积金"]    // 3-5个标签
publishedAt: "2024-01-15"
updatedAt: "2024-01-15"
readingTime: 8                     // 分钟
---

# 文章标题

> 文章导语（1-2句，概括核心价值）

## 目录（自动生成）

## 第一部分标题
正文...

## 第二部分标题
正文...

## 实用工具推荐
（嵌入对应计算器的卡片组件，带跳转链接）

## 常见问题 (FAQ)
（3-5个FAQ，使用 JSON-LD FAQPage schema）

## 总结
正文...

---
免责声明：本站内容仅供参考，不构成任何保险或投资建议。
```

### 5.3 种子文章清单（MVP阶段10篇）

| # | 标题 | 地区 | 分类 | 目标关键词 | 字数 |
|---|------|------|------|-----------|------|
| 1 | 2024 MPF强积金完全指南：从入门到退休提取 | HK | mpf | MPF calculator, 强积金 | 4000 |
| 2 | 香港退休需要几多钱？三个方法帮你计算 | HK | retirement-planning | 退休需要几多钱 | 3500 |
| 3 | MPF基金怎么选？三种类型回报率对比 | HK | mpf | MPF基金比较 | 4000 |
| 4 | 香港强积金供款上限调整对打工仔的影响 | HK | mpf | MPF供款上限 | 3000 |
| 5 | 劳退新制退休金怎么算？完整教学包你懂 | TW | labor-pension | 劳退试算 | 4000 |
| 6 | 劳保老年给付一次看懂：年金vs一次金怎么选 | TW | labor-pension | 劳保老年给付 | 4000 |
| 7 | 台湾退休金够吗？用这4个试算工具帮你算 | TW | retirement-planning | 退休金试算 | 3500 |
| 8 | 劳退自提6%划算吗？节税效果完整分析 | TW | labor-pension | 劳退自提 | 3000 |
| 9 | 退休后每月要花多少钱？通胀对你的影响有多大 | All | retirement-planning | 退休生活费 | 3500 |
| 10 | 40岁才开始规划退休，来得及吗？ | All | retirement-planning | 40岁退休规划 | 3000 |

### 5.4 AI 辅助内容生产流程

```
Step 1: AI 搜集素材
  - 搜索目标关键词的 SERP 前20结果
  - 提取标题、H2/H3结构、核心论点、数据引用
  
Step 2: AI 生成大纲
  - 基于素材分析，生成 5-7 个章节的大纲
  - 每个章节包含 2-3 个要点
  - 标注需要人工核实的数字和数据
  
Step 3: AI 生成初稿
  - 按大纲逐节生成 3000-5000 字繁体中文内容
  - 插入内链锚点（链接到计算器页面）
  - 生成 FAQ 部分
  
Step 4: 人工审核清单
  - [ ] 所有数字（利率、金额、法规引用）是否正确
  - [ ] 繁体中文是否地道（非简体转换体）
  - [ ] 是否包含具体案例和数据
  - [ ] 内链是否正确指向对应计算器/文章
  - [ ] Meta 描述是否在 150 字以内
  - [ ] 是否有 AI 味重的表述（"总而言之"、"值得注意的是"等需删除）
  
Step 5: 发布
  - 添加 frontmatter
  - 生成 OG Image（1200×630）
  - 提交到 Google Search Console
```

### 5.5 内容规范

**禁止的 AI 味道表述（出现即扣分）**：
- ❌ "总而言之"、"综上所述"
- ❌ "值得注意的是"、"不可忽视的是"
- ❌ "让我们一起来看看"
- ❌ "在当今社会"
- ❌ "众所周知"
- ❌ 每段开头都用相同的连接词

**要求的写作风格**：
- ✅ 使用短句（平均句长 < 20 字）
- ✅ 每2-3段插入一个数据/案例/引用
- ✅ 使用具体数字而非模糊表述（"约HKD 5,000" 而非 "一笔不少的钱"）
- ✅ 港式繁体用词：打工仔、供款、强积金、入息
- ✅ 台式繁体用词：上班族、提缴、劳保、月投保薪资
- ✅ 使用第二人称"你"（港台习惯，非"您"）

---

## 6. 技术架构

### 6.1 技术栈详情

| 技术 | 版本 | 用途 | 备注 |
|------|------|------|------|
| Next.js | 14.x (App Router) | 框架 | 必须使用 App Router，不用 Pages Router |
| TypeScript | 5.x | 类型系统 | strict mode |
| Tailwind CSS | 3.x | 样式 | 不用 styled-components 或 CSS Modules |
| shadcn/ui | 最新 | 组件库 | 按需引入，不全量安装 |
| Vercel | — | 部署 | 免费 Hobby plan |
| MDX | 最新 | 文章内容 | 文章用 .mdx 格式，支持组件嵌入 |
| next-intl | 最新 | 国际化 | 仅用于繁中港式/台式的文案差异，不做多语言 |

### 6.2 项目目录结构

```
retirement-tools/
├── .github/
│   └── workflows/
│       └── deploy.yml               # Vercel自动部署（Vercel集成则不需要）
├── public/
│   ├── og/                          # OG Image 模板
│   │   └── default-og.png
│   ├── fonts/
│   │   ├── NotoSansTC-Regular.woff2
│   │   └── NotoSansTC-Bold.woff2
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout（全局Header/Footer/字体）
│   │   ├── page.tsx                 # 首页
│   │   ├── not-found.tsx            # 404页面
│   │   ├── globals.css              # 全局样式（Tailwind指令）
│   │   │
│   │   ├── [region]/                # 地区路由组 (hk | tw)
│   │   │   ├── layout.tsx           # 地区layout（地区Banner、导航差异）
│   │   │   ├── page.tsx             # 地区首页
│   │   │   ├── tools/
│   │   │   │   ├── retirement-gap-calculator/page.tsx
│   │   │   │   ├── living-cost-planner/page.tsx
│   │   │   │   ├── mpf-calculator/page.tsx       # 仅 hk 可访问
│   │   │   │   └── labor-pension-calculator/page.tsx  # 仅 tw 可访问
│   │   │   └── blog/
│   │   │       ├── page.tsx         # 地区博客列表
│   │   │       └── [slug]/page.tsx  # 文章详情
│   │   │
│   │   ├── tools/                   # 通用工具页（无地区前缀）
│   │   │   ├── retirement-gap-calculator/page.tsx
│   │   │   └── living-cost-planner/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── about/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── disclaimer/page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── RegionSwitcher.tsx
│   │   │   └── Breadcrumb.tsx
│   │   │
│   │   ├── calculators/
│   │   │   ├── RetirementGapCalculator.tsx      # 主组件（组合下面子组件）
│   │   │   ├── RetirementGapForm.tsx            # 输入表单
│   │   │   ├── RetirementGapResult.tsx          # 结果展示
│   │   │   ├── LivingCostPlanner.tsx
│   │   │   ├── LivingCostForm.tsx
│   │   │   ├── LivingCostResult.tsx
│   │   │   ├── MPFCalculator.tsx
│   │   │   ├── MPFForm.tsx
│   │   │   ├── MPFResult.tsx
│   │   │   ├── LaborPensionCalculator.tsx
│   │   │   ├── LaborPensionForm.tsx
│   │   │   └── LaborPensionResult.tsx
│   │   │
│   │   ├── shared/
│   │   │   ├── CalculatorCard.tsx     # 计算器外壳卡片
│   │   │   ├── InputField.tsx         # 统一输入框（带label+错误提示）
│   │   │   ├── NumberInput.tsx        # 数字输入（步进器）
│   │   │   ├── SelectField.tsx        # 下拉选择
│   │   │   ├── SliderInput.tsx        # 滑块输入（回报率等）
│   │   │   ├── ResultCard.tsx         # 结果卡片
│   │   │   ├── Tooltip.tsx           # 提示tooltip
│   │   │   ├── Disclaimer.tsx         # 免责声明组件
│   │   │   ├── CalculatorWidget.tsx   # 文章内嵌计算器缩略卡片
│   │   │   ├── ProgressBar.tsx        # 简易进度条（CSS实现）
│   │   │   ├── BarChart.tsx           # 简易柱状图（CSS实现）
│   │   │   ├── PieChart.tsx           # 简易饼图（CSS conic-gradient）
│   │   │   ├── ComparisonTable.tsx    # 情景对比表格
│   │   │   ├── FAQSection.tsx         # FAQ手风琴
│   │   │   ├── TableOfContents.tsx    # 文章目录
│   │   │   └── ShareButtons.tsx       # 分享按钮
│   │   │
│   │   └── seo/
│   │       ├── JsonLd.tsx            # JSON-LD 结构化数据
│   │       └── MetaTags.tsx          # Meta 标签组件
│   │
│   ├── lib/
│   │   ├── calculations/
│   │   │   ├── retirement-gap.ts     # 退休缺口计算逻辑
│   │   │   ├── living-cost.ts        # 生活费计算逻辑
│   │   │   ├── mpf.ts                # MPF计算逻辑
│   │   │   ├── labor-pension.ts      # 劳退劳保计算逻辑
│   │   │   └── utils.ts             # 通用数学工具函数
│   │   │
│   │   ├── constants/
│   │   │   ├── mpf-constants.ts      # MPF制度常量
│   │   │   ├── taiwan-constants.ts   # 台湾劳保常量
│   │   │   ├── expense-categories.ts # 生活费分类默认值
│   │   │   └── site-config.ts        # 站点配置
│   │   │
│   │   ├── types/
│   │   │   ├── calculator.ts         # 计算器类型定义
│   │   │   ├── article.ts            # 文章类型定义
│   │   │   └── region.ts            # 地区类型定义
│   │   │
│   │   ├── hooks/
│   │   │   ├── useCalculator.ts      # 计算器通用hook
│   │   │   ├── useRegion.ts          # 地区判断hook
│   │   │   └── useLocalStorage.ts    # localStorage封装
│   │   │
│   │   ├── utils/
│   │   │   ├── format-currency.ts    # 货币格式化（HKD/TWD）
│   │   │   ├── format-number.ts      # 数字格式化（千分位）
│   │   │   ├── cn.ts                 # className合并（clsx + tailwind-merge）
│   │   │   └── constants.ts          # 通用常量
│   │   │
│   │   └── seo/
│   │       ├── generate-metadata.ts  # 动态metadata生成
│   │       └── json-ld-templates.ts  # JSON-LD模板
│   │
│   ├── content/
│   │   ├── articles/
│   │   │   ├── hk/
│   │   │   │   ├── mpf-complete-guide.mdx
│   │   │   │   ├── how-much-for-retirement.mdx
│   │   │   │   ├── mpf-fund-comparison.mdx
│   │   │   │   └── mpf-contribution-limit.mdx
│   │   │   ├── tw/
│   │   │   │   ├── labor-pension-guide.mdx
│   │   │   │   ├── labor-insurance-benefit.mdx
│   │   │   │   ├── retirement-calculator.mdx
│   │   │   │   └── voluntary-contribution-tax.mdx
│   │   │   └── general/
│   │   │       ├── retirement-living-cost.mdx
│   │   │       └── start-planning-at-40.mdx
│   │   └── categories.ts            # 分类配置
│   │
│   └── config/
│       ├── navigation.ts            # 导航配置
│       ├── regions.ts               # 地区配置
│       └── calculator-defaults.ts   # 计算器默认值配置
│
├── messages/                        # i18n文案（港式/台式差异文案）
│   ├── hk.json
│   └── tw.json
│
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── package.json
└── README.md
```

### 6.3 数据流架构

```
┌──────────────────────────────────────────────────────┐
│                    页面组件 (Page)                      │
│  例: /hk/tools/mpf-calculator/page.tsx                │
├──────────────────────────────────────────────────────┤
│  1. generateMetadata() → SEO元数据（SSG）              │
│  2. 渲染 <MPFCalculator /> 客户端组件                    │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│              MPFCalculator.tsx (Client Component)      │
│  'use client'                                         │
│  - useState: 管理表单输入状态                            │
│  - useCalculator hook: 封装计算逻辑                      │
│  - useRegion hook: 获取当前地区                          │
├──────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐                  │
│  │  MPFForm     │───→│ 计算引擎      │                  │
│  │  (输入表单)  │    │  (lib/        │                  │
│  └─────────────┘    │  calculations/ │                  │
│                      │  mpf.ts)      │                  │
│                     └──────┬───────┘                  │
│                            │                           │
│                     ┌──────▼───────┐                  │
│                     │  MPFResult   │                  │
│                     │  (结果展示)   │                   │
│                     └──────────────┘                  │
└──────────────────────────────────────────────────────┘
```

**关键原则**：
1. 计算逻辑（`lib/calculations/*.ts`）是**纯函数**，不依赖任何 React/浏览器 API
2. 所有计算器组件标记 `'use client'`，状态在客户端管理
3. 页面级组件（`app/.../page.tsx`）使用 SSR/SSG 生成 metadata
4. **零 API 路由**（`app/api/`），所有计算在浏览器完成

### 6.4 组件规范

#### 6.4.1 组件拆分原则

```
页面级（Server Component）：
  - 仅负责 generateMetadata 和布局
  - 不包含交互逻辑
  - 导入并渲染客户端计算器组件

计算器级（Client Component）：
  - 每个计算器一个主组件（如 MPFCalculator.tsx）
  - 内部拆分为 Form + Result 两个子组件
  - 使用 useState 管理表单状态
  - 计算结果通过 useMemo 派生（不单独 useState）

共享组件：
  - InputField, NumberInput, SliderInput 等通用输入
  - ResultCard, ComparisonTable 等通用展示
  - 全部为无状态或最小状态组件
```

#### 6.4.2 命名约定

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 页面文件 | `page.tsx` | `app/hk/tools/mpf-calculator/page.tsx` |
| 布局文件 | `layout.tsx` | `app/[region]/layout.tsx` |
| React组件 | PascalCase | `MPFCalculator.tsx` |
| 工具函数 | kebab-case | `format-currency.ts` |
| 类型文件 | kebab-case | `calculator.ts` |
| 常量文件 | kebab-case | `mpf-constants.ts` |
| Hook | `use` 前缀 + camelCase | `useCalculator.ts` |
| CSS类名 | Tailwind utility | 不写自定义CSS |
| 常量名 | UPPER_SNAKE_CASE | `MPF_CONSTANTS` |
| 接口/类型 | `I` 前缀（接口）/ PascalCase（类型） | `ICalculatorInput` / `CalculatorResult` |

#### 6.4.3 TypeScript 类型定义示例

```typescript
// src/lib/types/calculator.ts

export type Region = 'hk' | 'tw';

// 退休缺口计算器
export interface RetirementGapInput {
  currentAge: number;
  retireAge: number;
  targetMonthlyIncome: number;
  annualReturnRate: number;
  inflationRate: number;
  retirementYears: number;
  currentSavings: number;
  region: Region;
}

export interface RetirementGapResult {
  totalNeeded: number;          // 退休需要的总本金
  currentSavingsFV: number;     // 现有储蓄终值
  gap: number;                  // 缺口
  monthlyPMT: number;           // 每月需储蓄金额
  isSufficient: boolean;        // 现有储蓄是否足够
  scenarios: {
    optimistic: RetirementGapResult;
    base: RetirementGapResult;
    conservative: RetirementGapResult;
  };
}

// MPF 计算器
export interface MPFInput {
  monthlyRelevantIncome: number;
  currentAge: number;
  withdrawAge: number;
  currentMPFBalance: number;
  fundReturnRate: number;
  fundType: 'conservative' | 'balanced' | 'growth';
  isSelfEmployed: boolean;
  voluntaryContribution: number;
}

export interface MPFResult {
  totalAccumulated: number;
  employeeContributionTotal: number;
  employerContributionTotal: number;
  voluntaryContributionTotal: number;
  investmentReturn: number;
  monthlyContributions: {
    employee: number;
    employer: number;
    voluntary: number;
    total: number;
  };
  yearByYear: Array<{
    age: number;
    balance: number;
    totalContributed: number;
  }>;
}
```

---

## 7. 设计规范

### 7.1 设计理念

**日系简约 + 专业信任感**。参考 Japanese Minimal UI 风格，避免花哨装饰，用留白和排版传递专业感。

**设计参考**：
- 色彩：无印良品、LINE Bank 官网
- 排版：Medium、Notion
- 工具感：Wise (TransferWise) 的计算器页面

### 7.2 配色方案

```
/* Tailwind Config 扩展 */
colors: {
  // 主色调 - 温暖的中性色系（传递信任+温暖感）
  primary: {
    50:  '#F5F3F0',   // 背景色（极浅暖灰）
    100: '#E8E4DD',   // 卡片边框
    200: '#D4CFC5',   // 分割线
    300: '#B5AFA3',   // 次要文字
    400: '#968E7E',   // 辅助文字
    500: '#7A7265',   // 正文文字
    600: '#5C554A',   // 标题文字
    700: '#3D3830',   // 深色标题
    800: '#2A261F',   // 最深色（Footer背景）
    900: '#1A1814',   // 接近纯黑
  },
  
  // 强调色 - 用于计算器结果、CTA按钮
  accent: {
    50:  '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',   // 主CTA按钮背景
    600: '#EA580C',   // 按钮hover
    700: '#C2410C',
  },
  
  // 功能色
  success: '#16A34A',   // 正值/达标
  warning: '#EAB308',   // 警告提示
  danger:  '#DC2626',   // 缺口/负值
  info:    '#2563EB',   // 信息提示
  
  // 表面色
  surface: {
    DEFAULT: '#FFFFFF',
    secondary: '#FAFAF8',   // 次级背景
    tertiary: '#F5F5F0',    // 三级背景
  },
}
```

### 7.3 字体方案

```typescript
// tailwind.config.ts 字体配置
fontFamily: {
  // 繁体中文字体 - 使用 Google Fonts 的 Noto Sans TC
  sans: [
    '"Noto Sans TC"',          // 繁体中文
    '"Noto Sans HK"',          // 香港繁体中备用
    '"PingFang TC"',           // macOS 繁体中文
    '"Microsoft JhengHei"',    // Windows 繁体中文
    'sans-serif',
  ],
  // 数字使用等宽字体（计算器结果对齐）
  mono: [
    '"JetBrains Mono"',
    '"SF Mono"',
    'monospace',
  ],
}

// 字体大小规范（基于 1.25 的缩放比例，modular scale）
// 移动端基准 16px，桌面端 18px
fontSize: {
  'display':  ['2.5rem',  { lineHeight: '1.2', fontWeight: '700' }],   // 40px - 大标题
  'h1':      ['2rem',     { lineHeight: '1.3', fontWeight: '700' }],   // 32px
  'h2':      ['1.5rem',   { lineHeight: '1.4', fontWeight: '600' }],   // 24px
  'h3':      ['1.25rem',  { lineHeight: '1.4', fontWeight: '600' }],   // 20px
  'body':    ['1rem',     { lineHeight: '1.75', fontWeight: '400' }],  // 16px
  'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],   // 14px
  'caption': ['0.75rem',  { lineHeight: '1.5', fontWeight: '400' }],   // 12px
  'result':  ['3rem',     { lineHeight: '1', fontWeight: '700' }],     // 48px - 计算器结果数字
}
```

### 7.4 间距系统

```
使用 4px 基础网格，Tailwind 默认间距（1 unit = 4px）：

组件内间距：
  - 计算器卡片内边距：p-6 (24px) 移动端, p-8 (32px) 桌面端
  - 输入框间距：mb-4 (16px) 每个字段之间
  - 结果卡片间距：gap-4 (16px)

页面间距：
  - 页面顶部（导航下方）：pt-8 (32px) 移动端, pt-12 (48px) 桌面端
  - 页面底部（Footer上方）：pb-12 (48px)
  - 内容区块间距：space-y-12 (48px) 或 space-y-16 (64px)

区块间距：
  - 区块标题与内容：mb-6 (24px)
  - 段落间距：mb-4 (16px)
  - 列表项间距：space-y-2 (8px)

最大内容宽度：max-w-4xl (896px)，居中 mx-auto
```

### 7.5 响应式断点

```typescript
// 使用 Tailwind 默认断点
screens: {
  'sm':  '640px',   // 大屏手机横屏
  'md':  '768px',   // 平板
  'lg':  '1024px',  // 小桌面
  'xl':  '1280px',  // 大桌面
  '2xl': '1536px',  // 超大屏
}

// 移动端优先策略：
// - 默认样式 = 移动端（< 640px）
// - md: 前缀 = 平板端
// - lg: 前缀 = 桌面端

// 关键布局差异：
// 移动端：计算器全宽，输入和结果上下排列
// 桌面端：计算器居中 max-w-2xl，表单和结果左右排列（部分计算器）
// 导航：移动端汉堡菜单，桌面端水平导航
```

### 7.6 组件样式规范

#### 计算器卡片

```html
<!-- 卡片容器 -->
<div class="
  bg-white 
  rounded-2xl           <!-- 16px 圆角 -->
  shadow-sm             <!-- 轻微阴影 -->
  border border-primary-100
  p-6 md:p-8
  max-w-2xl mx-auto
">

<!-- 输入区域 -->
<div class="space-y-4 mb-8">

<!-- 输入框 -->
<div class="flex flex-col gap-1">
  <label class="text-body-sm font-medium text-primary-600">
    当前年龄 <span class="text-caption text-primary-400">（岁）</span>
  </label>
  <input class="
    w-full
    h-12 px-4
    border border-primary-200
    rounded-xl           <!-- 12px 圆角 -->
    text-body font-medium
    text-primary-700
    placeholder:text-primary-300
    focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500
    transition-colors
  " />
</div>

<!-- 计算按钮 -->
<button class="
  w-full h-12
  bg-accent-500 text-white
  font-semibold text-body
  rounded-xl
  hover:bg-accent-600
  active:bg-accent-700
  transition-colors
  disabled:opacity-50 disabled:cursor-not-allowed
">
  立即计算
</button>

<!-- 结果数字 -->
<div class="text-result text-primary-900 font-mono">
  HKD 6,234,000
</div>
```

#### 颜色使用规则

| 元素 | 颜色 |
|------|------|
| 页面背景 | `bg-primary-50` 或 `bg-surface-secondary` |
| 卡片背景 | `bg-surface`（白色）|
| 主标题 | `text-primary-700` |
| 正文 | `text-primary-500` |
| 辅助文字 | `text-primary-400` |
| CTA按钮 | `bg-accent-500 text-white` |
| 正向数值（达标） | `text-success` |
| 负向数值（缺口） | `text-danger` |
| 警告提示 | `bg-warning/10 text-warning border-warning/20` |
| 链接 | `text-accent-600 hover:text-accent-700 underline` |

### 7.7 禁止的设计元素

- ❌ 渐变背景（gradient）— 过于花哨
- ❌ 大圆角超过 `rounded-2xl`（16px）
- ❌ 粗重阴影（shadow-xl 以上）— 除Modal外
- ❌ 动画效果超过 200ms
- ❌ 使用 emoji 作为UI图标（可用在内容中）
- ❌ 超过3种颜色同时出现在同一视图中
- ❌ 任何"AI生成"风格的插画或图标

---

## 8. SEO 策略

### 8.1 关键词策略

#### 8.1.1 核心关键词矩阵

| 关键词 | 月搜索量（估） | 难度 | 对应页面 |
|--------|--------------|------|---------|
| MPF计算器 | 2,400 | 中 | /hk/tools/mpf-calculator |
| 强积金计算 | 1,600 | 中 | /hk/tools/mpf-calculator |
| 劳退试算 | 3,200 | 中 | /tw/tools/labor-pension-calculator |
| 劳保老年给付 | 2,800 | 中 | /tw/tools/labor-pension-calculator |
| 退休金计算 | 1,900 | 低 | /tools/retirement-gap-calculator |
| 退休规划 | 1,200 | 中 | /blog + /tools |
| 退休几多钱 | 880 | 低 | /hk/blog/how-much-for-retirement |
| 退休金够唔够 | 720 | 低 | /hk/blog |

#### 8.1.2 关键词分配原则

- **每个页面瞄准 1 个主关键词 + 2-3 个长尾词**
- **计算器页面**：瞄准"计算器/试算/怎么算"类工具词
- **博客文章**：瞄准"怎么规划/够不够/完全指南"类信息词
- **内链策略**：博客文章中自然嵌入计算器链接，锚文本使用目标关键词

### 8.2 技术 SEO

#### 8.2.1 Meta 标签规范

```typescript
// 每个页面必须包含
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `${pageTitle} | 站名`,               // ≤ 60字符
    description: pageDescription,                 // ≤ 155字符
    alternates: {
      canonical: `https://domain.com${pathname}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: [{ url: `/og/${slug}.png`, width: 1200, height: 630 }],
      locale: 'zh_TW',  // 或 zh_HK
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
```

#### 8.2.2 JSON-LD 结构化数据

**计算器页面** — 使用 `WebApplication` schema：

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MPF强积金计算器",
  "description": "根据月薪和供款比例，估算强积金退休累积金额",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0" }
}
```

**博客文章** — 使用 `Article` + `FAQPage` schema：

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "author": { "@type": "Organization", "name": "站名" },
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-15"
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "问题文本",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "答案文本"
      }
    }
  ]
}
```

#### 8.2.3 技术SEO清单

- [ ] `robots.txt`：允许所有爬虫，指向 sitemap
- [ ] `sitemap.xml`：自动生成（使用 `next-sitemap`）
- [ ] 所有图片使用 `<img alt="描述文字">` 和 `loading="lazy"`
- [ ] 内部链接使用描述性锚文本，不使用"点击这里"
- [ ] URL 使用 kebab-case，不含中文（中文标题在 URL 中用英文 slug）
- [ ] H1 每页仅一个，H2-H6 层级正确嵌套
- [ ] 404 页面自定义，包含搜索框和热门链接
- [ ] 页面加载速度：LCP < 2.5s（通过 Vercel Edge Network 保障）

### 8.3 内容 SEO

- 每篇文章 3000-5000 字，覆盖目标关键词的所有子话题
- 文章开头前 100 字包含主关键词
- 每篇文章至少 3 个 H2 标题包含长尾关键词
- 每篇文章包含 1 个内链指向相关计算器
- 每篇文章包含 FAQ 部分（3-5个问题，匹配"人们也在问"）
- 定期更新：每季度检查数据是否过期（利率、法例上限等）

---

## 9. 合规要求

### 9.1 免责声明

**全站通用免责（放在 Footer）**：

```
本站内容仅供参考，不构成任何保险、投资或财务建议。计算器结果基于用户输入的参数和假设条件，实际结果可能因市场变化、政策调整等因素而有所不同。在做出任何财务决策前，请咨询持牌专业人士。
```

**计算器页面免责（放在结果区域下方）**：

```
⚠️ 以上计算结果仅为估算，基于您输入的参数和预设假设。实际退休金金额取决于市场表现、政策变动及个人情况。此工具不构成任何投资建议。
```

**香港 MPF 计算器额外免责**：

```
本计算器基于强制性公积金计划条例的现行规定进行估算。强积金管理局可能会调整供款上限及相关规定，请以积金局官方公布的最新数据为准。
```

**台湾劳退计算器额外免责**：

```
本计算器依据劳工退休金条例及劳工保险条例之现行规定进行试算。劳保年金给付金额受投保薪资调整、法令变更等因素影响，实际金额以劳工保险局核定为准。
```

### 9.2 隐私政策

- 使用 Vercel Analytics 收集匿名访问数据（页面浏览量、设备类型）
- **不使用任何第三方追踪 Cookie**（除 AdSense 标准 Cookie 外）
- 计算器数据**仅在浏览器端计算，不发送到服务器**
- 隐私政策页面列出：收集什么数据、为什么收集、保留多久、用户权利

### 9.3 数据收集

| 数据 | 收集方式 | 用途 | 存储位置 |
|------|---------|------|---------|
| 页面浏览量 | Vercel Analytics | 流量分析 | Vercel 服务器 |
| 计算器输入 | 浏览器 localStorage | 用户恢复上次输入 | 用户浏览器本地 |
| 地区偏好 | localStorage | 记住用户选择的地区 | 用户浏览器本地 |
| AdSense Cookie | Google 脚本 | 广告投放 | Google 服务器 |

**不收集**：用户姓名、邮箱、电话号码、计算器输入的财务数据（不上传服务器）

### 9.4 Cookie 同意

由于目标市场（香港/台湾）对 Cookie 同意有法律要求：

- 首次访问显示 Cookie 横幅
- 仅必要 Cookie 不需要同意
- AdSense Cookie 需要用户明确同意
- 横幅文案：简洁一句 + "接受"/"仅必要"两个按钮

---

## 10. MVP 范围定义与分期规划

### 10.1 MVP（第1-4周）

**必须完成（P0）**：

| 模块 | 内容 | 验收标准 |
|------|------|---------|
| 基础框架 | Next.js + Tailwind + shadcn/ui | `npm run dev` 启动无报错 |
| 布局 | Header + Footer + 移动端导航 | 导航可点击，地区切换可工作 |
| 计算器1 | 退休缺口计算器 | 输入→计算→结果全流程跑通 |
| 计算器2 | 退休生活费规划器 | 同上 |
| 计算器3 | MPF强积金计算器 | 同上，香港路径可访问 |
| 计算器4 | 劳退劳保试算器 | 同上，台湾路径可访问 |
| SEO基础 | sitemap + robots.txt + 基础 meta | Google 可抓取 |
| 部署 | Vercel 部署 | 生产环境可访问 |
| 合规 | 免责声明 + 隐私政策页面 | 页面存在且文案正确 |

**MVP 不做（P1/P2）**：
- ❌ 博客文章（后续迭代）
- ❌ AdSense 接入（等有流量后）
- ❌ Cookie 同意横幅（AdSense 接入时再加）
- ❌ OG Image 自动生成
- ❌ 社交分享功能

### 10.2 V1.0（第5-8周）

- 10篇种子文章发布
- 博客列表页 + 文章详情页
- AdSense 接入
- Cookie 同意横幅
- OG Image 生成
- 计算器结果可复制/分享（URL参数）
- Google Search Console 提交

### 10.3 V1.5（第9-12周）

- 追加 5-10 篇文章
- 联盟营销链接嵌入文章
- 计算器结果截图功能（html2canvas）
- 相关文章推荐
- 性能优化（Lighthouse 90+）

### 10.4 V2.0（第13周+）

- 咨询导流表单
- 邮件订阅功能（Resend + 前端表单）
- 社交分享优化（Twitter Card、LINE Share）
- 更多计算器工具（如：通胀计算器、投资收益计算器）

---

## 11. 开发注意事项

### 11.1 禁止事项清单（违反即打回）

| # | 禁止事项 | 原因 |
|---|---------|------|
| 1 | ❌ 禁止使用任何外部 API 或后端服务 | 零成本约束 |
| 2 | ❌ 禁止使用 `styled-components` / `emotion` / CSS Modules | 统一使用 Tailwind |
| 3 | ❌ 禁止使用 `Pages Router` | 必须使用 App Router |
| 4 | ❌ 禁止使用 `any` 类型 | TypeScript strict mode |
| 5 | ❌ 禁止在客户端使用 `eval()` 或 `new Function()` | 安全风险 |
| 6 | ❌ 禁止使用 Chart.js / Recharts 等图表库 | 用 CSS 实现简易图表，减少 bundle size |
| 7 | ❌ 禁止硬编码货币符号（HK$ 或 NT$），必须根据 region 动态切换 | 地区适配 |
| 8 | ❌ 禁止使用简体中文 UI 文案（包括注释） | 繁体中文市场 |
| 9 | ❌ 禁止计算器结果不显示千分位分隔符 | 可读性 |
| 10 | ❌ 禁止在 `<input type="number">` 显示浏览器默认上下箭头 | 用自定义步进器 |
| 11 | ❌ 禁止文章中使用 "值得注意的是"、"总而言之" 等AI味道表述 | 内容质量 |
| 12 | ❌ 禁止 MPF 计算器允许 age < 18 或 age ≥ 65 | 制度规则 |
| 13 | ❌ 禁止使用 `console.log` 保留在生产代码中 | 代码质量 |
| 14 | ❌ 禁止单文件超过 300 行 | 必须拆分组件 |
| 15 | ❌ 禁止使用 `!important` CSS 覆盖 | 使用 Tailwind 优先级机制 |

### 11.2 常见坑与解决方案

#### 坑1：繁体中文渲染乱码
```
问题：Next.js 默认字体不包含繁体中文字符
解决：在 layout.tsx 中显式加载 Noto Sans TC
实现：使用 next/font/google 的 Noto_Sans_TC，设置 subsets: ['chinese-traditional']
```

#### 坑2：台湾劳保常量过期
```
问题：投保薪资上限、最低入息等会定期调整
解决：所有制度常量集中放在 constants 文件
要求：每个常量加注释标注数据来源和最后更新日期
格式：// 数据来源：劳动部劳工保险局 | 更新日期：2024-01
```

#### 坑3：数字输入的小数点问题
```
问题：input type="number" 允许输入小数，但年龄字段应为整数
解决：
  - 年龄、年数等字段：onChange 中 Math.floor(value)，禁用小数点输入
  - 金额字段：允许整数，步进器按千为单位
  - 比率字段（回报率、通胀率）：允许一位小数
```

#### 坑4：地区路由与工具页的交叉问题
```
问题：MPF 计算器只在 /hk/ 路径下有意义，在 /tw/ 路径下应该 404 或重定向
解决：
  - 在 [region]/tools/ 下使用 generateStaticParams 控制
  - hk: 生成 mpf-calculator 页面
  - tw: 生成 labor-pension-calculator 页面
  - 两个地区都生成通用计算器页面
```

#### 坑5：localStorage 在 SSR 时不存在
```
问题：SSR 阶段访问 localStorage 报错
解决：
  - 使用 useEffect + useState 延迟读取 localStorage
  - 或封装 useLocalStorage hook，服务端返回默认值
```

#### 坑6：Vercel 免费方案的限制
```
问题：Hobby plan 有 Serverless Function 执行时间限制（10秒）和内存限制（1024MB）
解决：本项目的计算逻辑全在客户端，不使用 Serverless Function，不受此限制
注意：不要创建任何 app/api/ 路由，避免触发 Serverless Function
```

### 11.3 代码规范

#### ESLint 配置要求

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/strict"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react/no-unescaped-entities": "off"
  }
}
```

#### Prettier 配置

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

#### Git 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 样式调整（不影响逻辑）
refactor: 重构（不影响功能）
perf: 性能优化
chore: 构建/工具更新
```

### 11.4 性能要求

| 指标 | 目标值 | 测量工具 |
|------|--------|---------|
| LCP | < 2.5s | Lighthouse |
| FID / INP | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| TTFB | < 800ms | Vercel Analytics |
| Bundle Size (首屏JS) | < 150KB gzipped | `@next/bundle-analyzer` |
| 首页 Lighthouse 总分 | ≥ 90 | Lighthouse |

### 11.5 测试要求

MVP 阶段最低测试覆盖：
- 四个计算器的计算逻辑（`lib/calculations/*.ts`）：**必须有单元测试**
- 使用 Vitest 或 Jest
- 测试用例覆盖：正常输入、边界值、极端值
- 每个计算器至少 5 个测试用例

```typescript
// 示例：lib/calculations/__tests__/retirement-gap.test.ts
describe('retirementGapCalculator', () => {
  it('should calculate correct gap for standard inputs', () => {
    const result = calculateRetirementGap({
      currentAge: 30,
      retireAge: 65,
      targetMonthlyIncome: 20000,
      annualReturnRate: 5,
      inflationRate: 2.5,
      retirementYears: 25,
      currentSavings: 100000,
      region: 'hk',
    });
    expect(result.gap).toBeGreaterThan(0);
    expect(result.monthlyPMT).toBeGreaterThan(0);
    expect(result.isSufficient).toBe(false);
  });

  it('should return isSufficient=true when savings exceed needed', () => {
    // ...
  });

  it('should handle zero return rate', () => {
    // ...
  });

  it('should handle inflation > return rate', () => {
    // ...
  });

  it('should return zero PMT when gap is negative', () => {
    // ...
  });
});
```

---

## 附录 A：货币格式化函数

```typescript
// src/lib/utils/format-currency.ts

type Currency = 'HKD' | 'TWD';

const CURRENCY_CONFIG: Record<Currency, { symbol: string; locale: string; code: string }> = {
  HKD: { symbol: 'HK$', locale: 'zh-HK', code: 'HKD' },
  TWD: { symbol: 'NT$', locale: 'zh-TW', code: 'TWD' },
};

export function formatCurrency(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency];
  
  // 使用 Intl.NumberFormat 确保千分位和格式正确
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

// 示例：
// formatCurrency(6234000, 'HKD') → "HK$6,234,000"
// formatCurrency(1234567, 'TWD') → "NT$1,234,567"
```

## 附录 B：计算公式验证用例

### 退休缺口计算器验证

```
输入：
  currentAge = 30, retireAge = 65, targetMonthlyIncome = 20,000
  annualReturnRate = 5%, inflationRate = 2.5%, retirementYears = 25
  currentSavings = 100,000, region = hk

手动验证：
  r = (1.05/1.025) - 1 = 0.02439/12 = 0.002033（月实际回报率）
  n = 25 × 12 = 300 个月
  FV_needed = 20000 × [1 - (1.002033)^(-300)] / 0.002033
            = 20000 × [1 - 0.5439] / 0.002033
            = 20000 × 224.35
            ≈ 4,487,000 HKD（约数，精确值需计算器验证）
  
  Y = 35年, M = 420月, i = 0.05/12 = 0.004167
  FV_current = 100,000 × (1.05)^35 = 100,000 × 5.516 = 551,600
  Gap = 4,487,000 - 551,600 = 3,935,400
  PMT = 3,935,400 × 0.004167 / [(1.004167)^420 - 1]
      = 3,935,400 × 0.004167 / [5.789 - 1]
      = 3,935,400 × 0.004167 / 4.789
      ≈ 3,430 HKD/月

→ 开发者实现后应对照此范围验证，误差 < 1% 为通过
```

### MPF 计算器验证

```
输入：
  monthlyRelevantIncome = 25,000, currentAge = 30, withdrawAge = 65
  currentMPFBalance = 100,000, fundReturnRate = 5%, isSelfEmployed = false
  voluntaryContribution = 0

手动验证：
  relevantIncome = min(25000, 30000) = 25,000
  雇员月供 = min(25000 × 0.05, 1500) = 1,250
  雇主月供 = min(25000 × 0.05, 1500) = 1,250
  总月供 = 2,500
  
  M = 35 × 12 = 420 月
  月回报率 = 0.05/12 = 0.004167
  FV_balance = 100,000 × (1.004167)^420 = 100,000 × 5.789 = 578,900
  FV_contributions = 2,500 × [(1.004167)^420 - 1] / 0.004167
                   = 2,500 × 4.789 / 0.004167
                   = 2,500 × 1,149.3
                   ≈ 2,873,250
  totalAccumulated = 578,900 + 2,873,250 = 3,452,150 HKD
```

---

> **文档结束**  
> 如有疑问，请在此 PRD 的 GitHub Issue 中提出，请勿直接修改本文档。
