<template>
	<view class="webview-container">
		<web-view :src="fullUrl" @message="onMessage"></web-view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const fullUrl = ref('');

onLoad((options) => {
	// 1. 获取从其他页面传过来的 H5 基础路径
	// decodeURIComponent 是为了防止 URL 中的特殊字符（如 ? &）被截断
	let targetUrl = decodeURIComponent(options.url || '');
	
	if (targetUrl) {
		// 2. 自动补充用户信息参数
		let token = uni.getStorageSync('uni_id_token');
		const uid = uni.getStorageSync('uni_id');
		token="123"
		
		// 判断原链接是否已有参数，决定用 ? 还是 & 拼接
		const connector = targetUrl.includes('?') ? '&' : '?';
		fullUrl.value = `${targetUrl}${connector}token=${token}&uid=${uid}`;
		
		console.log('WebView 加载地址:', fullUrl.value);
	}
});

// 接收 H5 传回的消息（可选）
const onMessage = (e) => {
	console.log('收到H5消息:', e.detail.data);
};
</script>

<style>
.webview-container {
	width: 100%;
	height: 100%;
}
</style>