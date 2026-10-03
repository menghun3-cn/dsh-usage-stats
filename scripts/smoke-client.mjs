// Smoke-test the hand-written client bundle outside the browser:
// 1. feed it to a fake __ModuleLoader__ (captures the factory)
// 2. run the factory with a fake require (real react, nothing else)
// 3. render <UsageStatsPanel t> with react-dom/server
// 4. run apply(ctx) against a stub client context
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Clean clones resolve declared devDependencies locally. An explicit override
// remains useful for checking against the exact modules bundled with dsh.
const require = process.env.SMOKE_NODE_MODULES === void 0
	? createRequire(import.meta.url)
	: createRequire(join(process.env.SMOKE_NODE_MODULES, "_anchor.js"));
const react = require("react");
const jsxRuntime = require("react/jsx-runtime");
const { renderToStaticMarkup } = require("react-dom/server");

let captured = null;
globalThis.window = { __ModuleLoader__: { load: (entry) => { captured = entry; } } };
globalThis.document = { querySelector: () => null, createElement: () => ({ dataset: {}, appendChild: () => {} }), head: { appendChild: () => {} } };

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "lib", "client.js"), "utf8");
// Token-usage-only client: the provider account / balance / subscription area
// was removed, so the client must not fetch any of those endpoints anymore.
if (source.includes("/api/usage-stats/account")) throw new Error("client must not fetch the provider account endpoint");
if (source.includes("/api/usage-stats/providers")) throw new Error("client must not fetch the providers endpoint");
if (!source.includes('ctx.slots.inject("shell.overlay"')) throw new Error("client must register on the 0.2.0 shell.overlay layout slot");
if (source.includes('require("react-dom")')) throw new Error("client must not depend on react-dom (the shell bundle does not seed it)");
if (!source.includes('document.addEventListener("pointerdown"')) throw new Error("open panel must listen for outside pointerdown");
if (!source.includes('event.key === "Escape"')) throw new Error("open panel must dismiss on Escape");
if (!source.includes("ref: panelRef")) throw new Error("open panel must expose a ref for outside-click detection");
// The floating badge must stay above the bottom-left user menu and keep its
// label plus today's token count (no provider amount anymore).
if (!source.includes("inset:auto auto 60px 12px")) throw new Error("overlay layer must clear the bottom-left user menu");
if (!source.includes('translate("panel.badge")')) throw new Error("badge must keep the label text");
if (!source.includes('translate("panel.badgeMode")')) throw new Error("badge mode switcher must exist and be localized");
if (!source.includes("dsh-usage-stats.badgeMode")) throw new Error("badge mode must persist across restarts");
if (!source.includes("window.setInterval(loadUsage, 60000)")) throw new Error("periodic refresh must run regardless of panel state");
if (!source.includes('badgeCount !== null && react_jsx_runtime.jsx("span", { className: S.badgeCount')) throw new Error("badge must keep the token count on the right");
// Last-14-days view is gone for good; the panel shows three summary cards
// (today / month / all-time built from the same stats), the last-7-days bar
// chart with per-bar VALUE LABELS, and the last-12-months LINE chart with
// per-point value labels.
if (source.includes('"usage.recent"')) throw new Error("last-14-days view must be fully removed");
if (!source.includes('jsx(WeekBars, {')) throw new Error("last-7-days bar chart must stay");
if (!source.includes("S.weekBarValue")) throw new Error("week bars must show their value label");
if (!source.includes('jsx(LineChart, {')) throw new Error("last-12-months view must be the line chart");
if (!source.includes("function LineChart")) throw new Error("LineChart component missing");
if (source.includes("months12.slice().reverse()")) throw new Error("month list must be removed (line chart only)");
if (!source.includes('translate("usage.months")')) throw new Error("last-12-months view must exist");
if (source.includes("jsx(MonthBars")) throw new Error("month chart must be removed (list only)");
// The panel must be wrapped in a render error boundary so an unexpected crash
// degrades to an inline error instead of unmounting the badge.
if (!source.includes("class PanelBoundary extends react.Component")) throw new Error("panel must be wrapped in a render error boundary");
new Function(source)(); // executes the window.__ModuleLoader__.load call

if (captured === null) throw new Error("loader did not capture the bundle");
if (captured.id !== "dsh-usage-stats") throw new Error(`unexpected id ${captured.id}`);

// Strict factory require: beyond the platform guarantee (react + jsx-runtime),
// ANY other specifier fails, proving the bundle has zero external deps.
const exports_ = captured.factory((spec) => {
	if (spec === "react") return react;
	if (spec === "react/jsx-runtime") return jsxRuntime;
	throw new Error(`unexpected require: ${spec}`);
});

if (typeof exports_.apply !== "function") throw new Error("missing apply export");

const { shouldDismissPanel } = exports_;
const panelNode = { contains: (target) => target === "panel-child" };
const layerNode = { contains: (target) => target === "badge-child" };
if (shouldDismissPanel([panelNode], "panel-child", layerNode, panelNode)) throw new Error("panel click must stay open");
if (shouldDismissPanel([layerNode], "badge-child", layerNode, panelNode)) throw new Error("badge click must stay inside");
if (!shouldDismissPanel([], "page-content", layerNode, panelNode)) throw new Error("outside click must dismiss");
if (!shouldDismissPanel([], "page-content", null, null)) throw new Error("missing refs must fail safe as outside");
console.log("panel dismissal guards ok");

// Render the panel (closed state) to static markup.
const { UsageStatsPanel } = exports_;
const markup = renderToStaticMarkup(react.createElement(UsageStatsPanel, { wide: true, t: (key) => key }));
if (!markup.includes("用量") && !markup.includes("panel.badge")) throw new Error("badge label missing from markup");
if (!markup.includes("usg_badge")) throw new Error("badge element missing from markup");
console.log("render ok, markup length:", markup.length);

// Apply against a stub client context.
const registrations = [];
const ctx = {
	effect: () => {},
	locale: { register: (ns, dict) => { if (ns !== "usageStats") throw new Error(`unexpected ns ${ns}`); if (!dict.zh || !dict.en) throw new Error("missing dictionaries"); } },
	slots: { inject: (slot, fn) => { registrations.push([slot, fn]); return () => {}; }, register: () => () => {} }
};
exports_.apply(ctx);
if (registrations.length !== 1) throw new Error("expected one slot injection");
const [slot, registerFn] = registrations[0];
if (slot !== "shell.overlay") throw new Error(`unexpected slot ${slot}`);
const disposer = registerFn();
if (typeof disposer !== "function") throw new Error("slot registration must return a disposer");
console.log("apply ok, slot:", slot);

// Render the day-detail view with per-model breakdown.
const { DayDetail } = exports_;
const dayDetail = renderToStaticMarkup(react.createElement(DayDetail, {
	day: {
		date: "2026-08-13",
		tokens: 34333358,
		inputTokens: 199382,
		outputTokens: 116824,
		cacheReadTokens: 34017152,
		cacheWriteTokens: 0,
		cacheHitRate: 99.4,
		models: [
			{ model: "deepseek-official/deepseek-v4-flash", tokens: 30000000, inputTokens: 100000, outputTokens: 50000, cacheReadTokens: 29000000, cacheWriteTokens: 0, cacheHitRate: 99.6 },
			{ model: "ark/deepseek-v4-flash", tokens: 4333358, inputTokens: 99382, outputTokens: 66824, cacheReadTokens: 5017152, cacheWriteTokens: 0, cacheHitRate: 98.1 }
		]
	},
	translate: (key) => key,
	onBack: () => {}
}));
if (!dayDetail.includes("deepseek-v4-flash")) throw new Error("day detail missing model rows");
if (!dayDetail.includes("deepseek-official · deepseek-v4-flash")) throw new Error("day detail must prefix the provider");
if (!dayDetail.includes("ark · deepseek-v4-flash")) throw new Error("same model from another provider must stay distinct");
if (dayDetail.length < 500) throw new Error("day detail markup too small");
console.log("day detail render ok (provider-prefixed models), markup length:", dayDetail.length);

// Per-request staleness guard must still isolate the usage loader.
const { createLoader } = exports_;
const usageLoader = createLoader();
const usageId = usageLoader.start();
if (!usageLoader.isCurrent(usageId)) throw new Error("fresh usage request must stay current");
usageLoader.start(); // a newer usage refresh supersedes the old one
if (usageLoader.isCurrent(usageId)) throw new Error("a newer usage start must supersede the previous usage request");
console.log("loader staleness guard ok");

// Currency formatting must respect the reported currency, not hardcode ¥.
const { fmtCurrency } = exports_;
const cny = fmtCurrency("36.44", "CNY");
if (!cny.includes("36.44")) throw new Error(`unexpected CNY format: ${cny}`);
if (fmtCurrency(void 0, "CNY") !== "—") throw new Error("missing amount must render em dash");
if (fmtCurrency("9.9", "USD").includes("¥")) throw new Error("USD must not render as ¥");
console.log("currency formatting ok:", cny);

// Two-decimal token formatting: 亿/万 units above 1 万, exact two-decimal
// digits below, and every size carries exactly two decimals.
const { fmtZh, fmt, fmtHit } = exports_;
if (fmtZh(172340000) !== "1.72亿") throw new Error(`unexpected fmtZh: ${fmtZh(172340000)}`);
if (fmtZh(123456789) !== "1.23亿") throw new Error(`unexpected fmtZh: ${fmtZh(123456789)}`);
if (fmtZh(99991230) !== "9999.12万") throw new Error(`unexpected fmtZh: ${fmtZh(99991230)}`);
if (fmtZh(11200) !== "1.12万") throw new Error(`unexpected fmtZh: ${fmtZh(11200)}`);
if (fmtZh(12345678) !== "1234.57万") throw new Error(`unexpected fmtZh: ${fmtZh(12345678)}`);
if (fmtZh(10000) !== "1.00万") throw new Error(`unexpected fmtZh: ${fmtZh(10000)}`);
if (fmtZh(9999) !== "9999.00") throw new Error("values below 1 万 must stay two-decimal exact");
if (fmtZh(1234.5) !== "1234.50") throw new Error("fractional token counts must keep two decimals");
if (fmtZh(0) !== "0.00") throw new Error("zero must render as 0.00");
if (fmt(1234.5) !== "1,234.50") throw new Error(`unexpected fmt: ${fmt(1234.5)}`);
if (fmtHit(61.2) !== "61.20%") throw new Error(`unexpected fmtHit: ${fmtHit(61.2)}`);
if (fmtHit(null) !== "—") throw new Error("missing hit rate must render em dash");
const { badgeValueOf } = exports_;
const demoStats = { dayTokens: 3, monthTokens: 30, total: 300 };
if (badgeValueOf("today", demoStats) !== 3) throw new Error("badgeValueOf(today) must pick the day figure");
if (badgeValueOf("month", demoStats) !== 30) throw new Error("badgeValueOf(month) must pick the month figure");
if (badgeValueOf("total", demoStats) !== 300) throw new Error("badgeValueOf(total) must pick the all-time figure");
if (badgeValueOf("today", null) !== null) throw new Error("badgeValueOf(null stats) must stay null");
// The header badge-mode switcher markup must exist in the panel (it only
// renders when the panel is open, so this is a source-level check).
if (!source.includes('jsx("button", {') || !source.includes('className: `${S.badgeModeButton}${badgeMode === mode')) throw new Error("header must offer the three badge modes");
console.log("two-decimal formatting ok");

// Render the last-7-days bar chart: every bar must be a selectable button, the
// tallest day maps to the deepest bar, and zero-token days still get a stub.
const { WeekBars } = exports_;
const weekDays = [];
const weekNow = new Date();
for (let i = 6; i >= 0; i -= 1) {
	const d = new Date(weekNow.getFullYear(), weekNow.getMonth(), weekNow.getDate() - i);
	const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	weekDays.push({ date: key, tokens: [0, 1000, 100000, 123456789, 42, 9999, 500000][i], cacheHitRate: 90 });
}
const weekMarkup = renderToStaticMarkup(react.createElement(WeekBars, {
	days: weekDays,
	translate: (key) => key,
	selectedKey: null,
	onSelect: () => {}
}));
if ((weekMarkup.match(/usg_weekBar"|usg_weekBar /g) ?? []).length !== 7) throw new Error("week chart must render exactly 7 bars");
if (!weekMarkup.includes("1.23亿")) throw new Error("week chart tooltips must use two-decimal chinese units");
if (!weekMarkup.includes("usg_weekBarFill")) throw new Error("week chart bars missing their fill");
if (!weekMarkup.includes("usg_weekBarLabel")) throw new Error("week chart bars missing their weekday label");
if ((weekMarkup.match(/usg_weekBarValue/g) ?? []).length !== 7) throw new Error("every week bar must show its value label");
if (!weekMarkup.includes("usg_weekBarValue\">1.23亿")) throw new Error("week bar value labels must use two-decimal chinese units");
console.log("week bar chart render ok (value labels on bars), markup length:", weekMarkup.length);

// Render the last-12-months LINE chart: a polyline across twelve points, each
// with a two-decimal value label above it, a 2-digit month label below, and a
// ring around the current month's point. Points stay clickable (drill-down).
const { LineChart } = exports_;
const monthNow = new Date();
const months = [];
for (let i = 11; i >= 0; i -= 1) {
	const d = new Date(monthNow.getFullYear(), monthNow.getMonth() - i, 1);
	const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
	months.push({ month: mk, tokens: i === 0 ? 0 : 123456789 - i * 1000 });
}
const lineMarkup = renderToStaticMarkup(react.createElement(LineChart, { months, translate: (key) => key, onSelect: () => {} }));
if (!lineMarkup.includes("<polyline")) throw new Error("line chart must draw a polyline");
if ((lineMarkup.match(/usg_lineValue/g) ?? []).length !== 12) throw new Error("line chart must label every point's value");
if ((lineMarkup.match(/usg_lineMonth/g) ?? []).length !== 12) throw new Error("line chart must label every month");
if (!lineMarkup.includes("usg_linePointCurrent")) throw new Error("current month point must be ring-highlighted");
if (!/usg_lineValue[^>]*>1\.23亿/.test(lineMarkup)) throw new Error("line point values must use two-decimal chinese units");
const hitCount = (lineMarkup.match(/usg_lineHit/g) ?? []).length;
if (hitCount !== 12) throw new Error(`line chart must keep 12 clickable points, got ${hitCount}`);
console.log("12-month line chart render ok, markup length:", lineMarkup.length);

console.log("SMOKE TEST PASSED");
