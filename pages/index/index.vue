<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useHomeData } from "@/composables/useHomeData.js";
import { useToolLauncher } from "@/composables/useToolLauncher.js";
import { useRecentTools } from "@/composables/useRecentTools.js";

const {
  banners,
  quickTools,
  loading: homeLoading,
  error: homeError,
} = useHomeData();
const { openTool, openBanner } = useToolLauncher();
const { recentTools, clearRecent } = useRecentTools();
const currentBannerIndex = ref(0);

onShow(() => {
  uni.setNavigationBarTitle({ title: "应用中心" });
});

const currentBanner = computed(
  () => banners.value?.[currentBannerIndex.value] || banners.value?.[0] || null,
);
const heroTitle = computed(
  () => currentBanner.value?.title || "项目管理师考试工具箱",
);
const heroImage = computed(() => currentBanner.value?.image || "");

// 最近使用列表（snapshot 自带 id/name/icon/url/jumpType，按 usedAt 倒序）
const recentToolsList = computed(() => recentTools.value || []);

// ====== 添加到桌面 引导弹窗 ======
const showDesktopTip = ref(false);
const desktopTip = ref({
  title: "添加到桌面",
  platform: "",
  steps: [],
});

// 顶部"添加到桌面"提示条：用户主动关闭后，缓存起来不再出现
const TIP_BANNER_DISMISSED_KEY = "pm_tip_banner_dismissed";
const tipBannerDismissed = ref(false);
try {
  tipBannerDismissed.value = !!uni.getStorageSync(TIP_BANNER_DISMISSED_KEY);
} catch (e) {
  tipBannerDismissed.value = false;
}

const dismissTipBanner = () => {
  tipBannerDismissed.value = true;
  try {
    uni.setStorageSync(TIP_BANNER_DISMISSED_KEY, true);
  } catch (e) {
    // 存储失败静默忽略
  }
};

const resetTipBanner = () => {
  tipBannerDismissed.value = false;
  try {
    uni.removeStorageSync(TIP_BANNER_DISMISSED_KEY);
  } catch (e) {
    // ignore
  }
};

const DESKTOP_TIP_MAP = {
  "mp-weixin": {
    title: "添加到桌面",
    platform: "微信",
    steps: [
      "在页面右上角点击「···」按钮",
      "在弹出菜单里选择「添加到桌面」",
      "在系统弹窗中点击「添加」即可",
    ],
  },
  "mp-alipay": {
    title: "添加到桌面",
    platform: "支付宝",
    steps: [
      "在页面右上角点击「+」按钮",
      "在弹出菜单里选择「添加到桌面」",
      "在系统弹窗中点击「添加」即可",
    ],
  },
  "mp-toutiao": {
    title: "添加到桌面",
    platform: "抖音",
    steps: [
      "在页面右上角点击「···」按钮",
      "在弹出菜单里选择「添加到桌面」",
      "在系统弹窗中点击「添加」即可",
    ],
  },
  "mp-baidu": {
    title: "添加到桌面",
    platform: "百度",
    steps: [
      "在页面右上角点击「···」按钮",
      "在弹出菜单里选择「添加到桌面」",
      "在系统弹窗中点击「添加」即可",
    ],
  },
  "mp-qq": {
    title: "添加到桌面",
    platform: "QQ",
    steps: [
      "在页面右上角点击「···」按钮",
      "在弹出菜单里选择「添加到桌面」",
      "在系统弹窗中点击「添加」即可",
    ],
  },
  h5: {
    title: "添加到主屏幕",
    platform: "浏览器",
    steps: [
      "iOS Safari：点击底部分享按钮 → 选择「添加到主屏幕」",
      "Android Chrome：点击右上角 ⋮ → 选择「添加到主屏幕」",
    ],
  },
  app: {
    title: "添加到桌面",
    platform: "App",
    steps: ["App 一般已默认安装到桌面，无需重复添加"],
  },
};

function resolveDesktopTip() {
  try {
    const sys = uni.getSystemInfoSync();
    const platform = sys.uniPlatform || sys.platform || "default";
    return (
      DESKTOP_TIP_MAP[platform] || {
        title: "添加到桌面",
        platform: "",
        steps: [
          "在页面右上角找到「更多」按钮（通常显示为 ···）",
          "在弹出菜单里选择「添加到桌面」",
          "在系统弹窗中点击「添加」即可",
        ],
      }
    );
  } catch (e) {
    return (
      DESKTOP_TIP_MAP["default"] ||
      DESKTOP_TIP_MAP[Object.keys(DESKTOP_TIP_MAP)[0]]
    );
  }
}

const handleBannerTip = () => {
  desktopTip.value = resolveDesktopTip();
  showDesktopTip.value = true;
};

const closeDesktopTip = () => {
  showDesktopTip.value = false;
  // 用户已经看过引导，把顶部提示条一起隐掉并缓存，下次启动不再出现
  dismissTipBanner();
};

const handleSearch = () => {
  uni.showToast({ title: "搜索功能待接入", icon: "none" });
};

const goPurchase = () => {
  uni.navigateTo({ url: "/pages/ucenter/member-buy/member-buy" });
};

const swiperChange = (e) => {
  currentBannerIndex.value = e.detail.current;
};

// 真实状态栏高度（px -> rpx）。H5 端走 env()，小程序/App 端走 statusBarHeight。
const statusBarStyle = ref("height: env(safe-area-inset-top);");
try {
  const info = uni.getSystemInfoSync();
  const height = info.statusBarHeight || 0;
  if (height > 0) {
    // px 转 rpx（以 750rpx 设计宽为基准）
    const rpxHeight = Math.round((height * 750) / (info.windowWidth || 375));
    statusBarStyle.value = `height: ${rpxHeight}rpx;`;
  }
} catch (e) {
  // 保留 env() 兜底
}
</script>

<template>
  <view class="page">
    <view v-if="homeLoading" class="skeleton-page">
      <view class="skeleton skeleton--header"></view>
      <view class="skeleton skeleton--banner"></view>
      <view class="skeleton-grid">
        <view v-for="n in 5" :key="n" class="skeleton skeleton--tool"></view>
      </view>
      <view class="skeleton skeleton--card"></view>
    </view>

    <view class="status-bar" :style="statusBarStyle"></view>

    <view class="topbar">
      <view class="topbar__title-group">
        <text class="topbar__title">软考刷题工具集</text>
        <text class="topbar__desc">项目管理师考试工具集 · 小程序内嵌 H5</text>
      </view>
    </view>

    <view v-if="!tipBannerDismissed" class="tip-banner" @click="handleBannerTip">
      <text class="tip-banner__text">
        点我教你一招，如何将小程序添加到桌面？
      </text>
      <text class="tip-banner__close" @click.stop="dismissTipBanner">×</text>
    </view>

    <!-- <view class="search-bar" @click="handleSearch">
      <text class="search-bar__placeholder">
        搜索达人、类目、视频、音乐、话题
      </text>
      <text class="search-bar__icon">⌕</text>
    </view> -->

    <view v-if="homeError" class="error-banner">
      <text class="error-banner__text">{{ homeError }}</text>
    </view>

    <template v-if="banners.length > 0">
      <swiper
        class="hero-swiper"
        circular
        autoplay
        :interval="4000"
        :current="currentBannerIndex"
        @change="swiperChange">
        <swiper-item v-for="banner in banners" :key="banner.id">
          <view class="hero-card" @click="openBanner(banner)">
            <image
              v-if="banner.image"
              class="hero-card__image"
              :src="banner.image"
              mode="aspectFill"></image>
            <view v-else class="hero-card__placeholder">
              <text class="hero-card__placeholder-text">
                {{ banner.title || "敬请期待" }}
              </text>
            </view>
            <!-- <view class="hero-card__overlay">
              <text class="hero-card__title">
                {{ banner.title || heroTitle }}
              </text>
            </view> -->
          </view>
        </swiper-item>
      </swiper>
    </template>
    <view v-else-if="!homeLoading && !homeError" class="banner-empty">
      <text class="banner-empty__text">暂无 Banner 配置，请到云后台添加</text>
    </view>

    <view class="banner-dots" v-if="banners.length > 1">
      <view
        v-for="(_, index) in banners"
        :key="index"
        class="banner-dots__item"
        :class="{
          'banner-dots__item--active': index === currentBannerIndex,
        }" />
    </view>

    <view class="feature-panel">
      <view
        v-for="item in quickTools"
        :key="item.id"
        class="feature-item"
        @click="openTool(item)">
        <view class="feature-item__icon">{{ item.icon }}</view>
        <text class="feature-item__name">{{ item.name }}</text>
      </view>
    </view>

    <view class="card recent-card">
      <view class="section-head">
        <text class="section-head__title">最近使用</text>
        <text
          v-if="recentToolsList.length > 0"
          class="section-head__action"
          @click="clearRecent">
          清空
        </text>
      </view>
      <scroll-view
        v-if="recentToolsList.length > 0"
        scroll-x
        class="recent-list"
        :show-scrollbar="false"
        enhanced
        :enable-flex="true">
        <view
          v-for="tool in recentToolsList"
          :key="tool.id"
          class="recent-item"
          @click="openTool(tool)">
          <view class="recent-item__icon">{{ tool.icon }}</view>
          <text class="recent-item__name">{{ tool.name }}</text>
        </view>
      </scroll-view>
      <view v-else class="recent-empty">
        <text class="recent-empty__emoji">😄</text>
        <text class="recent-empty__text">暂无最近使用功能</text>
      </view>
    </view>

    <!-- <view class="promo-bar" @click="goPurchase">
      <text>免广告 + 功能升级，点击前往</text>
      <text>›</text>
    </view> -->

    <!-- 添加到桌面 引导弹窗 -->
    <view v-if="showDesktopTip" class="desktop-modal" @click="closeDesktopTip">
      <view class="desktop-modal__card" @click.stop>
        <view class="desktop-modal__head">
          <view class="desktop-modal__head-left">
            <text class="desktop-modal__title">{{ desktopTip.title }}</text>
            <text v-if="desktopTip.platform" class="desktop-modal__platform">
              {{ desktopTip.platform }}
            </text>
          </view>
          <text class="desktop-modal__close" @click="closeDesktopTip">×</text>
        </view>

        <view class="desktop-modal__phone">
          <view class="desktop-modal__phone-statusbar"></view>
          <view class="desktop-modal__phone-header">
            <view class="desktop-modal__phone-back">‹</view>
            <view class="desktop-modal__phone-title">软考刷题工具集</view>
            <view class="desktop-modal__phone-more">
              <text class="desktop-modal__phone-dot"></text>
              <text class="desktop-modal__phone-dot"></text>
              <text class="desktop-modal__phone-dot"></text>
            </view>
          </view>
          <view class="desktop-modal__phone-arrow">↓</view>
          <view class="desktop-modal__phone-bubble">
            <text>添加到桌面</text>
          </view>
        </view>

        <view class="desktop-modal__steps">
          <view
            v-for="(step, i) in desktopTip.steps"
            :key="i"
            class="desktop-modal__step">
            <text class="desktop-modal__step-index">{{ i + 1 }}</text>
            <text class="desktop-modal__step-text">{{ step }}</text>
          </view>
        </view>

        <view class="desktop-modal__foot">
          <text class="desktop-modal__btn" @click="closeDesktopTip">
            我知道了
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 24rpx 28rpx;
  background: linear-gradient(
    180deg,
    #5f4ae8 0%,
    #6f54f2 18%,
    #f4f5fb 18%,
    #f4f5fb 100%
  );
  box-sizing: border-box;
}
.skeleton-page {
  padding-top: 56rpx;
}
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18rpx;
}
.skeleton {
  position: relative;
  overflow: hidden;
  background: #e9edf5;
  border-radius: 28rpx;
}
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.3s infinite;
}
.skeleton--header {
  height: 92rpx;
  margin-bottom: 18rpx;
}
.skeleton--banner {
  height: 300rpx;
  margin-bottom: 20rpx;
}
.skeleton--tool {
  height: 170rpx;
}
.skeleton--card {
  height: 280rpx;
  margin-top: 20rpx;
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
.status-bar {
  min-height: 44rpx;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  margin-bottom: 18rpx;
}
.topbar__title {
  font-size: 36rpx;
  font-weight: 700;
  display: block;
}
.topbar__desc {
  font-size: 22rpx;
  opacity: 0.86;
  display: block;
  margin-top: 8rpx;
}
.tip-banner,
.search-bar,
.card,
.feature-panel {
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 18rpx 40rpx rgba(24, 28, 43, 0.08);
}
.tip-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 20rpx;
  margin-bottom: 18rpx;
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
}
.tip-banner__close {
  /* 扩大顶部条 × 的点击热区 */
  padding: 16rpx;
  margin: -16rpx 0;
  margin-right: -16rpx;
  font-size: 32rpx;
  line-height: 1;
  font-weight: 500;
}
.search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 24rpx;
  color: #94a3b8;
  margin-bottom: 20rpx;
}
.search-bar__placeholder {
  font-size: 28rpx;
}
.search-bar__icon {
  color: #5f4ae8;
  font-size: 36rpx;
}
.error-banner {
  margin-bottom: 16rpx;
  padding: 18rpx 20rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #b91c1c;
  box-shadow: 0 12rpx 30rpx rgba(24, 28, 43, 0.08);
}
.error-banner__text {
  font-size: 24rpx;
}
.hero-swiper {
  height: 300rpx;
  margin-bottom: 12rpx;
}
.banner-empty {
  height: 200rpx;
  margin-bottom: 12rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 18rpx 40rpx rgba(24, 28, 43, 0.06);
}
.banner-empty__text {
  color: #94a3b8;
  font-size: 26rpx;
}
.hero-card {
  height: 300rpx;
  border-radius: 28rpx;
  overflow: hidden;
  position: relative;
}
.hero-card__image {
  width: 100%;
  height: 100%;
}
.hero-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%);
}
.hero-card__placeholder-text {
  font-size: 30rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  color: #fff;
}
.hero-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 24rpx;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.08) 0%,
    rgba(15, 23, 42, 0.58) 100%
  );
}
.hero-card__title {
  color: #fff;
  font-size: 34rpx;
  font-weight: 800;
}
.banner-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14rpx;
  margin-bottom: 20rpx;
}
.banner-dots__item {
  width: 16rpx;
  height: 16rpx;
  border-radius: 999rpx;
  background: rgba(91, 74, 232, 0.25);
  box-shadow: 0 2rpx 6rpx rgba(91, 74, 232, 0.12);
  transition:
    width 0.25s ease,
    background 0.25s ease;
}
.banner-dots__item--active {
  width: 40rpx;
  background: linear-gradient(90deg, #5f4ae8 0%, #8b5cf6 100%);
  box-shadow: 0 4rpx 14rpx rgba(91, 74, 232, 0.45);
}
.feature-panel {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18rpx;
  padding: 26rpx 18rpx;
  margin-bottom: 20rpx;
}
.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}
.feature-item__icon {
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
.feature-item__name {
  font-size: 24rpx;
  color: #111827;
  text-align: center;
}
.card {
  padding: 24rpx;
  margin-bottom: 20rpx;
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
.section-head__action {
  font-size: 24rpx;
  color: #5f4ae8;
  font-weight: 500;
  padding: 4rpx 8rpx;
}
.recent-list {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  margin: 0 -24rpx;
  padding: 4rpx 24rpx 8rpx;
}
.recent-item {
  flex-shrink: 0;
  width: 140rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 0;
  margin-right: 12rpx;
}
.recent-item:last-child {
  margin-right: 0;
}
.recent-item__icon {
  width: 84rpx;
  height: 84rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: #fff;
  margin-bottom: 12rpx;
  box-shadow: 0 6rpx 18rpx rgba(99, 102, 241, 0.22);
}
.recent-item__name {
  font-size: 22rpx;
  color: #111827;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.recent-empty {
  height: 220rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
}
.recent-empty__emoji {
  font-size: 54rpx;
}
.recent-empty__text {
  margin-top: 14rpx;
  font-size: 26rpx;
  color: #cbd5e1;
}
.promo-bar {
  position: sticky;
  bottom: 118rpx;
  margin: 0 auto 24rpx;
  width: 100%;
  border-radius: 999rpx;
  padding: 20rpx 28rpx;
  background: linear-gradient(90deg, #ff4d4f 0%, #ff7a45 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  box-sizing: border-box;
  box-shadow: 0 20rpx 34rpx rgba(255, 77, 79, 0.28);
}

/* ====== 添加到桌面 引导弹窗 ====== */
.desktop-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  box-sizing: border-box;
}
.desktop-modal__card {
  width: 100%;
  max-width: 620rpx;
  background: #fff;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 24rpx 60rpx rgba(15, 23, 42, 0.25);
  animation: desktopModalIn 0.22s ease-out;
}
@keyframes desktopModalIn {
  from {
    opacity: 0;
    transform: translateY(40rpx) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.desktop-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 8rpx;
}
.desktop-modal__head-left {
  display: flex;
  gap: 14rpx;
}
.desktop-modal__title {
  font-size: 36rpx;
  font-weight: 800;
  color: #111827;
  line-height: 1em;
}
.desktop-modal__platform {
  font-size: 22rpx;
  color: #fff;
  background: linear-gradient(135deg, #5f4ae8 0%, #8b5cf6 100%);
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-weight: 600;
}
.desktop-modal__close {
  /* 扩大 × 按钮的点击热区，最低 80rpx 命中区 */
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80rpx;
  min-height: 80rpx;
  padding: 0 16rpx;
  margin: -16rpx -8rpx -16rpx 0;
  font-size: 48rpx;
  color: #94a3b8;
  line-height: 1;
  font-weight: 300;
  border-radius: 999rpx;
  transition: background 0.15s ease, color 0.15s ease;
}
.desktop-modal__close:active {
  background: rgba(148, 163, 184, 0.15);
  color: #475569;
}
.desktop-modal__phone {
  margin: 12rpx 32rpx 8rpx;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  border-radius: 24rpx;
  padding: 18rpx 20rpx 24rpx;
  position: relative;
}
.desktop-modal__phone-statusbar {
  height: 12rpx;
  background: rgba(15, 23, 42, 0.08);
  border-radius: 6rpx;
  width: 60%;
  margin: 0 auto 14rpx;
}
.desktop-modal__phone-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16rpx;
  padding: 14rpx 18rpx;
  box-shadow: 0 4rpx 12rpx rgba(91, 74, 232, 0.08);
}
.desktop-modal__phone-back {
  font-size: 36rpx;
  color: #5f4ae8;
  font-weight: 700;
  width: 40rpx;
}
.desktop-modal__phone-title {
  font-size: 26rpx;
  color: #1e293b;
  font-weight: 600;
}
.desktop-modal__phone-more {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: linear-gradient(135deg, #5f4ae8 0%, #8b5cf6 100%);
  border-radius: 999rpx;
  padding: 8rpx 16rpx;
  position: relative;
  animation: dotPulse 1.4s ease-in-out infinite;
}
@keyframes dotPulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(91, 74, 232, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 12rpx rgba(91, 74, 232, 0);
  }
}
.desktop-modal__phone-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: #fff;
}
.desktop-modal__phone-arrow {
  position: absolute;
  top: 10rpx;
  right: 55rpx;
  font-size: 32rpx;
  color: #5f4ae8;
  font-weight: 800;
  animation: arrowBounce 1.2s ease-in-out infinite;
}
@keyframes arrowBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10rpx);
  }
}
.desktop-modal__phone-bubble {
  position: absolute;
  top: 105rpx;
  right: 36rpx;
  background: #fff;
  color: #5f4ae8;
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  box-shadow: 0 6rpx 16rpx rgba(91, 74, 232, 0.18);
  border: 2rpx solid rgba(91, 74, 232, 0.2);
}
.desktop-modal__steps {
  margin: 24rpx 32rpx 8rpx;
  background: #f8fafc;
  border-radius: 20rpx;
  padding: 20rpx 22rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}
.desktop-modal__step {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}
.desktop-modal__step-index {
  flex-shrink: 0;
  width: 38rpx;
  height: 38rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #5f4ae8 0%, #8b5cf6 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rpx;
}
.desktop-modal__step-text {
  flex: 1;
  font-size: 28rpx;
  color: #1e293b;
  line-height: 1.6;
}
.desktop-modal__foot {
  padding: 24rpx 32rpx 36rpx;
}
.desktop-modal__btn {
  display: block;
  text-align: center;
  background: linear-gradient(135deg, #5f4ae8 0%, #8b5cf6 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  padding: 22rpx 0;
  border-radius: 999rpx;
  box-shadow: 0 10rpx 24rpx rgba(91, 74, 232, 0.32);
  letter-spacing: 2rpx;
}
</style>
