import { reactive } from 'vue'
import config from '@/uni_modules/uni-id-pages/config.js'

const USER_INFO_KEY = 'uni-id-pages-userInfo'
const UNI_ID_KEY = 'uni_id'
const UNI_ID_TOKEN_KEY = 'uni_id_token'
const UNI_ID_TOKEN_EXPIRED_KEY = 'uni_id_token_expired'
const LOGIN_EVENT = 'uni-id-pages-login-success'
const LOGOUT_EVENT = 'uni-id-pages-logout'
const DEFAULT_HOME_TAB = '/pages/index/index'

const store = reactive({
	userInfo: uni.getStorageSync(USER_INFO_KEY) || {},
	userId: uni.getStorageSync(UNI_ID_KEY) || '',
	token: uni.getStorageSync(UNI_ID_TOKEN_KEY) || '',
	tokenExpired: uni.getStorageSync(UNI_ID_TOKEN_EXPIRED_KEY) || 0
})

function persistUserInfo(userInfo = {}) {
	store.userInfo = {
		...store.userInfo,
		...userInfo
	}
	uni.setStorageSync(USER_INFO_KEY, store.userInfo)
}

function persistUniId(userId = '') {
	store.userId = userId || ''
	uni.setStorageSync(UNI_ID_KEY, store.userId)
}

function persistToken(token = '', tokenExpired = 0) {
	store.token = token || ''
	store.tokenExpired = tokenExpired || 0
	uni.setStorageSync(UNI_ID_TOKEN_KEY, store.token)
	uni.setStorageSync(UNI_ID_TOKEN_EXPIRED_KEY, store.tokenExpired)
}

function goToTarget(url) {
	if (!url) {
		uni.switchTab({ url: DEFAULT_HOME_TAB })
		return
	}

	if (url.includes('?') || url.includes('&') || url.includes('#')) {
		uni.redirectTo({ url })
		return
	}

	uni.switchTab({
		url,
		fail: () => {
			uni.redirectTo({ url })
		}
	})
}

const mutations = {
	setUserInfo(userInfo = {}) {
		persistUserInfo(userInfo)
	},
	loginSuccess(e = {}) {
		const { uniIdRedirectUrl = '', userInfo = {}, uid = '', newToken = {}, token = '', tokenExpired = 0 } = e
		if (Object.keys(userInfo).length > 0) {
			persistUserInfo(userInfo)
		}
		persistUniId(uid || userInfo._id || userInfo.uid || '')
		persistToken(newToken?.token || token || '', newToken?.tokenExpired || tokenExpired || 0)
		uni.$emit(LOGIN_EVENT)
		goToTarget(uniIdRedirectUrl || DEFAULT_HOME_TAB)
	},
	logout() {
		store.userInfo = {}
		store.userId = ''
		store.token = ''
		store.tokenExpired = 0
		uni.removeStorageSync(USER_INFO_KEY)
		uni.removeStorageSync(UNI_ID_KEY)
		uni.removeStorageSync(UNI_ID_TOKEN_KEY)
		uni.removeStorageSync(UNI_ID_TOKEN_EXPIRED_KEY)
		uni.$emit(LOGOUT_EVENT)
		goToTarget(DEFAULT_HOME_TAB)
	}
}

export { store, mutations, config }
