import { store } from '@/uni_modules/uni-id-pages/common/store.js';
import { useRecentTools } from '@/composables/useRecentTools.js';

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

	// 明确属于"token 业务错误"的返回码 —— 这些才会清掉本地登录态。
	// 其他情况（网络异常、云函数未部署、字段对不上等）一律不动本地缓存，
	// 避免一次网络抖动就把用户踢回登录页。
	const INVALID_TOKEN_CODES = new Set([
		'TOKEN_INVALID',
		'TOKEN_EXPIRED',
		'TOKEN_OR_UID_MISSING',
		'UID_INVALID',
		'INVALID_TOKEN'
	]);

	try {
		const res = await uniCloud.callFunction({
			name: AUTH_SESSION_VERIFY_FN,
			// 云函数读的是 event.expiredAt，顺手把字段名对齐
			data: {
				uid: payload.uid,
				token: payload.token,
				expiredAt: payload.tokenExpired
			}
		});

		const result = res?.result || {};

		// 成功：刷新本地 token
		if (result?.code === 0 && result?.data?.uid) {
			uni.setStorageSync(UNI_ID_KEY, result.data.uid || payload.uid);
			if (result.data.token) uni.setStorageSync(UNI_ID_TOKEN_KEY, result.data.token);
			if (result.data.tokenExpired) uni.setStorageSync(UNI_ID_TOKEN_EXPIRED_KEY, result.data.tokenExpired);
			return true;
		}

		// 明确的业务错误：token 失效
		if (result && result.code && INVALID_TOKEN_CODES.has(String(result.code))) {
			console.warn('[auth] token invalid by cloud:', result.code, result.message);
			clearAuthCache();
			return false;
		}

		// 其它情况（云函数没部署、返回格式异常等）：信任本地 session
		console.warn('[auth] verify response not recognized, trust local session:', result);
		return true;
	} catch (error) {
		// 网络异常 / 云函数未部署：不清缓存，信任本地
		console.warn('[auth] verify call failed, trust local session:', error?.message || error);
		return true;
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

// 根据 opendb-banner.schema.json 的 jump_type 枚举做规范化：
//   H5网页 / 网页   → 内置 web-view 打开
//   小程序内部页面 / 页面 → 本地页面 navigateTo
//   其它小程序 / 小程序   → navigateToMiniProgram
//   图片                  → previewImage
function normalizeJumpType(jumpType = '') {
	const t = String(jumpType).trim();
	if (t === 'H5网页' || t === '网页') return 'webview';
	if (t === '小程序内部页面' || t === '页面') return 'page';
	if (t === '其它小程序' || t === '小程序') return 'miniProgram';
	if (t === '图片') return 'image';
	return t;
}

export function useToolLauncher() {
	const { addRecent } = useRecentTools();

	const openTool = async (item = {}) => {
		// 记录最近使用（在登录校验之前，确保未登录用户的点击也被记住，
		// 登录后跳回首页能看到刚刚点过的应用）
		addRecent(item);

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
		const rawJumpType = banner.jumpType || banner.jump_type || '';
		const jumpType = normalizeJumpType(rawJumpType);
		const url = banner.url || banner.open_url || '';
		const appid = banner.appid || banner.appId || '';

		// 图片：仅放大预览（不跳转）
		if (jumpType === 'image') {
			if (!url) {
				uni.showToast({ title: '图片地址不存在', icon: 'none' });
				return;
			}
			uni.previewImage({ current: url, urls: [url] });
			return;
		}

		// 其它小程序：navigateToMiniProgram
		if (jumpType === 'miniProgram') {
			if (!appid) {
				uni.showToast({ title: '跳转小程序 appid 缺失', icon: 'none' });
				return;
			}
			uni.navigateToMiniProgram({
				appId: appid,
				path: url || '',
				envVersion: 'release'
			});
			return;
		}

		// 小程序内部页面 / H5网页：交给 resolveTarget 处理本地路径与外链的差异
		const target = resolveTarget(url, jumpType === 'page' ? 'navigateTo' : '');
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
