<template>
  <div class="settings-page">
    <h1>设置</h1>
    <a-tabs default-active-key="1" tab-position="left">
      <a-tab-pane key="1" tab="个人账户">
        <a-form :model="accountForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
          <a-form-item label="用户名">
            <a-input v-model:value="accountForm.username" />
          </a-form-item>
          <a-form-item label="邮箱">
            <a-input v-model:value="accountForm.email" />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
            <a-button type="primary">保存</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="主题设置">
        <a-form :model="themeForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
          <a-form-item label="主题">
            <a-select v-model:value="themeForm.theme">
              <a-select-option value="light">亮色主题</a-select-option>
              <a-select-option value="dark">暗色主题</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
            <a-button type="primary">保存</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="3" tab="语言设置">
        <a-form :model="languageForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
          <a-form-item label="语言">
            <a-select v-model:value="languageForm.language">
              <a-select-option value="zh-CN">简体中文</a-select-option>
              <a-select-option value="en-US">English</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
            <a-button type="primary">保存</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const accountForm = reactive({
  username: 'TestUser',
  email: 'test@example.com',
});

const themeForm = reactive({
  theme: 'light',
});

const languageForm = reactive({
  language: 'zh-CN',
});
</script>

<style scoped>
.settings-page {
  padding: 20px;
}
</style>