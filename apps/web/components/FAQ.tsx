import React from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-llm-required',
    question: '一定要装 LLM 吗?',
    answer:
      '不需要。Whimsy 直接提供 3 套真差异化的免 LLM 模板(平台跳跃 / 射击 / 解谜各 1 套代表),点 Try sample 就能玩。LLM 是给想跑 5 个变体的人用的,可选。',
  },
  {
    id: 'faq-3-vs-15',
    question: 'Whimsy v2 模板为啥是 15 套,不是 3 套?',
    answer:
      '15 套已经实现机制级独立:5 平台跳跃(钩爪 / 二段跳 / 反弹 / 计时 / 多 stage)/ 5 射击(弹幕 / 子弹时间 / 反弹 / 召唤 / boss)/ 5 解谜(连线 / 物理 / 颜色 / 数字 / 形状)。沙盒验证是字节级的,不是只看换皮。3 套是"开页就玩"的最低门槛,15 套是"覆盖场景"的最大覆盖。',
  },
  {
    id: 'faq-share-safety',
    question: '分享的链接安全吗?',
    answer:
      '三层防御:12 API 黑名单(eval / Function / document.write / fetch / importScripts / XHR / WebSocket / Worker / postMessage / parent / top / window.parent)+ 200KB 体积上限 + iframe sandbox(仅 allow-scripts)。字节级过滤,防 Unicode / hex / 字符串拼接绕过。URL 之外还有 IndexedDB 备份,接收方离线也能开。',
  },
  {
    id: 'faq-vs-rosebud',
    question: '跟 Rosebud / Astrocade 区别?',
    answer:
      '开源 + 零后端 + 浏览器直连 LLM。Rosebud / Astrocade 是闭源 SaaS,要登录、要配额、prompt 上传云端。Whimsy 是 MIT,本地起 pnpm dev:web 就能跑,prompt 不离机,LLM 输出过沙盒。',
  },
  {
    id: 'faq-contribute',
    question: '怎么贡献模板 / 提 issue?',
    answer:
      '5 个 GitHub Issue 模板(bug / feature / template / 翻译 / 安全)+ CONTRIBUTING.md(模板贡献指南在 docs/CONTRIBUTING-templates.md)。新模板要求:机制上跟现有 14 套至少有一项不同 + 沙盒验证 + 含试玩 prompt。',
  },
];

/**
 * "常见疑问" — FAQ accordion using native <details>/<summary>.
 *
 * 5 Whimsy-specific Q&A. No React state, SSR-friendly, keyboard + a11y
 * free out of the box.
 */
export function FAQ() {
  return (
    <section
      id="faq"
      className="bg-zinc-950 border-b border-zinc-800"
      aria-labelledby="faq-title"
      data-testid="faq"
    >
      <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2
            id="faq-title"
            className="text-3xl md:text-4xl font-bold text-zinc-50"
            data-testid="faq-title"
          >
            常见疑问
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            5 个 Whimsy 专属 Q&A
          </p>
        </div>

        <div className="flex flex-col gap-3" data-testid="faq-list">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.id}
              data-testid={`faq-item-${item.id}`}
              className="group rounded-lg border border-zinc-800 bg-zinc-900/40 open:bg-zinc-900/70 transition-colors"
            >
              <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-zinc-100 text-sm md:text-base font-medium list-none">
                <span>{item.question}</span>
                <span
                  aria-hidden
                  className="text-zinc-500 group-open:rotate-45 transition-transform text-xl leading-none select-none"
                >
                  +
                </span>
              </summary>
              <div
                className="px-5 pb-4 text-sm md:text-base text-zinc-300 leading-relaxed"
                data-testid={`faq-answer-${item.id}`}
              >
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
