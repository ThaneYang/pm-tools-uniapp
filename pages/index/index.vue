<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useHomeData } from '@/composables/useHomeData.js';
import { useToolLauncher } from '@/composables/useToolLauncher.js';

const { banners, quickTools, loading: homeLoading, error: homeError } = useHomeData();
const { openTool, openBanner } = useToolLauncher();
const currentBannerIndex = ref(0);

onShow(() => {
	uni.setNavigationBarTitle({ title: '应用中心' });
});

const tabs = [
	{ id: 'home', text: '首页', icon: '⌂', active: true },
	{ id: 'verify', text: '查权重', icon: '⚚', active: false },
	{ id: 'watermark', text: '去水印', icon: '◫', active: false },
	{ id: 'rank', text: '榜单', icon: '▦', active: false },
	{ id: 'me', text: '我的', icon: '◔', active: false }
];

const currentBanner = computed(() => banners.value?.[currentBannerIndex.value] || banners.value?.[0] || null);
const heroTitle = computed(() => currentBanner.value?.title || '项目管理师考试工具箱');
const heroImage = computed(() => currentBanner.value?.bannerfile?.url || '');

const handleBannerTip = () => {
	uni.showToast({ title: 'MVP 阶段：后续接入引导弹窗', icon: 'none' });
};

const handleSearch = () => {
	uni.showToast({ title: '搜索功能待接入', icon: 'none' });
};

const goPurchase = () => {
	uni.navigateTo({ url: '/pages/ucenter/member-buy/member-buy' });
};

const switchTab = (id) => {
	if (id === 'me') {
		uni.switchTab({ url: '/pages/ucenter/ucenter' });
		return;
	}
	if (id === 'home') return;
	uni.showToast({ title: '功能正在完善中', icon: 'none' });
};

const swiperChange = (e) => {
	currentBannerIndex.value = e.detail.current;
};
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

		<view class="status-bar"></view>

		<view class="topbar">
			<view class="topbar__title-group">
				<text class="topbar__title">轻抖主站</text>
				<text class="topbar__desc">项目管理师考试工具集 · 小程序内嵌 H5</text>
			</view>
			<view class="topbar__actions">
				<view class="dot-btn">•••</view>
				<view class="dot-btn">◉</view>
			</view>
		</view>

		<view class="tip-banner" @click="handleBannerTip">
			<text class="tip-banner__text">点我教你一招，如何将小程序添加到桌面？</text>
			<text class="tip-banner__close">×</text>
		</view>

		<view class="search-bar" @click="handleSearch">
			<text class="search-bar__placeholder">搜索达人、类目、视频、音乐、话题</text>
			<text class="search-bar__icon">⌕</text>
		</view>

		<view v-if="homeError" class="error-banner">
			<text class="error-banner__text">{{ homeError }}</text>
		</view>

		<swiper
			class="hero-swiper"
			circular
			autoplay
			:interval="3500"
			:current="currentBannerIndex"
			@change="swiperChange"
		>
			<swiper-item v-for="banner in banners" :key="banner.id">
				<view class="hero-card" @click="openBanner(banner)">
					<image v-if="banner.bannerfile?.url || heroImage" class="hero-card__image" :src="banner.bannerfile?.url || heroImage" mode="aspectFill"></image>
					<view class="hero-card__overlay">
						<text class="hero-card__title">{{ banner.title || heroTitle }}</text>
					</view>
				</view>
			</swiper-item>
		</swiper>

		<view class="banner-dots" v-if="banners.length > 1">
			<view
				v-for="(_, index) in banners"
				:key="index"
				class="banner-dots__item"
				:class="{ 'banner-dots__item--active': index === currentBannerIndex }"
			/>
		</view>

		<view class="feature-panel">
			<view v-for="item in quickTools" :key="item.id" class="feature-item" @click="openTool(item)">
				<view class="feature-item__icon">{{ item.icon }}</view>
				<text class="feature-item__name">{{ item.name }}</text>
			</view>
		</view>

		<view class="card recent-card">
			<view class="section-head">
				<text class="section-head__title">最近使用</text>
			</view>
			<view class="recent-empty">
				<text class="recent-empty__emoji">😄</text>
				<text class="recent-empty__text">暂无最近使用功能</text>
			</view>
		</view>

		<view class="promo-bar" @click="goPurchase">
			<text>免广告 + 功能升级，点击前往</text>
			<text>›</text>
		</view>

		<view class="bottom-nav">
			<view v-for="item in tabs" :key="item.id" class="bottom-nav__item" :class="{ 'bottom-nav__item--active': item.active }" @click="switchTab(item.id)">
				<text class="bottom-nav__icon">{{ item.icon }}</text>
				<text class="bottom-nav__text">{{ item.text }}</text>
			</view>
		</view>
	</view>
</template>

<style scoped>
.page {
	min-height: 100vh;
	padding: 0 24rpx 28rpx;
	background: linear-gradient(180deg, #5f4ae8 0%, #6f54f2 18%, #f4f5fb 18%, #f4f5fb 100%);
}
.skeleton-page { padding-top: 56rpx; }
.skeleton-grid { display:grid; grid-template-columns: repeat(5, 1fr); gap: 18rpx; }
.skeleton { position: relative; overflow: hidden; background: #e9edf5; border-radius: 28rpx; }
.skeleton::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%); animation: shimmer 1.3s infinite; }
.skeleton--header { height: 92rpx; margin-bottom: 18rpx; }
.skeleton--banner { height: 300rpx; margin-bottom: 20rpx; }
.skeleton--tool { height: 170rpx; }
.skeleton--card { height: 280rpx; margin-top: 20rpx; }
@keyframes shimmer { 100% { transform: translateX(100%); } }
.status-bar { height: 56rpx; }
.topbar { display:flex; align-items:center; justify-content:space-between; color:#fff; margin-bottom: 18rpx; }
.topbar__title { font-size: 36rpx; font-weight: 700; display:block; }
.topbar__desc { font-size: 22rpx; opacity: 0.86; display:block; margin-top: 8rpx; }
.topbar__actions { display:flex; gap: 12rpx; }
.dot-btn { width: 58rpx; height: 58rpx; border-radius: 18rpx; background: rgba(255,255,255,0.16); display:flex; align-items:center; justify-content:center; }
.tip-banner, .search-bar, .card, .feature-panel { background:#fff; border-radius: 28rpx; box-shadow: 0 18rpx 40rpx rgba(24, 28, 43, 0.08); }
.tip-banner { display:flex; align-items:center; justify-content:space-between; padding: 18rpx 20rpx; margin-bottom: 18rpx; color:#fff; background: rgba(255,255,255,0.18); }
.search-bar { display:flex; align-items:center; justify-content:space-between; padding: 22rpx 24rpx; color:#94a3b8; margin-bottom: 20rpx; }
.search-bar__placeholder { font-size: 28rpx; }
.search-bar__icon { color:#5f4ae8; font-size: 36rpx; }
.error-banner { margin-bottom: 16rpx; padding: 18rpx 20rpx; border-radius: 24rpx; background: rgba(255,255,255,0.92); color: #b91c1c; box-shadow: 0 12rpx 30rpx rgba(24, 28, 43, 0.08); }
.error-banner__text { font-size: 24rpx; }
.hero-swiper { height: 300rpx; margin-bottom: 12rpx; }
.hero-card { height: 300rpx; border-radius: 28rpx; overflow:hidden; position:relative; }
.hero-card__image { width: 100%; height: 100%; }
.hero-card__overlay { position:absolute; inset:0; display:flex; align-items:flex-end; padding: 24rpx; background: linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.58) 100%); }
.hero-card__title { color:#fff; font-size: 34rpx; font-weight: 800; }
.banner-dots { display:flex; justify-content:center; gap: 10rpx; margin-bottom: 20rpx; }
.banner-dots__item { width: 14rpx; height: 14rpx; border-radius: 999rpx; background: rgba(255,255,255,0.35); }
.banner-dots__item--active { width: 30rpx; background: #fff; }
.feature-panel { display:grid; grid-template-columns: repeat(5, 1fr); gap: 18rpx; padding: 26rpx 18rpx; margin-bottom: 20rpx; }
.feature-item { display:flex; flex-direction:column; align-items:center; gap: 10rpx; }
.feature-item__icon { width: 92rpx; height: 92rpx; border-radius: 26rpx; display:flex; align-items:center; justify-content:center; font-size: 42rpx; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color:#fff; }
.feature-item__name { font-size: 24rpx; color:#111827; text-align:center; }
.card { padding: 24rpx; margin-bottom: 20rpx; }
.section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom: 20rpx; }
.section-head__title { font-size: 32rpx; font-weight: 700; color:#111827; }
.recent-empty { height: 220rpx; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#cbd5e1; }
.recent-empty__emoji { font-size: 54rpx; }
.recent-empty__text { margin-top: 14rpx; font-size: 26rpx; color:#cbd5e1; }
.promo-bar { position: sticky; bottom: 118rpx; margin: 0 auto 24rpx; width: 100%; border-radius: 999rpx; padding: 20rpx 28rpx; background: linear-gradient(90deg, #ff4d4f 0%, #ff7a45 100%); color:#fff; display:flex; align-items:center; justify-content:space-between; font-weight: 700; box-shadow: 0 20rpx 34rpx rgba(255, 77, 79, 0.28); }
.bottom-nav { position: sticky; bottom: 0; margin-top: 12rpx; background: rgba(255,255,255,0.92); border-radius: 28rpx 28rpx 0 0; padding: 16rpx 10rpx 24rpx; display:grid; grid-template-columns: repeat(5, 1fr); }
.bottom-nav__item { display:flex; flex-direction:column; align-items:center; gap: 8rpx; color:#64748b; }
.bottom-nav__item--active { color:#5f4ae8; }
.bottom-nav__icon { font-size: 34rpx; }
.bottom-nav__text { font-size: 22rpx; }
</style>
