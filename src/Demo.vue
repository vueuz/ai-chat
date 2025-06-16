<script setup lang="ts">
import type { AttachmentsProps, BubbleListProps, BubbleProps, ConversationsProps, PromptsProps } from 'ant-design-x-vue'
import type { VNode } from 'vue'
import {
  CloudUploadOutlined,
  CommentOutlined,
  EllipsisOutlined,
  FireOutlined,
  HeartOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReadOutlined,
  ShareAltOutlined,
  SmileOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { Badge, Button, Flex, Space, Typography, theme, Avatar, Watermark } from 'ant-design-vue'
import {
  Attachments,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  useXAgent,
  useXChat,
  Welcome,
  XStream,
  ThoughtChain
} from 'ant-design-x-vue'
import markdownit from 'markdown-it';
import { computed, h, ref, watch } from 'vue'
import qa from './qa.json'
import logo from "./assets/icon.png"

const { token } = theme.useToken()

const styles = computed(() => {
  return {
    'layout': {
      'width': '100%',
      'min-width': '1000px',
      'height': '100vh',  // 修改为100vh以适应窗口高度
      'border-radius': `${token.value.borderRadius}px`,
      'display': 'flex',
      'background': `${token.value.colorBgContainer}`,
      'font-family': `AlibabaPuHuiTi, ${token.value.fontFamily}, sans-serif`,
    },
    'menu': {
      'background': `${token.value.colorBgLayout}80`,
      'width': '280px',
      'height': '100%',
      'display': 'flex',
      'flex-direction': 'column',
    },
    'conversations': {
      'padding': '0 12px',
      'flex': 1,
      'overflow-y': 'hidden',

    },
    'chat': {
      'height': '100%',
      'width': '100%',

      'margin': '0 auto',
      'box-sizing': 'border-box',
      'display': 'flex',
      'flex-direction': 'column',
      'padding': `${token.value.paddingLG}px`,
      'gap': '16px',
      // 隐藏滚动条
      'overflow-y': 'hidden',
    },
    'messages': {
      flex: 1,
    },
    'placeholder': {
      'padding-top': '32px',
      'text-align': 'left',
      'flex': 1,
    },
    'sender': {
      'box-shadow': token.value.boxShadow,
    },
    'logo': {
      'display': 'flex',
      'height': '72px',
      'align-items': 'center',
      'justify-content': 'start',
      'padding': '0 24px',
      'box-sizing': 'border-box',
    },
    'logo-img': {
      width: '24px',
      height: '24px',
      display: 'inline-block',
    },
    'logo-span': {
      'display': 'inline-block',
      'margin': '0 8px',
      'font-weight': 'bold',
      'color': token.value.colorText,
      'font-size': '16px',
    },
    'addBtn': {
      background: '#1677ff0f',
      border: '1px solid #1677ff34',
      width: 'calc(100% - 24px)',
      margin: '0 12px 24px 12px',
    },
    'header': {
      'display': 'flex',

      'justify-content': 'space-between',
      'align-items': 'center',
      'padding': `0 24px`,
      'height': '64px',
      'border-bottom': `1px solid ${token.value.colorBorderSecondary}`,
    },
    'header-links': {
      'display': 'flex',
      'gap': '16px',
    },
    'user-info': {
      'display': 'flex',
      'align-items': 'center',
      'gap': '18px',
    },
  } as const
})

defineOptions({ name: 'PlaygroundIndependentSetup' })

const currentAnswer = ref([])

// random sleep
const sleep = () => new Promise(resolve => setTimeout(resolve, Math.random() * 1000))

const getAnswer = (question: string) => {
  const qaList = qa.list
  const qaItem = qaList.find(item => question.includes(item.keywords))

  if (qaItem) {
    return qaItem.answer
  }
}

const md = markdownit()
// 创建一个渲染markdown内容的函数
const renderMarkdown: BubbleProps['messageRender'] = (content) => {
  console.log("renderMarkdown", content);



  return h(Typography, null, {
    default: () => h('div', {
      class: 'markdown-content',
      innerHTML: md.render(String(content))
    })
  });
};


function renderTitle(icon: VNode, title: string) {
  return h(Space, { align: 'start' }, () => [icon, h('span', title)])
}

// --------------
// | title      |
// | description|
// -------------

const renderCard: BubbleProps['messageRender'] = (source) => {
  const items = (Array.isArray(source) ? source : [source])
    .flatMap(item =>
      (item.source || [item])
        .filter(content => content.title) // 过滤有效内容
        .map(content => ({
          label: content.title,
          description: content.description,
          keywords: content.keywords,
          correctness: content.correctness
        }))
    );

  return h(
    Prompts,
    {
      title: '✨ 参考信息',
      'wrap': true,
      'items': items,
      'styles': {
        item: {
          flex: 'none',
          width: 'calc(50% - 6px)',
        },
      }
    }
  );
};

function renderItem(item: any) {
  const currentContent = {
    ...item,
    // 将source数组提升到顶层以便渲染
    ...(item.source && { source: item.source })
  };

  currentAnswer.value = [...currentAnswer.value, currentContent];

  let thinkCharIndex = 0;
  let contentCharIndex = 0;
  let isThinking = false;

  const startTypingThink = () => {
    isThinking = true;
    const typingThinkId = setInterval(() => {
      if (thinkCharIndex < item.think.length) {
        currentContent.think = item.think.slice(0, thinkCharIndex + 1);
        onUpdate(currentContent.think);
        thinkCharIndex++;
      } else {
        clearInterval(typingThinkId);
        isThinking = false;
        startTypingContent();
      }
    }, 10);
  };

  const startTypingContent = () => {
    const typingContentId = setInterval(() => {
      if (contentCharIndex < item.content.length) {
        currentContent.content = item.content.slice(0, contentCharIndex + 1);
        onUpdate(currentContent.content);
        contentCharIndex++;
      } else {
        clearInterval(typingContentId);
        processNextItem();
      }
    }, 10);
  };

  if (item.think && item.think.length > 0) {
    startTypingThink();
  } else {
    startTypingContent();
  }

  // 返回一个包含思考和回答内容的渲染函数
  return () => {
    const elements = [];
    if (item.think && item.think.length > 0) {
      elements.push(
        h(ThoughtChain, {
          title: '模型思考',
          content: currentContent.think,
          typing: isThinking,
          messageRender: renderMarkdown,
        })
      );
    }
    elements.push(
      h(Bubble,
        {
          variant: 'borderless',
          style: { 'margin-top': item.think && item.think.length > 0 ? '-24px' : '0px' },
          typing: !isThinking,
          content: currentContent.content,
          messageRender: renderMarkdown,
        }
      )
    );
    return h(Space, { direction: 'vertical', style: { width: '100%' } }, elements);
  };
}

const defaultConversationsItems = [
  {
    key: '0',
    label: 'C园区目前变压器是否正常?',
  },
]

const placeholderPromptsItems: PromptsProps['items'] = [
  {
    key: '1',
    label: renderTitle(h(FireOutlined, { style: { color: '#FF4D4F' } }), '现象诊断'),
    description: '以当前情况描述分析问题',
    children: [
      {
        key: '1-1',
        description: `电压闪变哪里最严重?`,
      },
      {
        key: '1-2',
        description: `最近闪变何时发生?`,
      },
      {
        key: '1-3',
        description: `闪变影响哪些设备?`,
      },
    ],
  },
  {
    key: '2',
    label: renderTitle(h(ReadOutlined, { style: { color: '#1890FF' } }), '数据分析'),
    description: '对数据进行分析和处理',
    children: [
      {
        key: '2-1',
        icon: h(HeartOutlined),
        description: `导出昨日电压曲线`,
      },
      {
        key: '2-2',
        icon: h(SmileOutlined),
        description: `对比每周闪变记录`,
      },
      {
        key: '2-3',
        icon: h(CommentOutlined),
        description: `生成诊断报告`,
      },
    ],
  },
]



const roles: BubbleListProps['roles'] = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: '16px',
      },
    },
  },
  local: {
    placement: 'end',
    variant: 'shadow',
  },
}

// ==================== State ====================
const headerOpen = ref(false)
const content = ref('')
const conversationsItems = ref(defaultConversationsItems)
const activeKey = ref(defaultConversationsItems[0].key)
const attachedFiles = ref<AttachmentsProps['items']>([])
const agentRequestLoading = ref(false)
const autoplay = ref(true) // 新增 autoplay 状态，默认为 true
const currentProcessIndex = ref(0) // 新增当前流程索引
const waitingForConfirmation = ref(false) // 新增等待确认状态


// ==================== Runtime ====================
const [agent] = useXAgent({
  request: async ({ message }, { onSuccess, onUpdate }) => {
    agentRequestLoading.value = true
    currentProcessIndex.value = -1 // 重置流程索引
    currentAnswer.value = [] // 清空之前的答案
    waitingForConfirmation.value = false // 重置等待确认状态
    await sleep()

    const fullAnswer = getAnswer(message)





    if (!fullAnswer || fullAnswer.length === 0) {
      console.log("no answer");

      agentRequestLoading.value = false
      onSuccess('') // 或者一个提示没有答案的消息
      return
    }



    const processNextItem = () => {
      if (currentProcessIndex.value >= fullAnswer.length - 1) {
        agentRequestLoading.value = false
        onSuccess(fullAnswer.map(item => item.content).join('\n\n'))
        return
      }
      currentProcessIndex.value++
      renderItem(fullAnswer[currentProcessIndex.value])
    }

    const renderItem = (item: any) => {
      const currentContent = {
        ...item,
        content: ''
      }
      currentAnswer.value = [...currentAnswer.value, currentContent]

      let charIndex = 0
      const typingId = setInterval(() => {
        if (charIndex < item.content.length) {
          currentContent.content = item.content.slice(0, charIndex + 1)
          onUpdate(currentContent.content)
          charIndex++
        } else {
          clearInterval(typingId)
          processNextItem() // 关键修改：当前流程完成后触发下一个流程
        }
      }, 20)
    }

    // 初始化时直接触发第一个流程
    processNextItem()

  },

})



const { onRequest, messages, setMessages } = useXChat({
  agent: agent.value,
})

watch(activeKey, () => {
  if (activeKey.value !== undefined) {
    setMessages([])
  }
}, { immediate: true })

// ==================== Event ====================
function onSubmit(nextContent: string) {
  if (!nextContent)
    return
  onRequest(nextContent)
  content.value = ''
}

const onPromptsItemClick: PromptsProps['onItemClick'] = (info) => {
  onRequest(info.data.description as string)
}

function onAddConversation() {
  conversationsItems.value = [
    ...conversationsItems.value,
    {
      key: `${conversationsItems.value.length}`,
      label: `新对话 ${conversationsItems.value.length}`,
    },
  ]
  activeKey.value = `${conversationsItems.value.length}`
}

const onConversationClick: ConversationsProps['onActiveChange'] = (key) => {
  activeKey.value = key
}

const handleFileChange: AttachmentsProps['onChange'] = info => attachedFiles.value = info.fileList

// ==================== Nodes ====================
const placeholderNode = computed(() => h(
  Space,
  { direction: "vertical", size: 16, style: styles.value.placeholder },
  () => [
    h(
      Welcome,
      {
        variant: "borderless",
        icon: "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp",
        title: "你好，我是小安",
        description: "毫秒级捕捉工业电压闪变，15分钟定位故障根源，护航关键生产线零中断。",
      }
    ),
    h(
      Prompts,
      {
        title: "有什么可以帮到您?",
        items: placeholderPromptsItems,
        styles: {
          list: {
            width: '100%',
          },
          item: {
            flex: 1,
          },
        },
        onItemClick: onPromptsItemClick,
      }
    )
  ]
))

const customRender = (item: any) => {
  if (['information', 'reference'].includes(item.type)) {
    return renderCard(item.source)
  } else {
    return renderMarkdown(item.content)
  }
}

const items = computed<BubbleListProps['items']>(() => {

  if (messages.value.length === 0) {
    return [{ content: placeholderNode, variant: 'borderless' }]
  }

  return messages.value.map(({ id, message, status }) => {

    if (status === 'local') {
      return {
        key: id,
        role: status,
        content: message,

      }
    } else {
      return {
        key: id,
        content: message,
        messageRender: () => h(ThoughtChain, {
          items: [
            ...currentAnswer.value.map((item) => {

              return {
                title: item.title,
                content: customRender(item),
                description: item.description,


              }
            }),
          ],
        }),
      }
    }
  }

  )
})
</script>

<template>
<Watermark :content="['中电金信-王凯(wangkai)','66.5.70.94-系统资源管理/南天信息']" >
  <div :style="styles.layout">

    <div :style="styles.menu">
      <!-- 🌟 Logo -->
      <div :style="styles.logo">
        <img :src="logo"
          draggable="false" alt="logo" :style="styles['logo-img']">
        <span :style="styles['logo-span']">​​IPS-S1 安监系统​</span>
      </div>

      <!-- 🌟 添加会话 -->
      <Button type="link" :style="styles.addBtn" @click="onAddConversation">
        <PlusOutlined />
        新对话
      </Button>

      <!-- 🌟 会话管理 -->
      <Conversations :items="conversationsItems" :style="styles.conversations" :active-key="activeKey"
        @active-change="onConversationClick" />
    </div>

    <div :style="styles.chat">
      <!-- 🌟 顶部导航栏 -->
      <div :style="styles.header">
        <div :style="styles['header-links']">
          <Button type="link">D7000智能感知平台​</Button>
          <Button type="link">OMS-IPS工单智能管控平台</Button>
          <Button type="link">电网哨兵</Button>
        </div>
        <div :style="styles['user-info']">
          <Avatar style="background-color: #87d068">
            <template #icon>
              <UserOutlined />
            </template>
          </Avatar>
          <span>王凯</span>
        </div>
      </div>
      <!-- 🌟 消息列表 -->
      <Bubble.List :items="items" :roles="roles" :style="styles.messages" :MessageRender="messageRender" />

      <!-- 🌟 提示词 -->

      <!-- 🌟 输入框 -->
      <Sender :value="content" :style="styles.sender" :loading="agentRequestLoading" @submit="onSubmit"
        @change="value => content = value">
        <template #prefix>
          <Badge :dot="attachedFiles.length > 0 && !headerOpen">
            <Button type="text" @click="() => headerOpen = !headerOpen">
              <template #icon>
                <PaperClipOutlined />
              </template>
            </Button>
          </Badge>
        </template>

        <template #header>
          <Sender.Header title="Attachments" :open="headerOpen" :styles="{ content: { padding: 0 } }"
            @open-change="open => headerOpen = open">
            <Attachments :before-upload="() => false" :items="attachedFiles" @change="handleFileChange">
              <template #placeholder="type">
                <Flex v-if="type && type.type === 'inline'" align="center" justify="center" vertical gap="2">
                  <Typography.Text style="font-size: 30px; line-height: 1;">
                    <CloudUploadOutlined />
                  </Typography.Text>
                  <Typography.Title :level="5" style="margin: 0; font-size: 14px; line-height: 1.5;">
                    Upload files
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    Click or drag files to this area to upload
                  </Typography.Text>
                </Flex>
                <Typography.Text v-if="type && type.type === 'drop'">
                  Drop file here
                </Typography.Text>
              </template>
            </Attachments>
          </Sender.Header>
        </template>
      </Sender>
    </div>

  </div>
  </Watermark>
</template>
