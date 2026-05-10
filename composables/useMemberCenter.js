import { computed, onMounted, ref } from 'vue';
import { store } from '@/uni_modules/uni-id-pages/common/store.js';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80';

function toDate(value) {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
	const date = toDate(value);
	if (!date) return '';
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function calcRemainingDays(value) {
	const date = toDate(value);
	if (!date) return 0;
	const diff = date.getTime() - Date.now();
	return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function useMemberCenter() {
	const profile = ref(null);
	const loading = ref(false);
	const error = ref('');

	const cachedUser = computed(() => store.userInfo || {});
	const userName = computed(() => {
		return profile.value?.nickname
			|| profile.value?.username
			|| profile.value?.mobile
			|| cachedUser.value?.nickname
			|| cachedUser.value?.username
			|| cachedUser.value?.mobile
			|| '微信用户';
	});
	const avatarUrl = computed(() => profile.value?.avatar_file?.url || profile.value?.avatar || cachedUser.value?.avatar_file?.url || cachedUser.value?.avatar || DEFAULT_AVATAR);
	const inviteCode = computed(() => profile.value?.my_invite_code || profile.value?.invite_code || cachedUser.value?.my_invite_code || cachedUser.value?.invite_code || uni.getStorageSync('invite_code') || '');
	const memberExpireDate = computed(() => formatDate(profile.value?.vip_expire_date || cachedUser.value?.vip_expire_date));
	const memberRemainingDays = computed(() => calcRemainingDays(profile.value?.vip_expire_date || cachedUser.value?.vip_expire_date));
	const vipStatus = computed(() => {
		const vipExpireDate = profile.value?.vip_expire_date || cachedUser.value?.vip_expire_date;
		if (profile.value?.is_vip || cachedUser.value?.is_vip || vipExpireDate) {
			if (!vipExpireDate) return '会员已开通';
			return `${memberRemainingDays.value} 天后到期 · ${memberExpireDate.value}`;
		}
		return '';
	});

	const loadProfile = async () => {
		if (!uniCloud?.database) return;
		loading.value = true;
		error.value = '';
		try {
			const db = uniCloud.database();
			const { result } = await db.collection('uni-id-users')
				.where("'_id' == $cloudEnv_uid")
				.field('mobile,nickname,username,email,avatar_file,avatar,my_invite_code,invite_code,is_vip,vip_expire_date')
				.get();
			profile.value = result?.data?.[0] || null;
		} catch (e) {
			error.value = e?.message || '加载个人信息失败';
		} finally {
			loading.value = false;
		}
	};

	const refresh = async () => {
		await loadProfile();
	};

	onMounted(() => {
		loadProfile();
	});

	return {
		profile,
		userName,
		avatarUrl,
		inviteCode,
		vipStatus,
		memberExpireDate,
		memberRemainingDays,
		loading,
		error,
		refresh
	};
}
