<template>
  <Watermark :content="['国网华东-王凯(wangkai)','66.5.70.94-电力AI监控/南天信息']">
    <div :style="styles.layout">
      <div :style="styles.menu">
        <!-- 🌟 Logo -->
        <div :style="styles.logo">
          <img :src="logo" draggable="false" alt="logo" :style="styles['logo-img']">
          <span :style="styles['logo-span']">电力AI 安监系统</span>
        </div>

        <!-- 🌟 添加会话 -->
        <Button type="link" :style="styles.addBtn" @click="onAddConversation">
          <PlusOutlined />
          新对话
        </Button>

        <Menu :style="styles['menu-right']" :items="menuItems" />

        <!-- 🌟 会话管理 -->
        <Conversations :items="conversationsItems" :style="styles.conversations" :active-key="activeKey"
          @active-change="onConversationClick" />
      </div>

      <div :style="styles.chatContainer">
        <!-- 🌟 顶部导航栏 -->
        <div :style="styles.header">
          <div :style="styles['header-links']">
            <Button type="link">工单智能管控平台</Button>
            <Button type="link">线路无人巡检系统</Button>
            <Button type="link">自动化调度系统</Button>
            <Button type="link">华东网安全势感知系统</Button>
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
        <!-- 🌟 页面内容 -->
        <router-view />
      </div>
    </div>
  </Watermark>
</template>

<script setup lang="ts">
import type { ConversationsProps } from 'ant-design-x-vue'
import {
  PlusOutlined,
  UserOutlined,
  BookOutlined,
  SettingOutlined,
  HistoryOutlined,
  AuditOutlined,
} from '@ant-design/icons-vue'
import { Button, Menu, Avatar, Watermark, theme } from 'ant-design-vue'
import { Conversations } from 'ant-design-x-vue'
import { computed, h, ref, watch } from 'vue'
import logo from "../assets/icon.png"
import { useRouter } from 'vue-router';

const { token } = theme.useToken()
const router = useRouter();

const styles = computed(() => {
  return {
    layout: {
      width: '100%',
      'min-width': '1000px',
      height: '100vh',
      'border-radius': `${token.value.borderRadius}px`,
      display: 'flex',
      background: `${token.value.colorBgContainer}`,
      'font-family': `AlibabaPuHuiTi, ${token.value.fontFamily}, sans-serif`,
    },
    menu: {
      'border-right': `1px solid ${token.value.colorBorder}`,
      width: '280px',
      height: '100%',
      display: 'flex',
      'flex-direction': 'column',
    },
    conversations: {
      padding: '0 12px',
      flex: 1,
      'overflow-y': 'hidden',
    },
    chatContainer: {
      flex: 1,
      display: 'flex',
      'flex-direction': 'column',
      height: '100%',
      'overflow-y': 'hidden',
    },
    logo: {
      display: 'flex',
      height: '72px',
      'align-items': 'center',
      'justify-content': 'start',
      padding: '0 24px',
      'box-sizing': 'border-box',
    },
    'logo-img': {
      width: '24px',
      height: '24px',
      display: 'inline-block',
    },
    'logo-span': {
      display: 'inline-block',
      margin: '0 8px',
      'font-weight': 'bold',
      color: token.value.colorText,
      'font-size': '16px',
    },
    addBtn: {
      background: '#1677ff0f',
      border: '1px solid #1677ff34',
      width: 'calc(100% - 24px)',
      margin: '0 12px 24px 12px',
    },
    header: {
      display: 'flex',
      'justify-content': 'space-between',
      'align-items': 'center',
      padding: `0 24px`,
      height: '54px',
      'border-bottom': `1px solid ${token.value.colorBorder}`,
    },
    'header-links': {
      display: 'flex',
      gap: '16px',
    },
    'user-info': {
      display: 'flex',
      'align-items': 'center',
      gap: '18px',
    },
  } as const
})

const defaultConversationsItems = [
  {
    key: '0',
    label: 'C园区目前变压器是否正常?',
  },
]

const conversationsItems = ref(defaultConversationsItems)
const activeKey = ref(defaultConversationsItems[0].key)

const menuItems = ref([
  {
    label: '知识库',
    key: 'knowledge',
    icon: h(BookOutlined),
  },
  {
    label: '案例库',
    key: 'case',
    icon: h(AuditOutlined),
  },
  {
    label: '设置',
    key: 'setting',
    icon: h(SettingOutlined),
  },
  {
    label: '历史对话',
    key: 'history',
    icon: h(HistoryOutlined),
  },
])

watch(activeKey, (newKey) => {
  if (newKey !== undefined) {
    // Navigate to chat page with conversation id
    // This assumes your chat page route is named 'chat' and accepts a param 'id'
    // router.push({ name: 'chat', params: { id: newKey } });
    // For now, just log, will integrate with chat page later
    console.log('Active conversation changed to:', newKey);
  }
}, { immediate: true })

function onAddConversation() {
  const newKey = `${conversationsItems.value.length}`;
  conversationsItems.value = [
    ...conversationsItems.value,
    {
      key: newKey,
      label: `新对话 ${conversationsItems.value.length}`,
    },
  ]
  activeKey.value = newKey;
}

const onConversationClick: ConversationsProps['onActiveChange'] = (key) => {
  activeKey.value = key
}

</script>

<style scoped>
/* Add any layout-specific styles here if needed */
</style>