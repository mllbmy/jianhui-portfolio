/* 内容数据：方法、研究流程、竞赛叙事、详情弹层文案 */
window.SITE_CONTENT=(function(){
 const methods=[
  ['01 / 定义问题','先明确要解决什么。','把需求拆成可执行任务，给出目标、边界和验收方式，再交给 AI 辅助实现。'],
  ['02 / 组织分工','让不同 AI 各有任务。','按开发、分析、文稿等任务分配工作，共享必要上下文，再汇总各部分输出。'],
  ['03 / 人工复核','生成之后，由我判断。','审核代码、逻辑与文稿，比较不同输出，定位问题并提出具体修改要求。'],
  ['04 / 测试迭代','把结果放回场景检验。','运行功能、检查数据与图表，依据测试反馈修正，再推进作品与稿件。']
 ];
 const research=[
  ['01 / 研究问题','从一个值得验证的问题开始。','围绕祁连山生态安全评价，考察观测频率对评价与预测可靠性的影响，确定研究问题与分析路径。',['生态安全','观测频率','预测可靠性']],
  ['02 / 数据准备','把历史观测整理成分析输入。','使用 Python 处理 2005—2023 年历史观测数据，组织生态指标与分析流程，由我驱动 AI 实现并复核。',['Python','历史观测','数据处理']],
  ['03 / 模型与验证','比较模型，也检验适用范围。','比较 GM(1,1)、NGBM 与 ARIMA，开展滚动验证、敏感性分析与空间对照，检查预测的可靠性。',['3 类模型','滚动验证','敏感性分析']],
  ['04 / 多 AI 协作','三个 AI 分工，我负责统筹。','由我分配代码、分析、图表和文稿等工作，汇总并审核不同输出，反复检查与迭代。',['任务分工','交叉检查','人工审核']],
  ['05 / 期刊投稿','把完整研究整理成稿件。','完成正文、方法、图表与参考文献，以第一作者向 Journal of Mountain Science 投稿。目前处于期刊投稿中。',['第一作者','完整稿件','投稿中']]
 ];
 const honors=[
  {event:'第八届码蹄杯全国大学生程序设计大赛',result:'国赛银奖 / 省赛金奖',task:'个人赛，限定时间内完成算法题，通过在线评测检验代码。',practice:'使用 Python 拆解问题、编程与调试，依据评测反馈检查边界条件。',proof:'mati-national-silver'},
  {event:'第十七届中国大学生服务外包创新创业大赛',result:'全国赛三等奖 / 初赛小组第一',task:'围绕企业需求，开发辅助职业探索与规划的智能体作品。',practice:'独立开发网站，整合岗位探索、发展路径、成长方案与 AI 简历解析。',proof:'outsourcing-national-third'},
  {event:'中国高校计算机大赛 · 移动应用创新赛',result:'华南赛区一等奖',task:'从视障出行场景出发，完成 SoundLane 移动应用交互原型。',practice:'独立推进需求、交互、AI 辅助开发、功能测试、作品文档与答辩。',proof:'soundlane-mobile-first'},
  {event:'广东省大学生计算机设计大赛',result:'机器人视觉系统挑战赛初赛三等奖',task:'围绕视觉识别、标定与抓取场景，开展软硬件联调。',practice:'担任队长，参与补充光照样本、调整标定参数及现场调试。',proof:'robot-vision-third'}
 ];
 const detailData={
  method:{label:'多 AI 协作方法',title:'我定义目标，也审核结果。',html:'<p class="detail-lead">我的习惯是先组织任务，再驱动 AI 实现。AI 参与开发与研究，我负责定义方向、协调过程和复核结果。</p><div class="detail-facts"><span>ChatGPT</span><span>DeepSeek Harness</span><span>WorkBuddy</span><span>Qoder</span><span>TRAE</span></div>'+methods.map(a=>`<h3>${a[1]}</h3><p>${a[2]}</p>`).join('')+'<h3>在真实项目里运用</h3><p>职业规划智能体与 SoundLane 中，我使用 AI 辅助完成需求到作品的开发流程；在论文研究中，驱动 3 个 AI 分工推进代码、数据分析、图表和文稿，并由我审核、修改与提交。</p>'},
  career:{label:'作品一 · 独立开发',title:'职业规划智能体',html:'<p class="detail-lead">把企业提出的职业规划需求，整理成能够运行的网站。2026 年 4 月开展。</p><div class="detail-facts"><span>独立开发</span><span>TRAE 辅助编码</span><span>人工审核与测试</span></div><h3>从需求开始</h3><p>围绕岗位探索、晋升与转岗路径、成长方案和 AI 简历解析，拆分功能，梳理页面、交互和信息流程。</p><h3>构建可运行的网站</h3><p>独立完成网站开发。把具体需求交给 TRAE 辅助实现，再亲自审核生成结果，检查功能是否符合预期，持续修正与测试。</p><h3>在竞赛中验证作品</h3><p>第十七届中国大学生服务外包创新创业大赛：初赛小组第一名，全国赛企业命题类三等奖。</p><button class="detail-proof" data-proof="outsourcing-national-third">查看获奖证明 ↗</button>'},
  soundlane:{label:'作品二 · 独立完成',title:'SoundLane：从场景到交互',html:'<p class="detail-lead">面向视障出行，探索如何将视觉识别、语音反馈、导航与守护人协同整合为连贯的交互体验。2026 年 8 月开展。</p><div class="detail-facts"><span>需求与交互设计</span><span>AI 辅助开发</span><span>测试 · 文档 · 答辩</span></div><h3>先理解用户问题</h3><p>梳理使用场景、需求与竞品，从用户的问题倒推功能和交互，组织导航、AI 视觉、语音反馈及守护人模块。</p><h3>独立推进完整流程</h3><p>独立完成需求分析、交互设计、AI 辅助编码、功能测试、作品说明和答辩。原型使用 HTML、CSS、JavaScript，并围绕 TensorFlow.js 视觉识别、地图交互及语音能力进行整合。</p><h3>作品成果与阶段</h3><p>第十一届（2026 年）中国高校计算机大赛移动应用创新赛，启明赛道（高教组）华南赛区一等奖。作品是可运行、可点击的交互原型，尚未投入实际出行使用。</p><button class="detail-proof" data-proof="soundlane-mobile-first">查看获奖证明 ↗</button>'},
  research:{label:'第一作者 · 期刊投稿中',title:'与 AI 协作，从研究问题到投稿',html:'<p class="detail-lead">Observation frequency and forecast reliability of ecological security indices in the Qilian Mountain region, China</p><div class="detail-facts"><span>第一作者</span><span>Journal of Mountain Science</span><span>投稿中</span></div>'+research.map(a=>`<h3>${a[1]}</h3><p>${a[2]}</p>`).join('')+'<h3>我的贡献</h3><p>研究各环节由我驱动 AI 协同完成。我分配三个 AI 的任务、汇总输出，审核代码、分析、图表与写作，并迭代稿件。</p>'}
 };
return {methods,research,honors,detailData};
})();
