import { computed } from 'vue';

function safeStorageGet(key) {
	try {
		return uni.getStorageSync(key);
	} catch (e) {
		return '';
	}
}

export function useH5Auth() {
	const token = computed(() => safeStorageGet('uni_id_token') || safeStorageGet('uni-id-pages-token') || '');
	const uid = computed(() => safeStorageGet('uni-id-pages-userInfo')?._id || safeStorageGet('uni_id') || '');
	const userInfo = computed(() => safeStorageGet('uni-id-pages-userInfo') || {});

	const buildParams = (extra = {}) => ({
		token: token.value,
		uid: uid.value,
		avatar: userInfo.value?.avatar_file?.url || userInfo.value?.avatar || '',
		nickname: userInfo.value?.nickname || userInfo.value?.username || '',
		...extra
	});

	const appendParams = (url, extra = {}) => {
		const finalParams = buildParams(extra);
		const parsed = url.includes('?') ? `${url}&` : `${url}?`;
		return `${parsed}${Object.entries(finalParams)
			.filter(([, value]) => value !== '' && value !== null && value !== undefined)
			.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
			.join('&')}`;
	};

	return {
		token,
		uid,
		userInfo,
		buildParams,
		appendParams
	};
}
