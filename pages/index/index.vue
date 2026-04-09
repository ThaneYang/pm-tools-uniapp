<template>
	<view>
		<button @click="jumpToCard">跳转到应用</button>
	</view>
</template>

<script setup>
	// 跳转到知识卡片 H5
	const jumpToCard = () => {
	    const token = uni.getStorageSync('uni_id_token');
	    // const uid = uni.getStorageSync('uni_id');
	    const uid = uni.getStorageSync('uni-id-pages-userInfo')._id;
			console.log("token", token)
			console.log("uid", uid)
	    const h5Url = `http://127.0.0.1:5173/#/pages/index/index?token=${token}&uid=${uid}`;
			console.log("h5Url", h5Url)
	    uni.navigateTo({
	        url: `/pages/webview/webview?url=${encodeURIComponent(h5Url)}`
	    });
	}
</script>

<style>

</style>
