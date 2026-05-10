<template>
	<view class="webview-container">
		<web-view v-if="fullUrl" :src="fullUrl" @message="onMessage"></web-view>
		<view v-else class="empty-state">
			<text class="empty-state__title">未找到跳转地址</text>
			<text class="empty-state__desc">请从首页选择一个应用进行跳转。</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useH5Auth } from '@/composables/useH5Auth.js';

const fullUrl = ref('');
const { appendParams } = useH5Auth();

onLoad((options) => {
	console.log("webview options.url", options.url)
	const targetUrl = decodeURIComponent(options.url || '');
	if (!targetUrl) return;

	fullUrl.value = appendParams(targetUrl, {
		page: 'webview',
		source: options.source || 'home'
	});
	// if (options.action === 'navigate') {
	// 	wx.navigateTo({ url: options.page });
	// }
});

onShow(() => {
	if (!fullUrl.value) return;
	fullUrl.value = appendParams(fullUrl.value.split('?')[0], {
		page: 'webview',
		refresh: Date.now()
	});
});

const onShareAppMessage = (e) => {
	return {
		title: 'web',
		success: (res) => {
			// 转发成功
			console.log('转发成功', res);
		},
		fail: (res) => {
			// 转发失败
			console.log('转发失败', res);
		}
	};
}

const onMessage = (e) => {
	console.log("接收到的e", e)
	const detail = e?.detail?.data || [];
	console.log('收到H5消息:', detail);

	const lastMessage = detail[detail.length - 1] || {};
	if (lastMessage?.type === 'open-member-buy') {
		uni.navigateTo({ url: '/pages/ucenter/member-buy/member-buy' });
		return;
	}
	if (lastMessage?.type === 'open-home') {
		uni.switchTab({ url: '/pages/index/index' });
	}
};
</script>

<style scoped>
.webview-container {
	width: 100%;
	height: 100vh;
	background: #fff;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	padding: 40rpx;
	text-align: center;
}

.empty-state__title {
	font-size: 34rpx;
	font-weight: 600;
	color: #0f172a;
}

.empty-state__desc {
	margin-top: 12rpx;
	font-size: 26rpx;
	color: #64748b;
}
</style>
