<template>
	<view class="login-page">
		<view class="brand-card">
			<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			<text class="title">微信登录</text>
			<text class="tip">点击下方按钮完成微信授权登录</text>
		</view>

		<view class="login-card">
			<text class="section-title">快捷登录</text>
			<button class="primary-btn" type="primary" @click="loginByWeixin">微信登录</button>
		</view>
	</view>
</template>

<script>
import loginMixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js'

export default {
	mixins: [loginMixin],
	methods: {
		loginByWeixin() {
			uni.showLoading({ title: '微信登录中', mask: true })
			uni.login({
				provider: 'weixin',
				onlyAuthorize: true,
				success: async (res) => {
					try {
						const uniIdCo = uniCloud.importObject('uni-id-co', { customUI: true })
						const result = await uniIdCo.loginByWeixin({ code: res.code })
						this.loginSuccess({
							...result,
							uniIdRedirectUrl: '/pages/index/index'
						})
					} catch (error) {
						uni.showModal({
							content: error?.message || '微信登录失败',
							showCancel: false
						})
					} finally {
						uni.hideLoading()
					}
				},
				fail: (error) => {
					uni.hideLoading()
					uni.showModal({
						content: error?.errMsg || '微信授权失败',
						showCancel: false
					})
				}
			})
		}
	}
}
</script>

<style scoped>
.login-page { min-height: 100vh; padding: 80rpx 32rpx 40rpx; background: linear-gradient(180deg, #5f4ae8 0%, #f4f5fb 26%, #f4f5fb 100%); }
.brand-card, .login-card { background:#fff; border-radius: 32rpx; padding: 28rpx; box-shadow: 0 18rpx 40rpx rgba(24, 28, 43, 0.08); margin-bottom: 22rpx; }
.logo { width: 120rpx; height: 120rpx; display:block; margin: 0 auto 18rpx; }
.title { display:block; text-align:center; font-size: 36rpx; font-weight: 700; color:#111827; }
.tip { display:block; text-align:center; margin-top: 10rpx; font-size: 24rpx; color:#64748b; }
.section-title { display:block; margin-bottom: 18rpx; font-size: 30rpx; font-weight: 700; color:#111827; }
.primary-btn { border-radius: 18rpx; background: linear-gradient(90deg, #5f4ae8 0%, #7c3aed 100%); color:#fff; font-size: 30rpx; }
</style>
