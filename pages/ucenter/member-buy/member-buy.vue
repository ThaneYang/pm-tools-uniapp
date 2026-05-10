<template>
	<view class="page">
		<view class="topbar">
			<text class="topbar__back" @click="goBack">⌂</text>
			<text class="topbar__title">轻抖会员购买</text>
			<text class="topbar__menu">•••</text>
		</view>

		<view class="switcher">
			<view
				v-for="item in memberTabs"
				:key="item.id"
				class="switcher__item"
				:class="{ 'switcher__item--active': currentTab === item.id }"
				@click="currentTab = item.id"
			>
				<text>{{ item.text }}</text>
			</view>
		</view>

		<view class="profile">
			<image class="profile__avatar" :src="avatarUrl" mode="aspectFill"></image>
			<view class="profile__content">
				<view class="profile__line">
					<text class="profile__name">轻抖号：{{ inviteCode }}</text>
					<text class="profile__copy" @click="copyCode">复制</text>
				</view>
				<text class="profile__badge">{{ vipStatus }}</text>
			</view>
		</view>

		<text class="app-usable">APP/小程序可用</text>

		<view class="redeem-card card">
			<view class="section-head">
				<text class="section-head__title">兑换码核销</text>
				<text class="section-head__more">{{ redeemStateText }}</text>
			</view>
			<view class="redeem-input-row">
				<input
					v-model="redeemCode"
					class="redeem-input"
					maxlength="20"
					placeholder="请输入 8 位兑换码"
					placeholder-class="redeem-input__placeholder"
				/>
				<button class="redeem-btn" :loading="redeemLoading" @click="handleRedeem">立即核销</button>
			</view>
			<view v-if="redeemPreview" class="redeem-preview">
				<text class="redeem-preview__label">有效期</text>
				<text class="redeem-preview__value">{{ redeemPreview.duration_label }}</text>
				<text class="redeem-preview__remark">{{ redeemPreview.remark || '请确认兑换码正确后再核销' }}</text>
			</view>
		</view>

		<view class="plan-row">
			<view
				v-for="plan in plans"
				:key="plan.id"
				class="plan-card"
				:class="{ 'plan-card--active': selectedPlan.id === plan.id }"
				@click="selectedPlan = plan"
			>
				<text class="plan-card__badge">{{ plan.badge }}</text>
				<text class="plan-card__name">{{ plan.name }}</text>
				<text class="plan-card__price">¥{{ plan.price }}<text class="plan-card__price-small">.00</text></text>
				<text class="plan-card__period">{{ plan.period }}</text>
				<text class="plan-card__foot">限时特惠</text>
			</view>
		</view>

		<view class="card">
			<view class="section-title">手机版本会员权益简介</view>
			<view class="benefit-table">
				<view class="benefit-table__row benefit-table__row--head">
					<text>权益</text>
					<text>季卡</text>
					<text>年卡</text>
					<text>终身卡</text>
				</view>
				<view v-for="benefit in benefitRows" :key="benefit.label" class="benefit-table__row">
					<text>{{ benefit.label }}</text>
					<text v-for="value in benefit.values" :key="value">{{ value }}</text>
				</view>
			</view>
		</view>

		<view class="price-bar">
			<text>应付 {{ selectedPlan.price }}.00 + 苹果手续费 ¥25.64 =</text>
			<text class="price-bar__value">¥213.64</text>
		</view>

		<button class="submit-btn" @click="payNow">¥{{ payAmount }} 立即开通</button>
		<view class="agreement">
			<text>○ 已阅读《会员服务协议》</text>
			<text class="agreement__link">对公转账</text>
		</view>

		<view class="faq card">
			<view v-for="faq in faqList" :key="faq" class="faq__item" @click="handleFaq(faq)">{{ faq }}</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { MEMBER_FAQS, MEMBER_PLANS } from '@/common/mvpData.js';
import { useMemberCenter } from '@/composables/useMemberCenter.js';

const { avatarUrl, inviteCode, vipStatus, refresh } = useMemberCenter();
const memberTabs = [
	{ id: 'mobile', text: '手机版' },
	{ id: 'desktop', text: '电脑版' },
	{ id: 'team', text: '团队版' }
];
const currentTab = ref('mobile');
const plans = MEMBER_PLANS;
const selectedPlan = ref(plans[0]);
const faqList = MEMBER_FAQS;
const payAmount = computed(() => `${(selectedPlan.value.price + 25.64).toFixed(2)}`);
const redeemCode = ref('');
const redeemLoading = ref(false);
const redeemPreview = ref(null);
const redeemStateText = computed(() => (redeemPreview.value ? '已查询' : '待核销'));

const benefitRows = [
	{ label: '去水印 / 文案提取 / 免广告', values: ['✓', '✓', '✓'] },
	{ label: '去水印使用次数/日', values: ['100', '200', '300'] },
	{ label: '会员专属 H5 应用', values: ['✓', '✓', '✓'] }
];

const goBack = () => {
	uni.navigateBack({ delta: 1 });
};

const copyCode = async () => {
	try {
		await uni.setClipboardData({ data: inviteCode.value });
		uni.showToast({ title: '已复制', icon: 'success' });
	} catch (error) {
		uni.showToast({ title: '复制失败', icon: 'none' });
	}
};

const getRedeemClient = () => {
	return uniCloud.importObject('pm-redeem-code', { customUI: true });
};

const previewRedeemCode = async () => {
	const code = redeemCode.value.trim();
	if (!code) {
		redeemPreview.value = null;
		return;
	}
	const client = getRedeemClient();
	const res = await client.preview({ code });
	if (res?.code !== 200) {
		throw new Error(res?.message || '兑换码查询失败');
	}
	redeemPreview.value = res.data;
};

const handleRedeem = async () => {
	const code = redeemCode.value.trim();
	if (!code) {
		uni.showToast({ title: '请输入兑换码', icon: 'none' });
		return;
	}

	redeemLoading.value = true;
	try {
		await previewRedeemCode();
		const client = getRedeemClient();
		const res = await client.redeem({ code });
		if (res?.code !== 200) {
			throw new Error(res?.message || '核销失败');
		}
		uni.showToast({ title: '兑换成功', icon: 'success' });
		redeemCode.value = '';
		redeemPreview.value = null;
		await refresh();
	} catch (error) {
		uni.showToast({ title: error?.message || '核销失败', icon: 'none' });
	} finally {
		redeemLoading.value = false;
	}
};

const payNow = () => {
	uni.showToast({ title: 'MVP：支付能力待接入', icon: 'none' });
};

const handleFaq = (faq) => {
	uni.showToast({ title: faq, icon: 'none' });
};
</script>

<style scoped>
.page { min-height: 100vh; padding: 18rpx 24rpx 28rpx; background: #111; color: #fff; }
.topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom: 24rpx; }
.topbar__title { font-size: 32rpx; font-weight: 700; }
.topbar__back, .topbar__menu { width: 64rpx; height: 64rpx; border-radius: 18rpx; background: #1d1d1d; display:flex; align-items:center; justify-content:center; }
.switcher { display:flex; gap: 12rpx; padding: 8rpx; border-radius: 999rpx; background: #1a1a1a; margin-bottom: 24rpx; }
.switcher__item { flex:1; text-align:center; padding: 14rpx 0; border-radius: 999rpx; color: #d4d4d4; }
.switcher__item--active { background:#0f0f0f; color:#fff; box-shadow: inset 0 0 0 1rpx rgba(255,255,255,0.06); }
.profile { display:flex; align-items:center; gap: 20rpx; margin-bottom: 14rpx; }
.profile__avatar { width: 88rpx; height: 88rpx; border-radius: 50%; }
.profile__line { display:flex; align-items:center; gap: 12rpx; }
.profile__name { font-size: 28rpx; }
.profile__copy { padding: 4rpx 12rpx; border-radius: 999rpx; background:#252525; color:#fff; font-size: 22rpx; }
.profile__badge { display:inline-flex; margin-top: 10rpx; padding: 8rpx 12rpx; border-radius: 12rpx; border: 1rpx solid #4b4b4b; color:#ddd; }
.app-usable { display:block; margin: 28rpx 0 16rpx; color:#bcbcbc; }
.card { background:#171717; border-radius: 24rpx; padding: 20rpx; margin-bottom: 22rpx; }
.section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom: 18rpx; }
.section-head__title { font-size: 30rpx; font-weight: 700; }
.section-head__more { font-size: 22rpx; color:#aaa; }
.redeem-input-row { display:flex; gap: 16rpx; }
.redeem-input { flex:1; height: 88rpx; border-radius: 18rpx; background:#222; padding: 0 24rpx; color:#fff; }
.redeem-input__placeholder { color:#666; }
.redeem-btn { width: 200rpx; border-radius: 18rpx; background: linear-gradient(90deg, #ff3d67 0%, #ff5f88 100%); color:#fff; font-size: 28rpx; }
.redeem-preview { margin-top: 16rpx; padding: 18rpx; border-radius: 18rpx; background: #101010; color:#d4d4d4; }
.redeem-preview__label { display:block; color:#aaa; font-size: 22rpx; }
.redeem-preview__value { display:block; margin-top: 10rpx; font-size: 30rpx; color:#fff; }
.redeem-preview__remark { display:block; margin-top: 10rpx; font-size: 22rpx; color:#8e8e8e; }
.plan-row { display:grid; grid-template-columns: repeat(3, 1fr); gap: 14rpx; margin-bottom: 24rpx; }
.plan-card { position:relative; background:#212121; border-radius: 22rpx; padding: 28rpx 18rpx 20rpx; min-height: 250rpx; }
.plan-card--active { box-shadow: inset 0 0 0 2rpx #ff4d7d; }
.plan-card__badge { position:absolute; top: 10rpx; right: 10rpx; font-size: 20rpx; color:#bcbcbc; }
.plan-card__name { display:block; font-size: 30rpx; margin-top: 22rpx; }
.plan-card__price { display:block; margin-top: 26rpx; font-size: 54rpx; font-weight: 800; color:#fff; }
.plan-card__price-small { font-size: 24rpx; }
.plan-card__period, .plan-card__foot { display:block; margin-top: 10rpx; color:#bcbcbc; }
.section-title { text-align:center; color:#ddd; margin-bottom: 16rpx; }
.benefit-table { border: 1rpx solid #313131; border-radius: 20rpx; overflow:hidden; }
.benefit-table__row { display:grid; grid-template-columns: 1.2fr repeat(3, 1fr); border-top: 1rpx solid #313131; }
.benefit-table__row text { padding: 18rpx 12rpx; border-left: 1rpx solid #313131; text-align:center; }
.benefit-table__row text:first-child { border-left: 0; text-align:left; }
.benefit-table__row--head { background:#101010; font-weight: 700; }
.price-bar { margin: 8rpx 0 16rpx; display:flex; align-items:flex-end; justify-content:space-between; color:#f5d06b; font-size: 24rpx; }
.price-bar__value { font-size: 42rpx; font-weight: 800; color:#fff; }
.submit-btn { border-radius: 18rpx; background: linear-gradient(90deg, #ff3d67 0%, #ff5f88 100%); color:#fff; font-size: 34rpx; font-weight: 700; }
.agreement { display:flex; align-items:center; justify-content:space-between; margin-top: 14rpx; color:#cfcfcf; font-size: 22rpx; }
.agreement__link { color:#f5d06b; }
.faq__item { padding: 20rpx 0; border-bottom: 1rpx solid #262626; color:#d4d4d4; }
.faq__item:last-child { border-bottom: 0; }
</style>
