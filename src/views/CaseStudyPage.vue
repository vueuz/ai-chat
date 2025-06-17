<template>
  <div :style="styles.container">
    <a-row :gutter="[16, 16]">
      <a-col v-for="item in caseStudies" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
        <a-card hoverable :style="styles.card">
          <template #cover>
            <img v-if="item.image" :alt="item.title" :src="item.image" :style="styles.cardImage" />
            <div v-else :style="styles.cardPlaceholder">{{ item.title.charAt(0) }}</div>
          </template>
          <a-card-meta :title="item.title" :description="item.description">
            <template #avatar>
              <a-avatar :src="item.avatar" v-if="item.avatar" />
              <a-avatar v-else style="background-color: #87d068">{{ item.author.charAt(0) }}</a-avatar>
            </template>
          </a-card-meta>
          <template #actions>
            <a-tooltip title="点赞">
              <HeartOutlined key="heart" />
            </a-tooltip>
            <a-tooltip title="分享">
              <ShareAltOutlined key="share" />
            </a-tooltip>
            <a-tooltip title="更多">
              <EllipsisOutlined key="ellipsis" />
            </a-tooltip>
          </template>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { theme, Card as ACard, Row as ARow, Col as ACol, Avatar as AAvatar, Tooltip as ATooltip } from 'ant-design-vue';
import { HeartOutlined, ShareAltOutlined, EllipsisOutlined } from '@ant-design/icons-vue';

const { token } = theme.useToken();

const styles = computed(() => ({
  container: {
    padding: token.value.paddingLG + 'px',
    backgroundColor: token.value.colorBgContainer,
    borderRadius: token.value.borderRadiusLG + 'px',
    height: '100%',
    overflowY: 'auto',
  },
  card: {
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  cardPlaceholder: {
    width: '100%',
    height: '180px',
    backgroundColor: token.value.colorPrimaryBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    color: token.value.colorPrimary,
  },
}));

const caseStudies = ref([
  {
    id: '1',
    title: 'C园区变压器故障快速定位',
    description: '通过AI分析，在15分钟内定位变压器异常，避免了大规模停电事故。',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAWKzocRSE.png',
    author: '王凯',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
  },
  {
    id: '2',
    title: '智能巡检系统在输电线路中的应用',
    description: '利用无人机和图像识别技术，大幅提升巡检效率和准确性。',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAWKzocRSE.png',
    author: '李明',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2',
  },
  {
    id: '3',
    title: '新能源并网稳定性优化方案',
    description: '针对风电场并网波动性问题，提出并实施了有效的解决方案。',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAWKzocRSE.png',
    author: '张华',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3',
  },
  {
    id: '4',
    title: '电力设备预测性维护实践',
    description: '通过大数据分析，实现对关键电力设备的故障预测，提前进行维护。',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAWKzocRSE.png',
    author: '赵丽',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=4',
  },
  {
    id: '5',
    title: '城市电网负荷智能调度',
    description: '优化城市电网负荷分配，提高供电可靠性和能源利用效率。',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAWKzocRSE.png',
    author: '钱强',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=5',
  },
  {
    id: '6',
    title: '变电站智能安防系统升级',
    description: '引入AI视频监控和生物识别技术，全面提升变电站安全等级。',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAWKzocRSE.png',
    author: '孙燕',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=6',
  },
]);
</script>

<style scoped>
/* Add any specific styles for CaseStudyPage here */
</style>