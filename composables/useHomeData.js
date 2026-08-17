import { onMounted, ref } from "vue";

const FALLBACK_TOOLS = [
  { id: "image", name: "智能图片", icon: "✨" },
  { id: "audio", name: "智能配音", icon: "🎙️" },
  { id: "video", name: "视频工具", icon: "🎬" },
  { id: "copy", name: "智能文案", icon: "✍️" },
  { id: "watermark", name: "去水印", icon: "🧽" },
  { id: "subtitle", name: "去字幕", icon: "字幕" },
  { id: "rights", name: "查权重", icon: "⚖️" },
  { id: "notes", name: "笔记", icon: "📝" },
  { id: "music", name: "提取音乐", icon: "🎵" },
  { id: "more", name: "更多工具", icon: "➕" },
];

function toText(record, fields) {
  for (const field of fields) {
    if (record?.[field]) return record[field];
  }
  return "";
}

function isTrue(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "yes"
  );
}

function pickFirst(record, fields, fallback = "") {
  const value = toText(record, fields);
  return value || fallback;
}

function buildAppRecord(item, index) {
  const appId = item._id || item.id || String(index);
  const title = pickFirst(
    item,
    ["name", "title", "app_name", "appTitle", "menu_name"],
    "未命名应用",
  );
  const icon = pickFirst(
    item,
    ["icon", "emoji", "app_icon", "menu_icon"],
    "✨",
  );
  const url = pickFirst(
    item,
    ["url", "path", "link", "h5_url", "pagePath", "route"],
    "https://example.com",
  );
  const desc = pickFirst(item, ["desc", "description", "summary", "intro"], "");
  const badge = pickFirst(item, ["badge", "label", "tag"], "");
  const sort = Number(item.sort ?? item.order ?? 0);
  const showInHome =
    item.showInHome ?? item.show_in_home ?? item.home_show ?? true;
  const isVip = isTrue(
    item.isVip ?? item.is_vip ?? item.vip_only ?? item.member_only,
  );
  const jumpType = pickFirst(
    item,
    ["jumpType", "jump_type", "openType"],
    "webview",
  );
  const category = pickFirst(item, ["category", "group", "module"], "");
  const homeIcon = pickFirst(item, ["homeIcon", "home_icon"], icon);

  return {
    id: appId,
    appId,
    title,
    name: title,
    subtitle: desc,
    desc,
    icon,
    homeIcon,
    badge,
    label: badge,
    color:
      item.color ||
      item.background ||
      "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
    background:
      item.background ||
      item.color ||
      "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
    url,
    jumpUrl: url,
    isVip,
    vipOnly: isVip,
    showInHome,
    homeVisible: showInHome,
    sort,
    order: sort,
    category,
    group: category,
    module: category,
    jumpType,
    openType: jumpType,
  };
}

function withTimeout(promise, label, timeoutMs) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}请求超时`)), timeoutMs);
  });
  return Promise.race([
    promise.finally(() => timer && clearTimeout(timer)),
    timeoutPromise,
  ]);
}

export function useHomeData() {
  const banners = ref([]);
  const quickTools = ref(FALLBACK_TOOLS);
  const loading = ref(true);
  const error = ref("");
  const requestTimeoutMs = 6000;

  function pickBannerImage(bannerfile) {
    if (!bannerfile) return "";
    if (Array.isArray(bannerfile)) {
      const first = bannerfile[0];
      return first?.url || first?.fileURL || "";
    }
    return bannerfile.url || bannerfile.fileURL || "";
  }

  const normalizeBanner = (item, index) => ({
    id: item._id || item.id || String(index),
    title: toText(item, ["title", "name"]) || "活动推荐",
    image: pickBannerImage(item.bannerfile),
    url: pickFirst(
      item,
      ["open_url", "url", "path", "link", "h5_url", "pagePath", "route"],
      "",
    ),
    jumpType: pickFirst(item, ["jump_type", "jumpType", "openType"], "H5网页"),
    appid: pickFirst(item, ["appid", "appId", "target_appid"], ""),
    sort: Number(item.sort ?? item.order ?? 0),
    status: isTrue(item.status ?? true),
    description: pickFirst(item, ["description", "desc"], ""),
  });

  const loadHomeData = async () => {
    loading.value = true;
    error.value = "";

    if (!uniCloud?.database) {
      error.value = "uniCloud 暂不可用，无法加载 Banner";
      loading.value = false;
      return;
    }

    try {
      const db = uniCloud.database();
      const [bannerRes, appRes] = await Promise.allSettled([
        withTimeout(
          db
            .collection("opendb-banner")
            .where("status == true")
            .field(
              "bannerfile,open_url,jump_type,appid,title,sort,category_id,status,description",
            )
            .orderBy("sort", "asc")
            .get(),
          "banner",
          requestTimeoutMs,
        ),
        withTimeout(
          db
            .collection("opendb-app-list")
            .field(
              "name,title,app_name,appTitle,menu_name,desc,description,summary,intro,icon,emoji,app_icon,menu_icon,badge,label,tag,color,background,url,path,link,h5_url,pagePath,route,isVip,is_vip,vip_only,member_only,showInHome,show_in_home,home_show,sort,order,category,group,module,homeIcon,home_icon,jumpType,jump_type,openType",
            )
            .orderBy("sort", "asc")
            .get(),
          "app",
          requestTimeoutMs,
        ),
      ]);

      if (
        bannerRes.status === "fulfilled" &&
        bannerRes.value?.result?.data?.length
      ) {
        banners.value = bannerRes.value.result.data
          .map(normalizeBanner)
          .sort((a, b) => a.sort - b.sort);
      } else if (bannerRes.status === "rejected") {
        error.value = bannerRes.reason?.message || "Banner 加载失败";
      }

      if (appRes.status === "fulfilled" && appRes.value?.result?.data?.length) {
        const apps = appRes.value.result.data
          .map(buildAppRecord)
          .sort((a, b) => a.sort - b.sort);
        const homeApps = apps.filter((item) => item.showInHome);
        quickTools.value = homeApps.map((item) => ({
          id: item.appId,
          name: item.title,
          icon: item.homeIcon || item.icon,
          badge: item.label,
          url: item.jumpUrl,
          isVip: item.vipOnly,
          jumpType: item.openType,
          appId: item.appId,
          showInHome: item.homeVisible,
        }));
      }
    } catch (e) {
      error.value = e?.message || "加载首页数据失败";
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadHomeData();
  });

  return {
    banners,
    quickTools,
    loading,
    error,
    loadHomeData,
    buildAppRecord,
  };
}
