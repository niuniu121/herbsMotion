<template>
  <div class="herbsie-container">
    <button v-if="!isOpen" class="floating-ball" @click="isOpen = true">
      <span class="icon"><img src="../assets/logo_opacity.svg" /></span>
    </button>

    <div v-else class="chat-window">
      <div class="chat-header">
        <div class="bot-info">
          <div class="avatar-elegant">H</div>
          <div class="header-text">
            <div class="name">Herbsie</div>
            <div class="status">Clinic Assistant</div>
          </div>
        </div>
        <button class="close-btn" @click="isOpen = false">×</button>
      </div>

      <div class="chat-content" ref="scrollBox">
        <div v-for="(msg, index) in messages" :key="index" :class="['msg-row', msg.role]">
          <div class="bubble" v-html="msg.text"></div>
        </div>
      </div>

      <div class="options-area">
        <div class="tags-scroll">
          <button
            v-for="(item, index) in faqDatabase"
            :key="index"
            @click="handleSelect(item)"
            class="tag-btn"
          >
            {{ item.q }}
          </button>
        </div>
      </div>

      <div class="input-area">
        <input v-model="userInput" @keyup.enter="handleSend" placeholder="Type your question..." />
        <button @click="handleSend" class="send-btn">➤</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const isOpen = ref(false)
const userInput = ref('')
const scrollBox = ref(null)
const messages = ref([
  { role: 'bot', text: "Hi! I'm Herbsie. Please select a question below, or type your own!" },
])

// 包含所有文档内容的完整数据库 (已去除 cite 引用)
const faqDatabase = [
  {
    q: 'Do you have parking?',
    keywords: ['parking', 'park', 'car', 'drive'],
    a: 'There are 3 onsite parking bays at the front of the building and 2 at the rear. Additional public parking is available on Canterbury Road and adjoining streets. There are several free 2-hour parking options just a few minutes’ walk from the clinic: Camberwell Station, near Mayston Street, and Market Place.',
  },
  {
    q: 'How long are the sessions?',
    keywords: ['long', 'duration', 'time', 'sessions', 'minutes'],
    a: 'Initial consultations are 40 minutes. Follow-up consultations range from 20–60 minutes, depending on the complexity of your condition.',
  },
  {
    q: 'What do I need to bring?',
    keywords: ['bring', 'scans', 'results', 'documents'],
    a: 'If you have had scans or other investigations, please bring the results. If you have a care plan referral, WorkCover, TAC, or Home Care docs, bring them or email them to info@herbsmotion.com.au.',
  },
  {
    q: 'Do I need a referral?',
    keywords: ['referral', 'doctor', 'gp letter'],
    a: 'No, you do not need a referral to be seen. However, we welcome any referral letters or reports from your treating doctor.',
  },
  {
    q: 'Treatment while menstruating?',
    keywords: ['menstruating', 'menstrual', 'period', 'women'],
    a: 'Yes, our Women’s Health Physio treats patients during all stages of their menstrual cycle.',
  },
  {
    q: 'How many sessions will I need?',
    keywords: ['how many', 'number of sessions'],
    a: 'The number of sessions will vary depending on the type and severity of your injury. Your physio will provide an expected timeframe during your initial appointment.',
  },
  {
    q: 'Does Medicare rebate costs?',
    keywords: ['medicare', 'rebate', 'cdmp'],
    a: 'A Medicare rebate of $61.80 applies to clients who have a current Chronic Disease Management Plan from their GP. This allows rebates for up to 5 sessions per calendar year.',
  },
  {
    q: 'Private health insurance claims?',
    keywords: [
      'private health',
      'insurance',
      'hicaps',
      'medibank',
      'bupa',
      'phoenix',
      'hcf',
      'nib',
    ],
    a: 'If you have extras cover, you can claim on the spot via our HICAPS machine. We accept all major insurers, including Medibank, Bupa, Phoenix, HCF, and NIB.',
  },
  {
    q: 'What should I wear?',
    keywords: ['wear', 'clothing', 'clothes', 'shorts'],
    a: 'Please wear clothing that allows easy access to the area of injury. Shorts and a singlet are suitable for most conditions.',
  },
  {
    q: 'What if I can’t make an appointment?',
    keywords: ['cancel', 'miss', 'reschedule', 'notice'],
    a: 'We require at least 24 hours’ notice for cancellations. A $50 fee will apply if less than 24 hours’ notice is given.',
  },
  {
    q: 'Do you accept WorkCover?',
    keywords: ['workcover', 'work cover'],
    a: 'Yes, we welcome WorkCover clients. Once your medical excess has been met, we can invoice your insurer directly with no out-of-pocket costs.',
  },
  {
    q: 'Do you accept TAC clients?',
    keywords: ['tac'],
    a: 'Yes, we welcome TAC clients. We can submit invoices directly to TAC on your behalf with no out-of-pocket fees, provided you have met the excess.',
  },
  {
    q: 'Do you accept Home Care Packages?',
    keywords: ['home care', 'package', 'happy living'],
    a: 'Yes, we welcome Home Care Package clients. If you are not with one of our partner providers (such as Happy Living), payment is required upfront and we will provide an invoice for reimbursement.',
  },
  {
    q: 'Do you provide home visit services?',
    keywords: ['home visit', 'visit my home'],
    a: 'Yes, although we encourage clients to attend the clinic, some practitioners offer home visits. Please enquire with your treating practitioner.',
  },
]

// 点击按钮发送
const handleSelect = (item) => {
  messages.value.push({ role: 'user', text: item.q })
  setTimeout(() => {
    messages.value.push({ role: 'bot', text: item.a })
    scrollToBottom()
  }, 300)
}

// 手动输入发送与模糊匹配
const handleSend = () => {
  const text = userInput.value.trim().toLowerCase()
  if (!text) return

  messages.value.push({ role: 'user', text: userInput.value })
  userInput.value = ''

  setTimeout(() => {
    let matchedItem = null
    // 遍历所有关键词，找匹配项
    for (const item of faqDatabase) {
      if (item.keywords.some((k) => text.includes(k))) {
        matchedItem = item
        break // 找到第一个匹配的就跳出
      }
    }

    if (matchedItem) {
      messages.value.push({ role: 'bot', text: matchedItem.a })
    } else {
      // 兜底话术 (Fallback)
      messages.value.push({
        role: 'bot',
        text: "I'm not quite sure. Please check the FAQ options to see if you can find the information you need. For more details, please contact us by phone!",
      })
    }
    scrollToBottom()
  }, 400)
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollBox.value) scrollBox.value.scrollTop = scrollBox.value.scrollHeight
}
</script>

<style scoped>
/* 容器及悬浮球 */
.herbsie-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.floating-ball {
  width: 60px;
  height: 60px;
  background: #325b49;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 24px;
  transition: transform 0.2s;
}
.floating-ball:hover {
  transform: scale(1.05);
}

/* 聊天窗口主框架 */
.chat-window {
  width: 360px;
  height: 550px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 优化后的头部 & 高级感头像 */
.chat-header {
  background: #325b49;
  color: white;
  padding: 15px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bot-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar-elegant {
  width: 40px;
  height: 40px;
  /* 基于主色调衍生出的高级感渐变 */
  background: linear-gradient(135deg, #478067, #1e382d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Georgia', serif;
  font-size: 20px;
  font-style: italic;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.header-text {
  display: flex;
  flex-direction: column;
}
.name {
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
}
.status {
  font-size: 12px;
  color: #aebdb6;
}
.close-btn {
  background: none;
  border: none;
  color: #aebdb6;
  font-size: 28px;
  cursor: pointer;
  transition: color 0.2s;
}
.close-btn:hover {
  color: white;
}

/* 聊天内容区 */
.chat-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f7f9f8;
}
.msg-row {
  margin-bottom: 12px;
  display: flex;
}
.msg-row.bot {
  justify-content: flex-start;
}
.msg-row.user {
  justify-content: flex-end;
}
.bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}
.bot .bubble {
  background: white;
  color: #325b49;
  border-bottom-left-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.user .bubble {
  background: #325b49;
  color: white;
  border-bottom-right-radius: 2px;
}

/* 滚动选项区 (上下滚动) */
.options-area {
  padding: 10px 15px;
  border-top: 1px solid #eee;
  background: white;
}
.tags-scroll {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 130px;
  overflow-y: auto;
  padding-right: 5px;
}
/* 美化滚动条 */
.tags-scroll::-webkit-scrollbar {
  width: 4px;
}
.tags-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.tags-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.tags-scroll::-webkit-scrollbar-thumb:hover {
  background: #325b49;
}

.tag-btn {
  background: white;
  border: 1px solid #325b49;
  color: #325b49;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}
.tag-btn:hover {
  background: #325b49;
  color: white;
}

/* 输入框 */
.input-area {
  padding: 12px 15px;
  border-top: 1px solid #eee;
  display: flex;
  background: white;
}
.input-area input {
  flex: 1;
  border: 1px solid #e0e5e4;
  border-radius: 20px;
  padding: 8px 15px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}
.input-area input:focus {
  border-color: #325b49;
}
.send-btn {
  background: #325b49;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 1. 替换原有的 .floating-ball 样式 */
.floating-ball {
  width: 60px;
  height: 60px;
  background: #325b49;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;

  /* 添加下面这三行：让内部元素绝对居中 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; /* 清除 button 默认的内边距 */
}
.floating-ball:hover {
  transform: scale(1.05);
}

/* 2. 新增下面这两段，控制图标和图片的尺寸 */
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-ball img {
  width: 35px; /* 这里控制 logo 的大小，如果觉得太大可以改成 30px */
  height: 35px;
  object-fit: contain; /* 保证 logo 比例不变形 */
}
</style>
