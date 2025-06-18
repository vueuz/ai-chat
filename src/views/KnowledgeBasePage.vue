<template>
  <div :style="styles.container">
    <div :style="styles.sidebar">
      <a-input-search
        v-model:value="searchValue"
        placeholder="搜索知识库"
        style="margin-bottom: 16px"
        @search="onSearch"
      />
      <!-- 新增知识库按钮 -->
      <a-button type="primary" style="width: 100%; margin-bottom: 16px;" @click="showModal">
        新增知识库
      </a-button>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :items="knowledgeBaseItems"
        @click="onMenuItemClick"
      ></a-menu>
    </div>
    <div :style="styles.content">
      <div v-if="selectedContent" :style="styles.detailContent">
        <a-typography-title :level="3">{{ selectedContent.title }}</a-typography-title>
        <a-typography-paragraph>{{ selectedContent.description }}</a-typography-paragraph>
        <a-divider />
        <div v-html="selectedContent.fullContent"></div>
      </div>
      <a-empty v-else description="请选择一个知识条目查看详情" />
    </div>

    <!-- 新增知识库弹窗 -->
    <a-modal
      v-model:open="isModalVisible"
      title="新增知识库"
      okText="确定"
      cancelText="取消"
      @ok="handleOk"
      @cancel="handleCancel"
      :width="600"
    >
      <a-form
        :model="uploadFormState"
        name="uploadForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
      >
      <a-form-item
          label="标题"
          name="title"
          :rules="[{ required: true, message: '请输入知识库标题!' }]"
        >
          <a-input v-model:value="formState.title" />
        </a-form-item>
        <a-form-item
          label="描述"
          name="description"
          :rules="[{ required: true, message: '请输入知识库描述!' }]"
        >
          <a-textarea v-model:value="formState.description" :rows="4" />
        </a-form-item>
        <a-form-item
          label="上传文件"
          name="fileList"
          :rules="[{ required: true, message: '请选择要上传的文件!' }]"
        >
        <a-upload-dragger
    v-model:fileList="fileList"
    name="file"
    :multiple="true"
    action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
    @change="handleChange"
    @drop="handleDrop"
  >
    <p class="ant-upload-drag-icon">
      <inbox-outlined></inbox-outlined>
    </p>
    <p class="ant-upload-text">点击或拖拽文件到此来添加文件</p>
    <p class="ant-upload-hint">
      支持单个或批量上传，支持docx、pdf、xls等格式。
    </p>
  </a-upload-dragger>
        </a-form-item>

        <a-form-item
          label="文本切片方式"
          name="sliceMethod"
          :rules="[{ required: true, message: '请选择文本切片方式!' }]"
        >
          <a-select v-model:value="uploadFormState.sliceMethod" placeholder="请选择">
            <a-select-option value="auto">自动</a-select-option>
            <a-select-option value="paragraph">按段落</a-select-option>
            <a-select-option value="sentence">按句子</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, reactive } from 'vue';
import { theme, Menu as AMenu, InputSearch as AInputSearch, TypographyTitle as ATypographyTitle, TypographyParagraph as ATypographyParagraph, Empty as AEmpty, Divider as ADivider, Button as AButton, Modal as AModal, Form as AForm, Upload as AUpload, Select as ASelect } from 'ant-design-vue';
import { BookOutlined, FileTextOutlined, UploadOutlined } from '@ant-design/icons-vue';
import type { UploadChangeParam } from 'ant-design-vue/es/upload';

const { token } = theme.useToken();
const formState = reactive({
  title: '',
  description: '',
  fullContent: '',
});

const styles = computed(() => ({
  container: {
    display: 'flex',
    height: '100%',
    padding: token.value.paddingLG + 'px',
    gap: token.value.marginLG + 'px',
  },
  sidebar: {
    width: '300px',
    borderRight: `1px solid ${token.value.colorBorder}`,
    paddingRight: token.value.paddingLG + 'px',
    overflowY: 'auto',
  },
  content: {
    flex: 1,
    padding: token.value.paddingLG + 'px',
    backgroundColor: token.value.colorBgContainer,
    borderRadius: token.value.borderRadiusLG + 'px',
    overflowY: 'auto',
  },
  detailContent: {
    // Styles for the detailed content area
  }
}));

const searchValue = ref('');
const selectedKeys = ref<string[]>([]);

// Mock data for knowledge base items, similar to Dify's structure
const allKnowledgeBaseData = ref([
  {
    key: 'kb1',
    label: '电力系统基础知识',
    icon: () => h(BookOutlined),
    children: [
      {
        key: 'kb1-1',
        label: '变压器工作原理',
        description: '详细介绍变压器的基本构造和工作原理。',
        fullContent: '<p>变压器是利用电磁感应的原理来改变交流电压的装置，主要部件有初级线圈、次级线圈和铁芯。</p><p>当交流电通过初级线圈时，会产生交变磁场，该磁场通过铁芯作用于次级线圈，从而在次级线圈中感应出电动势。</p>',
      },
      {
        key: 'kb1-2',
        label: '高压输电线路安全规范',
        description: '高压输电线路的建设和维护安全标准。',
        fullContent: '<p>高压输电线路的安全规范包括对线路设计、施工、运行和维护的严格要求，以确保人身安全和电力系统的稳定运行。</p><p>例如，线路与建筑物之间的安全距离、防雷措施、定期巡检等都是重要的安全内容。</p>',
      },
    ],
  },
  {
    key: 'kb2',
    label: '智能电网技术',
    icon: () => h(BookOutlined),
    children: [
      {
        key: 'kb2-1',
        label: '智能电表应用',
        description: '智能电表在现代电网中的应用及其优势。',
        fullContent: '<p>智能电表不仅能计量电量，还能实现远程抄表、实时监控用电数据、支持分时电价等功能，是智能电网的重要组成部分。</p><p>它有助于提高电网的运行效率和用户用电的智能化水平。</p>',
      },
      {
        key: 'kb2-2',
        label: '新能源并网技术',
        description: '风能、太阳能等新能源接入电网的技术挑战与解决方案。',
        fullContent: '<p>新能源发电具有间歇性和波动性，其并网对电网的稳定性和电能质量提出挑战。</p><p>解决方案包括储能系统、智能调度、柔性直流输电等先进技术。</p>',
      },
    ],
  },
  {
    key: 'kb3',
    label: '故障诊断与排除',
    icon: () => h(BookOutlined),
    children: [
      {
        key: 'kb3-1',
        label: '电力闪变故障分析',
        description: '分析电力闪变的原因、影响及诊断方法。',
        fullContent: '<p>电力闪变通常由电弧炉、轧钢机等冲击性负荷引起，表现为电压的快速波动，影响用电设备的正常运行。</p><p>诊断方法包括谐波分析、电压监测和故障录波分析。</p>',
      },
    ],
  },
]);

const knowledgeBaseItems = computed(() => {
  if (!searchValue.value) {
    return allKnowledgeBaseData.value;
  }
  const filteredItems: any[] = [];
  allKnowledgeBaseData.value.forEach(category => {
    const filteredChildren = category.children.filter(item =>
      item.label.includes(searchValue.value) || item.description.includes(searchValue.value) || item.fullContent.includes(searchValue.value)
    );
    if (filteredChildren.length > 0) {
      filteredItems.push({
        ...category,
        children: filteredChildren.map(child => ({
          ...child,
          icon: () => h(FileTextOutlined), // Use a file icon for search results
        })),
      });
    }
  });
  return filteredItems;
});

const selectedContent = computed(() => {
  if (selectedKeys.value.length === 0) {
    return null;
  }
  const key = selectedKeys.value[0];
  for (const category of allKnowledgeBaseData.value) {
    const found = category.children.find(item => item.key === key);
    if (found) {
      return found;
    }
  }
  return null;
});

const onSearch = (value: string) => {
  console.log('Search:', value);
  // Filtering is handled by the computed property `knowledgeBaseItems`
  // If a search result is clicked, it will update selectedKeys
  if (knowledgeBaseItems.value.length > 0 && knowledgeBaseItems.value[0].children.length > 0) {
    selectedKeys.value = [knowledgeBaseItems.value[0].children[0].key];
  } else {
    selectedKeys.value = [];
  }
};

const onMenuItemClick = ({ key }: { key: string }) => {
  selectedKeys.value = [key];
};

const isModalVisible = ref(false);

const uploadFormState = reactive({
  fileList: [],
  sliceMethod: undefined,
});

const showModal = () => {
  isModalVisible.value = true;
  // Reset form state when opening modal
  uploadFormState.fileList = [];
  uploadFormState.sliceMethod = undefined;
};

const handleOk = () => {
  // Here you would handle the file upload and slice method selection
  console.log('Files to upload:', uploadFormState.fileList);
  console.log('Slice method:', uploadFormState.sliceMethod);

  // Example: You would typically send these to a backend API
  // axios.post('/api/upload-knowledge', uploadFormState)
  //   .then(response => { /* handle success */ })
  //   .catch(error => { /* handle error */ });

  // Close the modal after handling
  isModalVisible.value = false;
};

const handleCancel = () => {
  isModalVisible.value = false;
};

const handleUploadChange = (info: UploadChangeParam) => {
  if (info.file.status === 'done') {
    console.log(`${info.file.name} file uploaded successfully`);
    // You might want to do something after upload success, like showing a message
  } else if (info.file.status === 'error') {
    console.error(`${info.file.name} file upload failed.`);
    // Handle upload error
  }
};

// Set initial selected item if desired
// onMounted(() => {
//   if (allKnowledgeBaseData.value.length > 0 && allKnowledgeBaseData.value[0].children.length > 0) {
//     selectedKeys.value = [allKnowledgeBaseData.value[0].children[0].key];
//   }
// });
</script>

<style scoped>
/* Add any specific styles for KnowledgeBasePage here */
</style>