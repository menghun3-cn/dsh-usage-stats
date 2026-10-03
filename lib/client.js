/**
 * dsh-usage-stats — browser half.
 *
 * Hand-written `__ModuleLoader__` bundle (no build step): a floating badge
 * registered on the 0.2.0 `shell.overlay` layout slot (a full-frame absolute
 * layer owned by the root layout slot, parked above the bottom-left user
 * menu) that opens a panel with today / last-7-days / month / all-time token
 * usage and a per-day breakdown. Data comes from the server half's
 * loopback-only endpoints via same-origin fetch.
 */
window.__ModuleLoader__.load({
	id: "dsh-usage-stats",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");

		//#region css
		const css = [
			// Floating badge stack, parked inside the shell.overlay layer: the
			// layer is a full-frame absolute surface, so the component positions
			// itself bottom-left (bottom:60px clears the desktop GUI's
			// bottom-left user-menu cluster) and the panel sits absolutely above
			// the badge. The layer height is locked to the badge (36px): the
			// panel is positioned off its top, so the height must not be driven
			// by content, and the badge is a plain in-flow block (no flex
			// column-reverse for the absolutely positioned panel to disturb).
			".usg_layer{position:absolute;inset:auto auto 60px 12px;height:36px}",
			".usg_badge{height:36px;color:var(--dsw-alias-label-primary);cursor:pointer;background:var(--dsw-specific-menu,var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-base)));border:none;border-radius:999px;align-items:center;gap:8px;padding:0 12px 0 8px;font-family:inherit;font-size:13px;display:inline-flex;box-shadow:var(--dsw-elevation-prominent);box-sizing:border-box;position:relative;z-index:120}",
			".usg_badge:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}",
			".usg_badge[data-active]{background:var(--dsw-alias-interactive-bg-hover)}",
			".usg_badgeLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}",
			".usg_badgeAmount{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;flex:none;font-size:12px;font-weight:600;line-height:16px}",
			".usg_badgeOk{color:var(--dsw-alias-state-success-primary)}",
			".usg_badgeBad{color:var(--dsw-alias-state-error-primary)}",
			".usg_badgeCount{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none;margin-left:auto;font-size:12px;line-height:16px}",
			".usg_panel{z-index:100;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-base));width:440px;max-width:calc(100vw - 24px);max-height:74vh;box-shadow:var(--dsw-shadow-lv2);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);--usg-blue:#1f6feb;border-radius:12px;flex-direction:column;display:flex;position:absolute;bottom:calc(100% + 8px);left:0;overflow:hidden}",
			".usg_header{box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-base));flex:none;justify-content:space-between;align-items:center;min-height:44px;padding:10px 12px;display:flex}",
			".usg_headerLeft{align-items:center;gap:8px;display:flex}",
			".usg_title{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px}",
			".usg_headerActions{align-items:center;gap:2px;display:flex}",
			".usg_iconButton{cursor:pointer;width:26px;height:26px;color:var(--dsw-alias-label-tertiary);background:0 0;border:none;border-radius:6px;justify-content:center;align-items:center;padding:0;display:inline-flex}",
			".usg_iconButton:hover{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}",
			".usg_body{flex:1;min-height:0;padding:4px 14px 14px;overflow-y:auto}",
			".usg_section{margin-top:12px}",
			".usg_sectionTitle{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin:0 0 6px}",
			".usg_note{color:var(--dsw-alias-label-tertiary);margin:4px 0;font-size:12px;line-height:18px}",
			".usg_error{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin:4px 0;padding:7px 8px;font-size:12px;line-height:18px;display:flex}",
			".usg_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0}",
			".usg_balanceCard{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-fill-l1, transparent);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:6px}",
			".usg_balanceMain{align-items:baseline;gap:8px;display:flex}",
			".usg_balanceAmount{color:var(--dsw-alias-label-primary);font-size:24px;font-weight:600;line-height:32px;font-variant-numeric:tabular-nums}",
			".usg_balanceStatus{align-items:center;gap:5px;font-size:12px;line-height:18px;display:inline-flex}",
			".usg_balanceOk{color:var(--dsw-alias-state-success-primary)}",
			".usg_balanceBad{color:var(--dsw-alias-state-error-primary)}",
			".usg_balanceRows{color:var(--dsw-alias-label-secondary);flex-direction:column;gap:2px;font-size:12px;line-height:18px;display:flex}",
			".usg_balanceRow{justify-content:space-between;display:flex}",
			".usg_providerPicker{align-items:center;gap:8px;margin:6px 0 8px;font-size:12px;line-height:18px;display:flex}",
			".usg_providerPickerLabel{color:var(--dsw-alias-label-tertiary);flex:none}",
			".usg_providerSelect{box-sizing:border-box;min-width:0;flex:1;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-base));border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:4px 6px;font:inherit;font-size:12px;line-height:18px}",
			".usg_accountGrid{flex-direction:column;gap:8px;display:flex}",
			".usg_accountCard{--usg-providerAccent:#1f6feb;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:linear-gradient(135deg,color-mix(in srgb,var(--usg-providerAccent) 8%,transparent),transparent 42%);border-radius:12px;padding:10px 11px;display:flex;flex-direction:column;gap:9px}",
			".usg_accountCard[data-provider=deepseek],.usg_accountCard[data-provider=deepseek-official]{--usg-providerAccent:#1f6feb}",
			".usg_accountCard[data-provider=opencode-go]{--usg-providerAccent:#00a67d}",
			".usg_accountCard[data-provider=zai],.usg_accountCard[data-provider=zai-coding-cn]{--usg-providerAccent:#7656e8}",
			".usg_accountCard[data-provider=openrouter]{--usg-providerAccent:#6366f1}",
			".usg_accountCard[data-provider=moonshotai],.usg_accountCard[data-provider=moonshotai-cn],.usg_accountCard[data-provider=kimi],.usg_accountCard[data-provider=kimi-coding]{--usg-providerAccent:#e07a1f}",
			".usg_accountHead{align-items:center;gap:8px;display:flex}",
			".usg_accountMark{width:24px;height:24px;color:#fff;background:var(--usg-providerAccent);border-radius:7px;justify-content:center;align-items:center;font-size:10px;font-weight:700;display:flex;box-shadow:0 4px 12px color-mix(in srgb,var(--usg-providerAccent) 25%,transparent)}",
			".usg_accountIdentity{min-width:0;flex:1;display:flex;flex-direction:column}",
			".usg_accountName{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600;line-height:18px}",
			".usg_accountPlan{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;line-height:14px;overflow:hidden}",
			".usg_accountStatus{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-fill-l2);border-radius:999px;padding:2px 7px;font-size:10px;line-height:16px;white-space:nowrap}",
			".usg_accountStatus[data-status=ok]{color:var(--usg-providerAccent);background:color-mix(in srgb,var(--usg-providerAccent) 12%,transparent)}",
			".usg_quotaList{flex-direction:column;gap:8px;display:flex}",
			".usg_quotaRow{display:flex;flex-direction:column;gap:4px}",
			".usg_quotaMeta{align-items:baseline;gap:8px;display:flex}",
			".usg_quotaLabel{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px}",
			".usg_quotaValue{color:var(--dsw-alias-label-primary);margin-left:auto;font-size:12px;font-weight:600;line-height:16px;font-variant-numeric:tabular-nums}",
			".usg_quotaReset{color:var(--dsw-alias-label-caption);font-size:9px;line-height:14px;white-space:nowrap}",
			".usg_quotaTrack{height:6px;background:var(--dsw-alias-fill-l2);border-radius:999px;overflow:hidden}",
			".usg_quotaFill{height:100%;background:var(--usg-providerAccent);border-radius:inherit;min-width:2px;transition:width .2s ease}",
			".usg_quotaEmpty{color:var(--dsw-alias-label-tertiary);margin:0;font-size:11px;line-height:17px}",
			".usg_statsRow{display:flex;gap:8px}",
			".usg_stat{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;flex:1;flex-direction:column;gap:1px;padding:8px 10px;display:flex}",
			".usg_statValue{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:22px;font-variant-numeric:tabular-nums;white-space:nowrap}",
			".usg_statLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}",
			".usg_hitCaption{color:var(--dsw-alias-label-tertiary);margin-top:6px;font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}",
			".usg_hitCaption b{color:var(--dsw-alias-label-secondary);font-weight:600}",
			".usg_days{flex-direction:column;display:flex}",
			".usg_day{width:100%;min-height:30px;align-items:center;gap:8px;border:0;background:0 0;border-bottom:1px solid var(--dsw-alias-border-l1);padding:5px 0;font:inherit;text-align:left;cursor:pointer;display:flex}",
			".usg_day:last-child{border-bottom:0}",
			".usg_day:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".usg_dayDate{color:var(--dsw-alias-label-secondary);flex:none;width:104px;font-size:12px;line-height:18px;font-variant-numeric:tabular-nums}",
			".usg_dayTokens{color:var(--dsw-alias-label-primary);flex:none;font-size:12px;line-height:18px;font-variant-numeric:tabular-nums}",
			".usg_dayHit{color:var(--dsw-alias-label-tertiary);flex:none;width:52px;font-size:11px;line-height:18px;font-variant-numeric:tabular-nums;text-align:right}",
			".usg_dayBar{background:var(--usg-blue);border-radius:2px;height:6px;flex:1;min-width:4px;opacity:.65}",
			".usg_weekBars{display:flex;gap:4px;align-items:flex-end;padding:2px 0 4px}",
			".usg_weekBar{min-width:0;flex:1;border:0;background:0 0;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;font-family:inherit}",
			".usg_weekBar:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".usg_weekBarTrack{width:100%;height:56px;background:var(--dsw-alias-fill-l2);border-radius:6px;display:flex;align-items:flex-end;overflow:hidden}",
			".usg_weekBarFill{width:100%;background:var(--usg-blue);border-radius:6px 6px 0 0;min-height:2px}",
			".usg_weekBarToday .usg_weekBarTrack{box-shadow:0 0 0 1px var(--usg-blue)}",
			".usg_weekBarSelected .usg_weekBarTrack{box-shadow:0 0 0 2px var(--dsw-alias-label-primary)}",
			".usg_weekBarLabel{color:var(--dsw-alias-label-tertiary);font-size:9px;line-height:14px;font-variant-numeric:tabular-nums}",
			".usg_detailHeader{align-items:center;gap:8px;display:flex}",
			".usg_back{cursor:pointer;width:26px;height:26px;color:var(--dsw-alias-label-secondary);background:0 0;border:none;border-radius:6px;justify-content:center;align-items:center;padding:0;display:inline-flex;flex:none}",
			".usg_back:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}",
			".usg_detailDate{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px}",
			".usg_detailHit{color:var(--dsw-alias-label-tertiary);margin-left:auto;font-size:11px;line-height:20px;font-variant-numeric:tabular-nums}",
			".usg_detailSummary{color:var(--dsw-alias-label-secondary);margin:6px 0 8px;font-size:12px;line-height:18px;font-variant-numeric:tabular-nums}",
			".usg_modelRow{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;margin-bottom:8px;padding:8px 10px;display:flex;flex-direction:column;gap:4px}",
			".usg_modelRow:last-child{margin-bottom:0}",
			".usg_modelHead{align-items:center;gap:8px;display:flex}",
			".usg_modelName{color:var(--dsw-alias-label-primary);min-width:0;text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:12px;font-weight:500;line-height:18px;overflow:hidden}",
			".usg_modelTokens{color:var(--dsw-alias-label-primary);flex:none;font-size:12px;line-height:18px;font-variant-numeric:tabular-nums}",
			".usg_modelHit{color:var(--dsw-alias-label-tertiary);flex:none;width:56px;font-size:11px;line-height:18px;font-variant-numeric:tabular-nums;text-align:right}",
			".usg_modelBarTrack{background:var(--dsw-alias-fill-l2);border-radius:2px;height:5px;overflow:hidden}",
			".usg_modelBar{background:var(--usg-blue);border-radius:2px;height:5px}",
			".usg_modelMeta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}",
			".usg_footerNote{color:var(--dsw-alias-label-caption);margin-top:10px;font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}"
		].join("");
		const tagId = "dsh-usage-stats/UsageStats.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-usage-stats";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		try { window.__usgDiag = { materialized: 1, at: Date.now() }; } catch {}
		//#region inline icons — @deepseek-ai/dsh-client-ui-primitives is NOT a boot-graph row
		// in the desktop GUI (only react/react/jsx-runtime sit in the frozen platform
		// seed table), so requiring it would make factory materialization throw and
		// the whole bundle silently fail to mount. These stroke icons reproduce the
		// outline look with zero static-library dependencies.
		const iconProps = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
		function UsgIconData(props) {
			return react_jsx_runtime.jsx("svg", { width: props.size, height: props.size, viewBox: "0 0 16 16", ...iconProps, children: [
				react_jsx_runtime.jsx("rect", { x: 2.5, y: 7.5, width: 3, height: 6, rx: 0.9 }),
				react_jsx_runtime.jsx("rect", { x: 6.5, y: 3.8, width: 3, height: 9.7, rx: 0.9 }),
				react_jsx_runtime.jsx("rect", { x: 10.5, y: 5.3, width: 3, height: 8.2, rx: 0.9 })
			] });
		}
		function UsgIconRefresh(props) {
			return react_jsx_runtime.jsx("svg", { width: props.size, height: props.size, viewBox: "0 0 16 16", ...iconProps, children: [
				react_jsx_runtime.jsx("path", { d: "M3 7.3a4.9 4.9 0 0 1 8.9-2.5" }),
				react_jsx_runtime.jsx("path", { d: "M13 8.7a4.9 4.9 0 0 1-8.9 2.5" }),
				react_jsx_runtime.jsx("polyline", { points: "11.9,2.6 11.9,4.9 9.6,4.9" }),
				react_jsx_runtime.jsx("polyline", { points: "4.1,13.4 4.1,11.1 6.4,11.1" })
			] });
		}
		function UsgIconClose(props) {
			return react_jsx_runtime.jsx("svg", { width: props.size, height: props.size, viewBox: "0 0 16 16", ...iconProps, children: [
				react_jsx_runtime.jsx("path", { d: "M4 4l8 8M12 4l-8 8" })
			] });
		}
		function UsgIconChevronLeft(props) {
			return react_jsx_runtime.jsx("svg", { width: props.size, height: props.size, viewBox: "0 0 16 16", ...iconProps, children: [
				react_jsx_runtime.jsx("polyline", { points: "9.8,3.4 5.2,8 9.8,12.6" })
			] });
		}
		//#endregion
		const S = {
			layer: "usg_layer",
			badge: "usg_badge",
			badgeLabel: "usg_badgeLabel",
			badgeAmount: "usg_badgeAmount",
			badgeOk: "usg_badgeOk",
			badgeBad: "usg_badgeBad",
			badgeCount: "usg_badgeCount",
			panel: "usg_panel",
			header: "usg_header",
			headerLeft: "usg_headerLeft",
			title: "usg_title",
			headerActions: "usg_headerActions",
			iconButton: "usg_iconButton",
			body: "usg_body",
			section: "usg_section",
			sectionTitle: "usg_sectionTitle",
			note: "usg_note",
			error: "usg_error",
			retry: "usg_retry",
			providerPicker: "usg_providerPicker",
			providerPickerLabel: "usg_providerPickerLabel",
			providerSelect: "usg_providerSelect",
			accountGrid: "usg_accountGrid",
			accountCard: "usg_accountCard",
			accountHead: "usg_accountHead",
			accountMark: "usg_accountMark",
			accountIdentity: "usg_accountIdentity",
			accountName: "usg_accountName",
			accountPlan: "usg_accountPlan",
			accountStatus: "usg_accountStatus",
			quotaList: "usg_quotaList",
			quotaRow: "usg_quotaRow",
			quotaMeta: "usg_quotaMeta",
			quotaLabel: "usg_quotaLabel",
			quotaValue: "usg_quotaValue",
			quotaReset: "usg_quotaReset",
			quotaTrack: "usg_quotaTrack",
			quotaFill: "usg_quotaFill",
			quotaEmpty: "usg_quotaEmpty",
			balanceCard: "usg_balanceCard",
			balanceMain: "usg_balanceMain",
			balanceAmount: "usg_balanceAmount",
			balanceStatus: "usg_balanceStatus",
			balanceOk: "usg_balanceOk",
			balanceBad: "usg_balanceBad",
			balanceRows: "usg_balanceRows",
			balanceRow: "usg_balanceRow",
			statsRow: "usg_statsRow",
			stat: "usg_stat",
			statValue: "usg_statValue",
			statLabel: "usg_statLabel",
			hitCaption: "usg_hitCaption",
			days: "usg_days",
			day: "usg_day",
			dayDate: "usg_dayDate",
			dayTokens: "usg_dayTokens",
			dayHit: "usg_dayHit",
			dayBar: "usg_dayBar",
			weekBars: "usg_weekBars",
			weekBar: "usg_weekBar",
			weekBarTrack: "usg_weekBarTrack",
			weekBarFill: "usg_weekBarFill",
			weekBarToday: "usg_weekBarToday",
			weekBarSelected: "usg_weekBarSelected",
			weekBarLabel: "usg_weekBarLabel",
			detailHeader: "usg_detailHeader",
			back: "usg_back",
			detailDate: "usg_detailDate",
			detailHit: "usg_detailHit",
			detailSummary: "usg_detailSummary",
			modelRow: "usg_modelRow",
			modelHead: "usg_modelHead",
			modelName: "usg_modelName",
			modelTokens: "usg_modelTokens",
			modelHit: "usg_modelHit",
			modelBarTrack: "usg_modelBarTrack",
			modelBar: "usg_modelBar",
			modelMeta: "usg_modelMeta",
			footerNote: "usg_footerNote"
		};
		//#endregion

		//#region helpers
		/** Local `YYYY-MM-DD` for a Date. */
		function dayKeyOf(date) {
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			return `${date.getFullYear()}-${month}-${day}`;
		}

		/** Today's local `YYYY-MM-DD`. */
		function todayKey() {
			return dayKeyOf(new Date());
		}

		/** Thousands-grouped value with exactly two decimals: 1234.5 → "1,234.50". */
		function fmt(n) {
			const value = Number(n) || 0;
			if (!Number.isFinite(value)) return "0.00";
			return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		}

		/**
		 * Chinese-unit form for token counts, always exactly two decimals:
		 * 172340000 → "1.72亿", 11200 → "1.12万", 1234.5 → "1234.50".
		 */
		function fmtZh(n) {
			const value = Number(n) || 0;
			if (!Number.isFinite(value)) return String((0).toFixed(2));
			if (value >= 100000000) return `${(value / 100000000).toFixed(2)}亿`;
			if (value >= 10000) return `${(value / 10000).toFixed(2)}万`;
			return value.toFixed(2);
		}

		/** Hit-rate display: null/undefined → "—", otherwise two decimals ("61.25%"). */
		function fmtHit(hitRate) {
			if (hitRate === null || hitRate === void 0) return "—";
			return `${(Number(hitRate) || 0).toFixed(2)}%`;
		}

		/** Currency-aware amount: `¥ 36.44` / `$ 12.00` (Intl, fallback keeps the raw value). */
		function fmtCurrency(amount, currency) {
			if (amount === void 0 || amount === null) return "—";
			const numeric = Number(amount);
			if (!Number.isFinite(numeric)) return "—";
			try {
				return new Intl.NumberFormat(undefined, { style: "currency", currency: currency ?? "CNY" }).format(numeric);
			} catch {
				return `${currency ?? "CNY"} ${amount}`;
			}
		}

		/**
		 * Per-request staleness guard: each `start()` bumps a private counter and
		 * only the most recent start may `isCurrent()`; stale responses are
		 * dropped after an unmount or a later start.
		 */
		function createLoader() {
			let current = 0;
			return {
				start: () => ++current,
				isCurrent: (id) => id === current
			};
		}


		/** True when a pointer event happened outside both the portaled panel and its sidebar badge. */
		function shouldDismissPanel(path, target, layer, panel) {
			const eventPath = Array.isArray(path) ? path : [];
			const inside = (root) => root !== null && root !== void 0 && (
				eventPath.includes(root)
				|| (target !== null && target !== void 0 && typeof root.contains === "function" && root.contains(target))
			);
			return !inside(layer) && !inside(panel);
		}

		/** Locale-safe template interpolation: `t("key", {a})` replaces `{a}`. */
		function interpolate(template, params) {
			if (params === void 0) return template;
			return template.replace(/\{(\w+)\}/g, (match, key) => (Object.hasOwn(params, key) ? String(params[key]) : match));
		}

		async function fetchJson(path) {
			const response = await fetch(path, { headers: { accept: "application/json" } });
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const payload = await response.json();
			if (payload === null || typeof payload !== "object") throw new Error("unexpected response");
			return payload;
		}

		//#endregion

		//#region UsageStatsPanel
		/**
		 * Shell overlay entry: floating badge + panel stack for token usage.
		 * @param props - `t` bound by the slot runtime from the registered locale.
		 */
		function UsageStatsPanel({ t }) {
			const translate = (key, params) => interpolate(t !== void 0 ? t(key) : key, params);
			const [open, setOpen] = react.useState(false);
			const [usage, setUsage] = react.useState(null);
			const [usageError, setUsageError] = react.useState(null);
			const [selectedDay, setSelectedDay] = react.useState(null);
			const [selectedMonth, setSelectedMonth] = react.useState(null);
			const [refreshedAt, setRefreshedAt] = react.useState(null);
			const mountedRef = react.useRef(true);
			const usageLoaderRef = react.useRef(null);
			const layerRef = react.useRef(null);
			const panelRef = react.useRef(null);
			if (usageLoaderRef.current === null) usageLoaderRef.current = createLoader();

			const loadUsage = react.useCallback(() => {
				const seq = usageLoaderRef.current.start();
				setUsageError(null);
				fetchJson("/api/usage-stats/usage").then((payload) => {
					if (!mountedRef.current || !usageLoaderRef.current.isCurrent(seq)) return;
					if (payload.ok !== true) {
						setUsageError(payload.message ?? "usage aggregation failed");
						return;
					}
					setUsage(payload);
					setRefreshedAt(Date.now());
				}).catch((error) => {
					if (!mountedRef.current || !usageLoaderRef.current.isCurrent(seq)) return;
					setUsageError(error instanceof Error ? error.message : String(error));
				});
			}, []);

			react.useEffect(() => {
				mountedRef.current = true;
				return () => {
					mountedRef.current = false;
				};
			}, []);

			// Utility-popover dismissal: the panel lives inside the overlay layer
			// (a sibling of the badge in the same flex column), so the layer and
			// panel refs together define the "inside" region for outside clicks.
			react.useEffect(() => {
				if (!open) return void 0;
				const onPointerDown = (event) => {
					const path = typeof event.composedPath === "function" ? event.composedPath() : [];
					if (shouldDismissPanel(path, event.target, layerRef.current, panelRef.current)) setOpen(false);
				};
				const onKeyDown = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				document.addEventListener("pointerdown", onPointerDown, true);
				document.addEventListener("keydown", onKeyDown, true);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown, true);
					document.removeEventListener("keydown", onKeyDown, true);
				};
			}, [open]);

			react.useEffect(() => {
				if (!open) return;
				loadUsage();
				const usageTimer = window.setInterval(loadUsage, 60000);
				return () => {
					window.clearInterval(usageTimer);
				};
			}, [open, loadUsage]);

			const dayMap = react.useMemo(() => {
				const map = new Map();
				if (usage !== null && Array.isArray(usage.days)) {
					for (const day of usage.days) map.set(day.date, day);
				}
				return map;
			}, [usage]);

			// Drop a stale selection when refreshed data no longer has that day.
			react.useEffect(() => {
				if (selectedDay !== null && !dayMap.has(selectedDay)) setSelectedDay(null);
			}, [dayMap, selectedDay]);

			const stats = react.useMemo(() => {
				if (usage === null || !Array.isArray(usage.days)) return null;
				const today = todayKey();
				const month = today.slice(0, 7);
				let dayTokens = 0;
				let monthTokens = 0;
				let total = usage.total?.tokens ?? 0;
				let overall = 0;
				for (const day of usage.days) {
					if (day.date === today) dayTokens = day.tokens ?? 0;
					if (day.date.startsWith(month)) monthTokens += day.tokens ?? 0;
					overall += day.tokens ?? 0;
				}
				return { dayTokens, monthTokens, total: total || overall };
			}, [usage]);

			// Last 7 CALENDAR days (today included): zero-token days are kept so
			// the bar chart always spans a full week and the weekly total is exact.
			const week7 = react.useMemo(() => {
				const days = [];
				for (let i = 6; i >= 0; i -= 1) {
					const d = new Date();
					d.setDate(d.getDate() - i);
					const key = dayKeyOf(d);
					days.push(dayMap.get(key) ?? { date: key, tokens: 0, cacheHitRate: null });
				}
				return days;
			}, [dayMap]);

			const week7Tokens = week7.reduce((sum, day) => sum + (day.tokens ?? 0), 0);

			// Last 12 CALENDAR months (current month included): aggregated from
			// the per-day rows so the chart always spans a full year; months
			// without recorded usage stay zero.
			const months12 = react.useMemo(() => {
				if (usage === null || !Array.isArray(usage.days)) return [];
				const now = new Date();
				const list = [];
				for (let i = 11; i >= 0; i -= 1) {
					const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
					const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
					let tokens = 0;
					for (const day of usage.days) {
						if (day.date.startsWith(mk)) tokens += day.tokens ?? 0;
					}
					list.push({ month: mk, tokens });
				}
				return list;
			}, [usage]);

			const months12Tokens = months12.reduce((sum, m) => sum + (m.tokens ?? 0), 0);

			// Days of the selected month (descending): the drill-down list.
			const monthDays = react.useMemo(() => {
				if (usage === null || !Array.isArray(usage.days) || selectedMonth === null) return [];
				return usage.days
					.filter((day) => day.date.startsWith(selectedMonth))
					.sort((a, b) => a.date < b.date ? 1 : -1);
			}, [usage, selectedMonth]);

			const monthTotal = monthDays.reduce((sum, day) => sum + (day.tokens ?? 0), 0);

			const selectedEntry = selectedDay !== null ? dayMap.get(selectedDay) ?? null : null;
			const badgeCount = stats !== null ? fmtZh(stats.dayTokens) : null;
			const badgeLabel = translate("panel.badge");

			const retry = () => {
				loadUsage();
			};

			const updatedLabel = refreshedAt === null ? "" : translate("panel.updatedAt", {
				time: new Date(refreshedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
			});

			return react_jsx_runtime.jsxs("div", {
				ref: layerRef,
				className: S.layer,
				"data-usage-stats-layer": true,
				"data-open": open || void 0,
				children: [
					open ? react_jsx_runtime.jsx("section", {
						ref: panelRef,
						className: S.panel,
						"data-usage-stats-panel": true,
						"aria-label": translate("panel.title"),
						children: react_jsx_runtime.jsx(PanelBoundary, {
							children: [
							react_jsx_runtime.jsxs("header", {
								className: S.header,
								children: [
									react_jsx_runtime.jsxs("div", {
										className: S.headerLeft,
										children: [
											react_jsx_runtime.jsx(UsgIconData, { size: 16 }),
											react_jsx_runtime.jsx("span", { className: S.title, children: translate("panel.title") })
										]
									}),
									react_jsx_runtime.jsxs("div", {
										className: S.headerActions,
										children: [
											react_jsx_runtime.jsx("button", {
												type: "button",
												className: S.iconButton,
												"aria-label": translate("action.refresh"),
												title: translate("action.refresh"),
												onClick: retry,
												children: react_jsx_runtime.jsx(UsgIconRefresh, { size: 14 })
											}),
											react_jsx_runtime.jsx("button", {
												type: "button",
												className: S.iconButton,
												"aria-label": translate("action.close"),
												title: translate("action.close"),
												onClick: () => setOpen(false),
												children: react_jsx_runtime.jsx(UsgIconClose, { size: 14 })
											})
										]
									})
								]
							}),
							react_jsx_runtime.jsxs("div", {
								className: S.body,
								children: [
									selectedEntry !== null ? react_jsx_runtime.jsx(DayDetail, {
										day: selectedEntry,
										translate,
										onBack: () => setSelectedDay(null)
									}) : selectedMonth !== null ? react_jsx_runtime.jsxs(react_jsx_runtime.Fragment, {
										children: [
											react_jsx_runtime.jsxs("div", {
												className: S.detailHeader,
												children: [
													react_jsx_runtime.jsx("button", {
														type: "button",
														className: S.back,
														"aria-label": translate("usage.back"),
														onClick: () => setSelectedMonth(null),
														children: react_jsx_runtime.jsx(UsgIconChevronLeft, { size: 14 })
													}),
													react_jsx_runtime.jsx("span", { className: S.detailDate, children: selectedMonth }),
													react_jsx_runtime.jsx("span", { className: S.detailHit, children: `${translate("usage.total")}: ${fmtZh(monthTotal)}` })
												]
											}),
											monthDays.length === 0 ? react_jsx_runtime.jsx("p", { className: S.note, children: translate("usage.noData") }) : react_jsx_runtime.jsxs("div", {
												className: S.days,
												children: monthDays.map((day) => {
													const maxDay = Math.max(...monthDays.map((d) => d.tokens ?? 0), 1);
													return react_jsx_runtime.jsxs("button", {
														type: "button",
														className: S.day,
														onClick: () => setSelectedDay(day.date),
														children: [
															react_jsx_runtime.jsx("span", { className: S.dayDate, children: dayLabel(day.date, translate) }),
															react_jsx_runtime.jsx("span", { className: S.dayTokens, children: fmtZh(day.tokens ?? 0) }),
															react_jsx_runtime.jsx("div", {
																className: S.dayBar,
																style: { width: `${Math.max(4, Math.round(100 * (day.tokens ?? 0) / maxDay))}%` }
															})
														]
													}, day.date);
												})
											})
										]
									}) : react_jsx_runtime.jsxs(react_jsx_runtime.Fragment, {
										children: [
											react_jsx_runtime.jsx("section", {
												className: S.section,
												children: react_jsx_runtime.jsx("h3", { className: S.sectionTitle, children: translate("usage.title") })
											}),
											stats === null && usageError === null ? react_jsx_runtime.jsx("p", { className: S.note, children: translate("usage.loading") }) : null,
											usageError !== null ? react_jsx_runtime.jsxs("div", {
												className: S.error,
												children: [
													react_jsx_runtime.jsx("span", { children: translate("usage.error", { message: usageError }) }),
													react_jsx_runtime.jsx("button", {
														type: "button",
														className: S.retry,
														onClick: loadUsage,
														children: translate("action.retry")
													})
												]
											}) : null,
											stats !== null && react_jsx_runtime.jsxs("div", {
												className: S.statsRow,
												children: [
													react_jsx_runtime.jsx("div", { className: S.stat, children: [react_jsx_runtime.jsx("span", { className: S.statValue, children: fmtZh(stats.dayTokens) }), react_jsx_runtime.jsx("span", { className: S.statLabel, children: translate("usage.today") })] }),
													react_jsx_runtime.jsx("div", { className: S.stat, children: [react_jsx_runtime.jsx("span", { className: S.statValue, children: fmtZh(stats.monthTokens) }), react_jsx_runtime.jsx("span", { className: S.statLabel, children: translate("usage.month") })] }),
													react_jsx_runtime.jsx("div", { className: S.stat, children: [react_jsx_runtime.jsx("span", { className: S.statValue, children: fmtZh(stats.total) }), react_jsx_runtime.jsx("span", { className: S.statLabel, children: translate("usage.total") })] })
												]
											}),
											usage !== null && usageError === null && react_jsx_runtime.jsxs("section", {
												className: S.section,
												children: [
													react_jsx_runtime.jsx("h3", { className: S.sectionTitle, children: `${translate("usage.week")} · ${translate("usage.total")} ${fmtZh(week7Tokens)}` }),
													react_jsx_runtime.jsx(WeekBars, {
														days: week7,
														translate,
														selectedKey: selectedDay,
														onSelect: setSelectedDay
													})
												]
											}),
											usage !== null && usageError === null && react_jsx_runtime.jsxs("section", {
												className: S.section,
												children: [
													react_jsx_runtime.jsx("h3", { className: S.sectionTitle, children: `${translate("usage.months")} · ${translate("usage.total")} ${fmtZh(months12Tokens)}` }),
													react_jsx_runtime.jsx("div", {
														className: S.days,
														children: months12.slice().reverse().map((m) => {
															const maxMonth = Math.max(...months12.map((x) => x.tokens), 1);
															return react_jsx_runtime.jsxs("button", {
																type: "button",
																className: S.day,
																onClick: () => setSelectedMonth(m.month),
																children: [
																	react_jsx_runtime.jsx("span", { className: S.dayDate, children: m.month }),
																	react_jsx_runtime.jsx("span", { className: S.dayTokens, children: fmtZh(m.tokens) }),
																	react_jsx_runtime.jsx("div", {
																		className: S.dayBar,
																		style: { width: `${Math.max(4, Math.round(100 * (m.tokens ?? 0) / maxMonth))}%` }
																	})
																]
															}, m.month);
														})
													})
												]
											}),
											updatedLabel !== "" && react_jsx_runtime.jsx("p", { className: S.footerNote, children: updatedLabel })
										]
									})
								]
							})
							]
						})
					}) : null,
					react_jsx_runtime.jsxs("button", {
						type: "button",
						className: S.badge,
						"data-usage-stats-badge": true,
						"aria-label": badgeCount !== null ? `${translate("panel.badge")} ${badgeCount}` : translate("panel.badge"),
						"aria-expanded": open,
						onClick: () => setOpen((value) => !value),
						children: [
							react_jsx_runtime.jsx(UsgIconData, { size: 14 }),
							react_jsx_runtime.jsx("span", { className: S.badgeLabel, children: badgeLabel }),
							badgeCount !== null && react_jsx_runtime.jsx("span", { className: S.badgeCount, children: badgeCount })
						]
					})
				]
			});
		}
		/**
		 * One day's per-model breakdown. `day` is the wire day entry carrying
		 * `tokens`, `cacheHitRate`, and `models` (descending by tokens).
		 */
		function DayDetail({ day, translate, onBack }) {
			const models = Array.isArray(day.models) ? day.models : [];
			const totalTokens = day.tokens ?? 0;
			return react_jsx_runtime.jsxs(react_jsx_runtime.Fragment, {
				children: [
					react_jsx_runtime.jsxs("div", {
						className: S.detailHeader,
						children: [
							react_jsx_runtime.jsx("button", {
								type: "button",
								className: S.back,
								"aria-label": translate("usage.back"),
								onClick: onBack,
								children: react_jsx_runtime.jsx(UsgIconChevronLeft, { size: 14 })
							}),
							react_jsx_runtime.jsx("span", { className: S.detailDate, children: dayLabel(day.date, translate) }),
							react_jsx_runtime.jsx("span", { className: S.detailHit, children: `${translate("usage.hitRate")} ${fmtHit(day.cacheHitRate)}` })
						]
					}),
					react_jsx_runtime.jsx("p", {
						className: S.detailSummary,
						children: `${translate("usage.total")} ${fmtZh(totalTokens)} · ${translate("usage.input")} ${fmtZh(day.inputTokens ?? 0)} · ${translate("usage.output")} ${fmtZh(day.outputTokens ?? 0)} · ${translate("usage.cacheRead")} ${fmtZh(day.cacheReadTokens ?? 0)}`
					}),
					react_jsx_runtime.jsx("div", {
						className: S.days,
						children: models.length === 0 ? react_jsx_runtime.jsx("p", { className: S.note, children: translate("usage.noModels") }) : models.map((model) => {
							const share = totalTokens > 0 ? Math.max(3, Math.round(100 * (model.tokens ?? 0) / totalTokens)) : 0;
							return react_jsx_runtime.jsxs("div", {
								className: S.modelRow,
								children: [
									react_jsx_runtime.jsxs("div", {
										className: S.modelHead,
										children: [
											react_jsx_runtime.jsx("span", { className: S.modelName, title: model.model, children: modelLabelOf(model.model, translate) }),
											react_jsx_runtime.jsx("span", { className: S.modelTokens, children: fmtZh(model.tokens ?? 0) }),
											react_jsx_runtime.jsx("span", { className: S.modelHit, children: fmtHit(model.cacheHitRate) })
										]
									}),
									react_jsx_runtime.jsx("div", {
										className: S.modelBarTrack,
										children: react_jsx_runtime.jsx("div", { className: S.modelBar, style: { width: `${share}%` } })
									}),
									react_jsx_runtime.jsx("div", {
										className: S.modelMeta,
										children: `${translate("usage.input")} ${fmtZh(model.inputTokens ?? 0)} · ${translate("usage.output")} ${fmtZh(model.outputTokens ?? 0)} · ${translate("usage.cacheRead")} ${fmtZh(model.cacheReadTokens ?? 0)}`
									})
								]
							}, model.model);
						})
					})
				]
			});
		}

		/** `YYYY-MM-DD` → `MM-DD 周X` display label. */
		function dayLabel(key, translate) {
			const [, month, day] = key.split("-");
			const date = new Date(Number(key.slice(0, 4)), Number(month) - 1, Number(day));
			const weekdays = [translate("weekday.sun"), translate("weekday.mon"), translate("weekday.tue"), translate("weekday.wed"), translate("weekday.thu"), translate("weekday.fri"), translate("weekday.sat")];
			return `${month}-${day} ${weekdays[date.getDay()]}`;
		}

		/**
		 * Compact date label for the 7-day bar chart: `YYYY-MM-DD` → `MM-DD`
		 * (e.g. "08-14") so bars show the actual date instead of the weekday.
		 */
		function weekDate(key) {
			return key.slice(5);
		}

		/**
		 * Last-7-days usage bar chart. Each bar is a button that selects that
		 * day (same drill-down as the recent list); zero-token days get a stub
		 * bar so the week always spans seven slots.
		 */
		function WeekBars({ days, translate, selectedKey, onSelect }) {
			const select = typeof onSelect === "function" ? onSelect : () => {};
			const text = typeof translate === "function" ? translate : (key) => key;
			const max = Math.max(...days.map((d) => d.tokens ?? 0), 1);
			return react_jsx_runtime.jsx("div", {
				className: S.weekBars,
				role: "img",
				"aria-label": text("usage.week"),
				children: days.map((day) => {
					const tokens = day.tokens ?? 0;
					const height = tokens > 0 ? Math.max(6, Math.round(100 * tokens / max)) : 2;
					const isToday = day.date === todayKey();
					return react_jsx_runtime.jsxs("button", {
						type: "button",
						className: `${S.weekBar}${isToday ? ` ${S.weekBarToday}` : ""}${selectedKey === day.date ? ` ${S.weekBarSelected}` : ""}`,
						title: `${day.date} ${fmtZh(tokens)} tokens`,
						"aria-label": `${day.date} ${fmtZh(tokens)} tokens`,
						onClick: () => select(day.date),
						children: [
							react_jsx_runtime.jsx("span", { className: S.weekBarTrack, children: react_jsx_runtime.jsx("span", { className: S.weekBarFill, style: { height: `${height}%` } }) }),
							react_jsx_runtime.jsx("span", { className: S.weekBarLabel, children: weekDate(day.date) })
						]
					}, day.date);
				})
			});
		}

		/**
		 * Render-phase error boundary. A crash inside the open panel's
		 * data-driven view must never unmount the overlay subtree — the
		 * floating badge lives outside this boundary, so it always stays
		 * visible and clickable. The panel content degrades to an inline
		 * error instead.
		 */
		class PanelBoundary extends react.Component {
			constructor(props) {
				super(props);
				this.state = { error: null };
			}
			static getDerivedStateFromError(error) {
				return { error };
			}
			render() {
				if (this.state.error !== null) {
					const message = this.state.error && typeof this.state.error.message === "string" ? this.state.error.message : String(this.state.error);
					return react_jsx_runtime.jsx("p", { className: S.error, children: message });
				}
				return this.props.children;
			}
		}

		/**
		 * Display label for a `provider/model` attribution key (the same model
		 * served by different providers must stay distinguishable).
		 */
		function modelLabelOf(key, translate) {
			if (typeof key !== "string") return "";
			const slash = key.indexOf("/");
			if (slash === -1) return key;
			const provider = key.slice(0, slash);
			const model = key.slice(slash + 1);
			const providerLabel = provider === "unknown" ? translate("usage.unknownModel") : provider;
			const modelLabel = model === "unknown" || model === "" ? translate("usage.unknownModel") : model;
			return `${providerLabel} · ${modelLabel}`;
		}
		//#endregion

		//#region locales
		/** `usageStats` namespace dictionaries (the zh key set is the source of truth). */
		const NS = "usageStats";
		const zh = {
			"panel.title": "Token 用量",
			"panel.badge": "用量",
			"account.title": "供应商账户",
			"account.provider": "当前供应商",
			"account.balanceMode": "API 余额",
			"account.loading": "正在加载供应商…",
			"account.status.loading": "查询中",
			"account.status.blocked": "已阻止",
			"account.status.unsupported": "不支持余额",
			"account.status.invalidResponse": "响应异常",
			"account.invalidResponse": "供应商返回了无法识别的额度数据。",
			"account.reason.dnsResolutionFailed": "无法解析供应商域名。",
			"account.reason.allAddressesUnreachable": "已验证的网络地址均无法连接。",
			"account.reason.upstreamNotJson": "上游返回的不是 JSON",
			"account.reason.upstreamInvalidJson": "上游返回了无法解析的 JSON",
			"account.reason.sub2apiBalanceShapeUnrecognized": "Sub2API 余额接口返回了未识别的数据结构。",
			"account.blocked": "账户查询被本地安全策略阻止，请检查 HTTPS、同源和私网访问设置。",
			"balance.title": "账户余额",
			"balance.provider": "供应商",
			"balance.noSchemeTag": "无余额接口",
			"balance.unsupported": "该供应商没有公开的余额查询接口。",
			"balance.total": "总余额",
			"balance.remaining": "可用余额",
			"balance.used": "已使用",
			"balance.toppedUp": "充值余额",
			"balance.granted": "赠送余额",
			"balance.available": "可用",
			"balance.unavailable": "不可用",
			"balance.loading": "正在查询余额…",
			"balance.noCredential": "未配置 {ref}（请编辑 ~/.dsh/.credentials.yaml）",
			"balance.error": "余额获取失败：{message}",
			"subscription.title": "订阅额度",
			"subscription.loading": "正在查询订阅额度…",
			"subscription.error": "订阅额度获取失败：{message}",
			"subscription.status.ok": "实时",
			"subscription.status.notConfigured": "未配置",
			"subscription.status.unauthorized": "需重新登录",
			"subscription.status.rateLimited": "请求受限",
			"subscription.status.unavailable": "暂不可用",
			"subscription.window.session": "5 小时窗口",
			"subscription.window.daily": "每日窗口",
			"subscription.window.weekly": "每周窗口",
			"subscription.window.monthly": "每月窗口",
			"subscription.window.quota": "总额度",
			"subscription.window.mcp": "MCP 月度额度",
			"subscription.used": "已用 {value}%",
			"subscription.resets": "{time} 重置",
			"subscription.notConfigured": "配置 {refs} 后显示真实订阅比例。",
			"subscription.unauthorized": "凭据已失效，请更新后重试。",
			"subscription.rateLimited": "供应商暂时限制查询，请稍后重试。",
			"subscription.unavailable": "供应商没有返回可识别的额度窗口。",
			"subscription.planUnknown": "订阅计划",
			"usage.title": "Token 用量",
			"usage.today": "今日",
			"usage.month": "本月",
			"usage.total": "累计",
			"usage.loading": "正在统计用量…",
			"usage.error": "用量统计失败：{message}",
			"usage.week": "最近 7 天",
			"usage.months": "最近 12 个月",
			"usage.noData": "该月暂无记录。",
			"usage.back": "返回",
			"usage.hitRate": "缓存命中",
			"usage.hit.today": "今日缓存命中率",
			"usage.input": "输入",
			"usage.output": "输出",
			"usage.cacheRead": "缓存读",
			"usage.unknownModel": "未知模型",
			"usage.noModels": "这一天没有分模型数据。",
			"action.refresh": "刷新",
			"action.retry": "重试",
			"action.close": "关闭",
			"panel.updatedAt": "更新于 {time}",
			"weekday.mon": "一",
			"weekday.tue": "二",
			"weekday.wed": "三",
			"weekday.thu": "四",
			"weekday.fri": "五",
			"weekday.sat": "六",
			"weekday.sun": "日"
		};
		const en = {
			"panel.title": "Token usage",
			"panel.badge": "Usage",
			"account.title": "Provider account",
			"account.provider": "Current provider",
			"account.balanceMode": "API balance",
			"account.loading": "Loading providers…",
			"account.status.loading": "Loading",
			"account.status.blocked": "Blocked",
			"account.status.unsupported": "Balance unsupported",
			"account.status.invalidResponse": "Invalid response",
			"account.invalidResponse": "The provider returned unrecognized quota data.",
			"account.reason.dnsResolutionFailed": "The provider hostname could not be resolved.",
			"account.reason.allAddressesUnreachable": "None of the validated network addresses could be reached.",
			"account.reason.upstreamNotJson": "The upstream response was not JSON",
			"account.reason.upstreamInvalidJson": "The upstream returned unparsable JSON",
			"account.reason.sub2apiBalanceShapeUnrecognized": "The Sub2API balance endpoint returned an unrecognized data shape.",
			"account.blocked": "The account query was blocked by the local security policy. Check HTTPS, same-origin, and private-network settings.",
			"balance.title": "Account balance",
			"balance.provider": "Provider",
			"balance.noSchemeTag": "no balance API",
			"balance.unsupported": "This provider has no public balance interface.",
			"balance.total": "Total balance",
			"balance.remaining": "Available balance",
			"balance.used": "Used",
			"balance.toppedUp": "Topped up",
			"balance.granted": "Granted",
			"balance.available": "available",
			"balance.unavailable": "unavailable",
			"balance.loading": "Fetching balance…",
			"balance.noCredential": "{ref} is not configured (edit ~/.dsh/.credentials.yaml)",
			"balance.error": "Balance fetch failed: {message}",
			"subscription.title": "Subscription usage",
			"subscription.loading": "Fetching subscription usage…",
			"subscription.error": "Subscription usage failed: {message}",
			"subscription.status.ok": "Live",
			"subscription.status.notConfigured": "Not configured",
			"subscription.status.unauthorized": "Sign in again",
			"subscription.status.rateLimited": "Rate limited",
			"subscription.status.unavailable": "Unavailable",
			"subscription.window.session": "5-hour window",
			"subscription.window.daily": "Daily window",
			"subscription.window.weekly": "Weekly window",
			"subscription.window.monthly": "Monthly window",
			"subscription.window.quota": "Total quota",
			"subscription.window.mcp": "Monthly MCP quota",
			"subscription.used": "{value}% used",
			"subscription.resets": "Resets {time}",
			"subscription.notConfigured": "Configure {refs} to show live subscription usage.",
			"subscription.unauthorized": "The credential has expired; update it and retry.",
			"subscription.rateLimited": "The provider is rate limiting checks; retry later.",
			"subscription.unavailable": "The provider returned no recognizable quota windows.",
			"subscription.planUnknown": "Subscription plan",
			"usage.title": "Token usage",
			"usage.today": "Today",
			"usage.month": "This month",
			"usage.total": "All time",
			"usage.loading": "Aggregating usage…",
			"usage.error": "Usage aggregation failed: {message}",
			"usage.week": "Last 7 days",
			"usage.months": "Last 12 months",
			"usage.noData": "No usage recorded for this month.",
			"usage.back": "Back",
			"usage.hitRate": "Cache hit",
			"usage.hit.today": "Today's cache hit rate",
			"usage.input": "Input",
			"usage.output": "Output",
			"usage.cacheRead": "Cache read",
			"usage.unknownModel": "Unknown model",
			"usage.noModels": "No per-model data for this day.",
			"action.refresh": "Refresh",
			"action.retry": "Retry",
			"action.close": "Close",
			"panel.updatedAt": "Updated at {time}",
			"weekday.mon": "M",
			"weekday.tue": "T",
			"weekday.wed": "W",
			"weekday.thu": "T",
			"weekday.fri": "F",
			"weekday.sat": "S",
			"weekday.sun": "S"
		};
		//#endregion

		//#region plugin body
		/** Services required by the client plugin body. */
		const inject = ["slots", "locale"];

		/**
		 * Client plugin body: register the dictionaries and the shell overlay
		 * entry. `shell.overlay` is a full-frame absolute layer declared by the
		 * root layout slot, so the floating badge/panel stack renders above the
		 * frame without any hook into the sidebar shell.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			const diag = (step, detail) => {
				try {
					const tag = window.__usgDiag ?? (window.__usgDiag = {});
					tag[step] = detail ?? true;
					console.log("[usg] apply", step, detail ?? "");
				} catch {}
			};
			diag("start");
			try {
				ctx.effect(() => ctx.locale.register(NS, { zh, en }), "usage-stats: dictionaries");
				diag("locale-ok");
				ctx.slots.inject("shell.overlay", () => {
					diag("inject-factory");
					const dispose = ctx.slots.register({
						name: "shell.overlay",
						id: "usage-stats",
						locale: NS,
						order: 10,
						inject: () => ({})
					}, UsageStatsPanel);
					diag("registered");
					return dispose;
				});
				diag("inject-ok");
			} catch (error) {
				diag("error", String(error && error.stack || error));
			}
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.UsageStatsPanel = UsageStatsPanel;
		exports.DayDetail = DayDetail;
		exports.WeekBars = WeekBars;
		exports.createLoader = createLoader;
		exports.modelLabelOf = modelLabelOf;
		exports.fmt = fmt;
		exports.fmtZh = fmtZh;
		exports.fmtHit = fmtHit;
		exports.fmtCurrency = fmtCurrency;
		exports.shouldDismissPanel = shouldDismissPanel;
		exports.interpolate = interpolate;
		return module.exports;
	}
});
