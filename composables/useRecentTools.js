import { ref } from 'vue';

const STORAGE_KEY = 'pm_recent_tools';
const MAX_RECENT = 6;

// 模块级单例：所有组件共享同一份最近使用列表
const recentTools = ref([]);
let initialized = false;

function loadFromStorage() {
	try {
		const raw = uni.getStorageSync(STORAGE_KEY);
		if (Array.isArray(raw)) {
			recentTools.value = raw.filter((item) => item && item.id);
		}
	} catch (e) {
		recentTools.value = [];
	}
}

function saveToStorage() {
	try {
		uni.setStorageSync(STORAGE_KEY, recentTools.value);
	} catch (e) {
		// 存储失败静默忽略
	}
}

function ensureLoaded() {
	if (initialized) return;
	initialized = true;
	loadFromStorage();
}

export function useRecentTools() {
	ensureLoaded();

	const addRecent = (item = {}) => {
		if (!item.id) return;
		const snapshot = {
			id: item.id,
			name: item.name || item.title || '未命名',
			icon: item.icon || item.homeIcon || '✨',
			url: item.url || '',
			jumpType: item.jumpType || item.openType || '',
			badge: item.badge || item.label || '',
			isVip: !!item.isVip,
			usedAt: Date.now()
		};

		// 同 id 去重后压到队首
		const filtered = recentTools.value.filter((t) => t.id !== snapshot.id);
		filtered.unshift(snapshot);
		recentTools.value = filtered.slice(0, MAX_RECENT);
		saveToStorage();
	};

	const clearRecent = () => {
		recentTools.value = [];
		saveToStorage();
	};

	return {
		recentTools,
		addRecent,
		clearRecent
	};
}
