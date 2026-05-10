import { store } from '@/uni_modules/uni-id-pages/common/store.js';

const LOGIN_PAGE = '/uni_modules/uni-id-pages/pages/login/login-withpwd';
const UNI_ID_KEY = 'uni_id';
const UNI_ID_TOKEN_KEY = 'uni_id_token';
const UNI_ID_TOKEN_EXPIRED_KEY = 'uni_id_token_expired';
const AUTH_SESSION_VERIFY_FN = 'auth-session-verify';

function getAuthPayload() {
	return {
		uid: uni.getStorageSync(UNI_ID_KEY) || '',
		token: uni.getStorageSync(UNI_ID_TOKEN_KEY) || '',
		tokenExpired: uni.getStorageSync(UNI_ID_TOKEN_EXPIRED_KEY) || 0
	};
}

function clearAuthCache() {
	uni.removeStorageSync(UNI_ID_KEY);
	uni.removeStorageSync(UNI_ID_TOKEN_KEY);
	uni.removeStorageSync(UNI_ID_TOKEN_EXPIRED_KEY);
	store.userId = '';
	store.token = '';
	store.tokenExpired = 0;
}

function hasLocalSession() {
	const { uid, token } = getAuthPayload();
	return !!uid && !!token && typeof token === 'string' && token.trim().length > 0;
}

function hasToken() {
	const { token } = getAuthPayload();
	return !!token && typeof token === 'string' && token.trim().length > 0;
}

async function isTokenValidRemote() {
	const payload = getAuthPayload();
	if (!payload.uid || !payload.token) return false;

	try {
		const res = await uniCloud.callFunction({
			name: AUTH_SESSION_VERIFY_FN,
			data: payload
		});

		const result = res?.result || {};
		if (result?.code !== 0 || !result?.data?.uid) {
			clearAuthCache();
			return false;
		}

		uni.setStorageSync(UNI_ID_KEY, result.data.uid || payload.uid);
		if (result.data.token) uni.setStorageSync(UNI_ID_TOKEN_KEY, result.data.token);
		if (result.data.tokenExpired) uni.setStorageSync(UNI_ID_TOKEN_EXPIRED_KEY, result.data.tokenExpired);

		return true;
	} catch (error) {
		clearAuthCache();
		return false;
	}
}

async function hasValidSession() {
	if (!hasLocalSession()) {
		clearAuthCache();
		return false;
	}
	return await isTokenValidRemote();
}

function requireLogin(redirectUrl = '') {
	uni.showToast({ title: '请先登录', icon: 'none' });

	let finalRedirectUrl = redirectUrl;
	// console.log('redirectUrl', redirectUrl)
	if (/^https?:\/\//i.test(redirectUrl)) {
		const h5Url = encodeURIComponent(redirectUrl);
		// console.log('h5Url', h5Url)
		const webViewUrl = `/pages/webview/webview?url=${h5Url}`;
		// console.log('webViewUrl', webViewUrl)
		finalRedirectUrl = encodeURIComponent(webViewUrl);
		console.log('finalRedirectUrl', finalRedirectUrl)
	}

	const url = finalRedirectUrl ? `${LOGIN_PAGE}?uniIdRedirectUrl=${finalRedirectUrl}` : LOGIN_PAGE;
	uni.navigateTo({ url });
	return false;
}

function resolveTarget(url = '', jumpType = '') {
	if (!url) return null;
	if (jumpType === 'switchTab') return { type: 'switchTab', url };
	if (jumpType === 'navigateTo' || url.startsWith('/')) return { type: 'navigateTo', url };
	return { type: 'webview', url };
}

export function useToolLauncher() {
	const openTool = async (item = {}) => {
		if (!hasLocalSession()) return requireLogin(item.url || '');
		if (!(await hasValidSession())) return requireLogin(item.url || '');

		if (item.isVip) {
			uni.showToast({ title: '会员功能，请先开通会员', icon: 'none' });
			return;
		}

		const target = resolveTarget(item.url || '', item.jumpType);
		if (!target) {
			uni.showToast({ title: `${item.name || '该功能'} 功能待接入`, icon: 'none' });
			return;
		}

		if (target.type === 'switchTab') {
			uni.switchTab({ url: target.url });
			return;
		}

		if (target.type === 'navigateTo') {
			uni.navigateTo({ url: target.url });
			return;
		}

		uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(target.url)}` });
	};

	const openBanner = (banner = {}) => {
		const target = resolveTarget(banner.url || '', banner.jumpType);
		if (!target) {
			uni.showToast({ title: '暂无可打开链接', icon: 'none' });
			return;
		}

		if (target.type === 'switchTab') {
			uni.switchTab({ url: target.url });
			return;
		}

		if (target.type === 'navigateTo') {
			uni.navigateTo({ url: target.url });
			return;
		}

		uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(target.url)}` });
	};

	return { openTool, openBanner, hasValidSession, clearAuthCache };
}
