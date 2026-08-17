<script setup>
import { computed, ref } from "vue";
import { useMemberCenter } from "@/composables/useMemberCenter.js";
import { useHomeData } from "@/composables/useHomeData.js";
import { useToolLauncher } from "@/composables/useToolLauncher.js";
import { MEMBER_FAQS } from "@/common/mvpData.js";

const {
  userName,
  avatarUrl,
  inviteCode,
  vipStatus,
  memberRemainingDays,
  memberExpireDate,
} = useMemberCenter();
const { quickTools } = useHomeData();
const { openTool } = useToolLauncher();
const faqList = MEMBER_FAQS;
const vipDetailText = computed(() => vipStatus.value || "未开通会员");

const openFaq = (faq) => {
  uni.showToast({ title: faq, icon: "none" });
};

const goInviteCode = () => {
  uni.showToast({ title: "邀请码输入页待接入", icon: "none" });
};

const copyInviteCode = async () => {
  try {
    await uni.setClipboardData({ data: inviteCode.value });
    uni.showToast({ title: "已复制", icon: "success" });
  } catch (error) {
    uni.showToast({ title: "复制失败", icon: "none" });
  }
};

// 真实状态栏高度（px -> rpx）。H5 端走 env()，小程序/App 端走 statusBarHeight。
const statusBarStyle = ref("height: env(safe-area-inset-top);");
try {
  const info = uni.getSystemInfoSync();
  const height = info.statusBarHeight || 0;
  if (height > 0) {
    const rpxHeight = Math.round((height * 750) / (info.windowWidth || 375));
    statusBarStyle.value = `height: ${rpxHeight}rpx;`;
  }
} catch (e) {
  // 保留 env() 兜底
}
</script>

<template>
  <view class="page">
    <view class="status-bar" :style="statusBarStyle"></view>

    <view class="header">
      <text class="header__title">我的</text>
    </view>

    <view class="profile card">
      <image class="profile__avatar" :src="avatarUrl" mode="aspectFill"></image>
      <view class="profile__info">
        <view class="profile__name-row">
          <text class="profile__name">{{ userName }}</text>
          <text class="profile__copy" @click="copyInviteCode">复制</text>
        </view>
        <text class="profile__meta">轻抖号 / 邀请码：{{ inviteCode }}</text>
        <text class="profile__vip">
          剩余 {{ memberRemainingDays }} 天 · 到期 {{ memberExpireDate }}
        </text>
        <text class="profile__vip profile__vip--sub">{{ vipDetailText }}</text>
      </view>
    </view>

    <view class="invite card" @click="goInviteCode">
      <text class="invite__label">邀请码</text>
      <text class="invite__value">填写 ›</text>
    </view>

    <view class="card">
      <view class="section-head">
        <text class="section-head__title">常用工具</text>
      </view>
      <view class="icon-grid">
        <view
          v-for="item in quickTools"
          :key="item.id"
          class="icon-grid__item"
          @click="openTool(item)">
          <view class="icon-grid__icon">{{ item.icon }}</view>
          <text class="icon-grid__text">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <view class="card classroom">
      <view class="section-head">
        <text class="section-head__title">常见问题</text>
      </view>
      <view
        v-for="faq in faqList"
        :key="faq"
        class="faq-item"
        @click="openFaq(faq)">
        <text>{{ faq }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f4f5fb;
  padding: 0 24rpx 24rpx;
  box-sizing: border-box;
}
.status-bar {
  min-height: 44rpx;
}
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 24rpx 0 16rpx;
}
.header__title {
  font-size: 36rpx;
  font-weight: 700;
  color: #111827;
}
.card {
  background: #fff;
  border-radius: 28rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 18rpx 40rpx rgba(24, 28, 43, 0.08);
}
.profile {
  display: flex;
  align-items: center;
  gap: 22rpx;
}
.profile__avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  background: #e2e8f0;
}
.profile__info {
  flex: 1;
}
.profile__name-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.profile__name {
  font-size: 34rpx;
  font-weight: 700;
  color: #111827;
}
.profile__copy {
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 22rpx;
}
.profile__meta {
  display: block;
  margin-top: 10rpx;
  color: #94a3b8;
  font-size: 24rpx;
}
.profile__vip {
  display: inline-flex;
  margin-top: 10rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid #111827;
  color: #111827;
  font-size: 22rpx;
}
.profile__vip--sub {
  margin-top: 8rpx;
  color: #64748b;
  border-color: #e2e8f0;
}
.invite {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.invite__label {
  font-size: 30rpx;
  color: #111827;
}
.invite__value {
  color: #64748b;
  font-size: 28rpx;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.section-head__title {
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18rpx;
}
.icon-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}
.icon-grid__icon {
  width: 92rpx;
  height: 92rpx;
  border-radius: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42rpx;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: #fff;
}
.icon-grid__text {
  font-size: 24rpx;
  color: #111827;
  text-align: center;
}
.classroom .section-head__title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}
.faq-item {
  padding: 22rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
  color: #334155;
  font-size: 26rpx;
}
</style>
