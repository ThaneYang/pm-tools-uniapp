export const APP_CATEGORIES = [
	{
		id: 'image',
		name: '智能图片',
		desc: '批量去水印 / 封面 / 抠图',
		icon: '✨',
		color: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
		url: 'https://example.com/image-tools',
		isVip: true
	},
	{
		id: 'audio',
		name: '智能配音',
		desc: '文本转语音 / 音色克隆',
		icon: '🎙️',
		color: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
		url: 'https://example.com/audio-tools',
		isVip: false
	},
	{
		id: 'video',
		name: '视频工具',
		desc: '检测 / 提文案 / 去字幕',
		icon: '🎬',
		color: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
		url: 'https://example.com/video-tools',
		isVip: true
	},
	{
		id: 'copy',
		name: '智能文案',
		desc: '短视频 / 直播 / 商品文案',
		icon: '✍️',
		color: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
		url: 'https://example.com/copy-tools',
		isVip: false
	}
];

export const QUICK_TOOLS = [
	{ id: 'watermark', name: '去水印', icon: '🧽' },
	{ id: 'subtitle', name: '去字幕', icon: '字幕' },
	{ id: 'extract', name: '文案提取', icon: '文' },
	{ id: 'notes', name: '笔记', icon: '📝' },
	{ id: 'image-copy', name: '图片提文案', icon: '图' },
	{ id: 'rights', name: '查权重', icon: '⚖️' },
	{ id: 'music', name: '提取音乐', icon: '🎵' },
	{ id: 'voice', name: '录音提文案', icon: '🎤' },
	{ id: 'img-watermark', name: '图片去水印', icon: '🖼️' },
	{ id: 'more', name: '更多工具', icon: '➕' }
];

export const PROFIT_MENU = [
	{ id: 'go-watermark', name: '去水印', icon: '🪄' },
	{ id: 'go-audio', name: '音频提文案', icon: '🎧' },
	{ id: 'go-copy', name: '文案提取', icon: '📄' },
	{ id: 'go-rights', name: '查权重', icon: '📊' },
	{ id: 'go-account', name: '账号估值', icon: '👤' },
	{ id: 'go-image-copy', name: '图片提文案', icon: '🖼️' },
	{ id: 'go-clean', name: '无链去水印', icon: '🔗' },
	{ id: 'go-service', name: '联系客服', icon: '💬' }
];

export const MEMBER_PLANS = [
	{
		id: 'season',
		name: '手机季卡',
		period: '90天',
		price: 188,
		oldPrice: 288,
		badge: '限时优惠',
		highlight: true,
		benefits: ['去水印', '文案提取', '会员专属 H5 应用'],
		quota: '100 次/日'
	},
	{
		id: 'year',
		name: '手机年卡',
		period: '365天',
		price: 388,
		oldPrice: 588,
		badge: '热卖',
		highlight: false,
		benefits: ['去水印', '文案提取', '会员专属 H5 应用'],
		quota: '200 次/日'
	},
	{
		id: 'lifetime',
		name: '手机终身卡',
		period: '长期',
		price: 688,
		oldPrice: 999,
		badge: '长期',
		highlight: false,
		benefits: ['去水印', '文案提取', '会员专属 H5 应用'],
		quota: '300 次/日'
	}
];

export const MEMBER_FAQS = [
	'轻抖有哪些重要功能？',
	'如何快捷使用轻抖小程序？',
	'会员权益如何同步到 H5 应用？'
];
