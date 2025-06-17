<template>
  <div :style="styles.chat">
    <!-- 🌟 消息列表 -->
    <Bubble.List :items="items" :roles="roles" :style="styles.messages" />

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
</template>

<script setup lang="ts">
import type { AttachmentsProps, BubbleListProps, BubbleProps, PromptsProps } from 'ant-design-x-vue'
import type { VNode } from 'vue'
import {
  CloudUploadOutlined,
  CommentOutlined,
  EllipsisOutlined,
  FireOutlined,
  HeartOutlined,
  PaperClipOutlined,
  ReadOutlined,
  ShareAltOutlined,
  SmileOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'
import { Badge, Button, Flex, Space, Typography, theme } from 'ant-design-vue'
import {
  Attachments,
  Bubble,
  Prompts,
  Sender,
  useXAgent,
  useXChat,
  Welcome,
  ThoughtChain
} from 'ant-design-x-vue'
import markdownit from 'markdown-it';
import { computed, h, ref, watch } from 'vue'
import qa from '../qa.json' // Adjusted path
import { useRoute } from 'vue-router';

const { token } = theme.useToken()
const route = useRoute();

const styles = computed(() => {
  return {
    chat: {
      height: '100%',
      width: '100%',
      margin: '0 auto',
      'box-sizing': 'border-box',
      display: 'flex',
      'flex-direction': 'column',
      padding: `${token.value.paddingLG}px`,
      gap: '16px',
      'overflow-y': 'hidden', // Ensure chat content itself can scroll if needed, or manage scrolling within Bubble.List
    },
    messages: {
      flex: 1,
      'overflow-y': 'auto', // Allow messages to scroll
    },
    placeholder: {
      'padding-top': '32px',
      'text-align': 'left',
      flex: 1,
    },
    sender: {
      'box-shadow': token.value.boxShadow,
    },
  } as const
})

const currentAnswer = ref<Array<{ title?: string; content: string | VNode; description?: string; think?: string }>>([])

// random sleep
const sleep = () => new Promise(resolve => setTimeout(resolve, Math.random() * 1000))

const getAnswer = (question: string) => {
  const qaList = qa.list
  const qaItem = qaList.find(item => question.includes(item.keywords))
  return qaItem ? qaItem.answer : []
}

const md = markdownit()
const renderMarkdown: BubbleProps['messageRender'] = (content) => {
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

const renderCard: BubbleProps['messageRender'] = (source) => {
  const items = (Array.isArray(source) ? source : [source])
    .flatMap(item =>
      (item.source || [item])
        .filter(content => content.title) 
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
      wrap: true,
      items: items,
      styles: {
        item: {
          flex: 'none',
          width: 'calc(50% - 6px)',
        },
      }
    }
  );
};


// ==================== State ====================
const headerOpen = ref(false)
const content = ref('')
const attachedFiles = ref<AttachmentsProps['items']>([])
const agentRequestLoading = ref(false)
const currentProcessIndex = ref(0)

// ==================== Runtime ====================
const [agent] = useXAgent({
  request: async ({ message }, { onSuccess, onUpdate }) => {
    agentRequestLoading.value = true
    currentProcessIndex.value = -1 
    currentAnswer.value = [] 
    await sleep()

    const fullAnswer = getAnswer(message)

    if (!fullAnswer || fullAnswer.length === 0) {
      agentRequestLoading.value = false
      onSuccess('') 
      return
    }

    const processNextItem = () => {
      if (currentProcessIndex.value >= fullAnswer.length - 1) {
        agentRequestLoading.value = false
        // Pass the structured answer for custom rendering
        onSuccess(currentAnswer.value as any); 
        return
      }
      currentProcessIndex.value++
      renderItem(fullAnswer[currentProcessIndex.value], onUpdate, processNextItem)
    }

    // Pass onUpdate and processNextItem to renderItem
    renderItem(fullAnswer[currentProcessIndex.value], onUpdate, processNextItem)
  },
})

const renderItem = (item: any, onUpdate: (chunk: string) => void, processNextItem: () => void) => {
  const currentContent = {
    ...item,
    content: '', // Initialize content as empty for typing effect
    think: item.think ? '' : undefined // Initialize think as empty if it exists
  };
  currentAnswer.value = [...currentAnswer.value, currentContent];

  let thinkCharIndex = 0;
  let contentCharIndex = 0;
  let isThinking = !!item.think;

  const typeThink = () => {
    if (thinkCharIndex < item.think.length) {
      currentContent.think = item.think.slice(0, thinkCharIndex + 1);
      // We don't call onUpdate for think, it's rendered via ThoughtChain directly
      thinkCharIndex++;
      setTimeout(typeThink, 10);
    } else {
      isThinking = false;
      typeContent();
    }
  };

  const typeContent = () => {
    if (contentCharIndex < item.content.length) {
      currentContent.content = item.content.slice(0, contentCharIndex + 1);
      // For the actual message content, we might not need to call onUpdate if Bubble handles typing internally
      // or if we are constructing the final message structure to be passed to onSuccess.
      // If onUpdate is for streaming individual characters to the Bubble component, this is correct.
      onUpdate(currentContent.content); // This might need adjustment based on how Bubble expects updates
      contentCharIndex++;
      setTimeout(typeContent, 10); // Adjust typing speed as needed
    } else {
      processNextItem();
    }
  };

  if (isThinking) {
    typeThink();
  } else {
    typeContent();
  }
};


const { onRequest, messages, setMessages } = useXChat({
  agent: agent.value,
})

// Watch for route changes to clear messages for a new chat
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    setMessages([])
    currentAnswer.value = [] // Clear previous answers as well
    // Potentially load conversation history for newId here
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

const handleFileChange: AttachmentsProps['onChange'] = info => attachedFiles.value = info.fileList

// ==================== Nodes ====================
const placeholderPromptsItems: PromptsProps['items'] = [
  {
    key: '1',
    label: renderTitle(h(FireOutlined, { style: { color: '#FF4D4F' } }), '现象诊断'),
    description: '以当前情况描述分析问题',
    children: [
      { key: '1-1', description: `电压闪变哪里最严重?` },
      { key: '1-2', description: `最近闪变何时发生?` },
      { key: '1-3', description: `闪变影响哪些设备?` },
    ],
  },
  {
    key: '2',
    label: renderTitle(h(ReadOutlined, { style: { color: '#1890FF' } }), '数据分析'),
    description: '对数据进行分析和处理',
    children: [
      { key: '2-1', icon: h(HeartOutlined), description: `导出昨日电压曲线` },
      { key: '2-2', icon: h(SmileOutlined), description: `对比每周闪变记录` },
      { key: '2-3', icon: h(CommentOutlined), description: `生成诊断报告` },
    ],
  },
  {
    key: '3',
    label: renderTitle(h(SettingOutlined, { style: { color: '#52C41A' } }), '解决方案'),
    description: '提供解决方案',
    children: [
      { key: '3-1', icon: h(HeartOutlined), description: `更换变压器` },
      { key: '3-2', icon: h(SmileOutlined), description: `联系专业维修人员` },
    ],
  },
];

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
          list: { width: '100%' },
          item: { flex: 1 },
        },
        onItemClick: onPromptsItemClick,
      }
    )
  ]
))

const customRenderMessage = (item: any) => {
  // Check if item itself is a VNode (placeholder)
  if (typeof item.content === 'object' && item.content !== null && '__v_isVNode' in item.content) {
    return item.content;
  }

  // Handle structured AI responses
  if (Array.isArray(item.content)) {
    return h(ThoughtChain, {
      items: item.content.map((subItem: any) => ({
        title: subItem.title,
        content: subItem.type === 'information' || subItem.type === 'reference' ? renderCard(subItem.source) : renderMarkdown(subItem.content),
        description: subItem.description,
        think: subItem.think ? renderMarkdown(subItem.think) : undefined,
        typing: subItem.typingThink // Assuming you add this property during think typing
      })),
      // Add other props for ThoughtChain as needed, like messageRender for think content
      // messageRender: renderMarkdown // If think content also needs markdown rendering
    });
  }
  // Default to markdown rendering for simple string messages
  return renderMarkdown(item.content);
};

const items = computed<BubbleListProps['items']>(() => {
  if (messages.value.length === 0) {
    return [{ key: 'placeholder', content: placeholderNode, variant: 'borderless' }]
  }
  return messages.value.map(({ id, message, status }) => {
    if (status === 'local') {
      return {
        key: id,
        role: status,
        content: message,
      }
    } else {
      // AI message, content is now the structured array from currentAnswer
      return {
        key: id,
        role: 'ai',
        // message is the raw response from agent, which is currentAnswer.value
        // We pass it to a custom renderer that knows how to display ThoughtChain
        messageRender: () => customRenderMessage({ content: message }) 
      }
    }
  });
})

const roles: BubbleListProps['roles'] = {
  ai: {
    placement: 'start',
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

</script>

<style scoped>
.markdown-content ::v-deep(p) {
  margin-bottom: 0.5em;
}
.markdown-content ::v-deep(ul),
.markdown-content ::v-deep(ol) {
  padding-left: 20px;
}
/* Add any page-specific styles here */
</style>