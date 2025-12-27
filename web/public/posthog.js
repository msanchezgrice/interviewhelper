(function () {
  var siteId = "ideafeedback.co";
  var siteName = "Idea Feedback";
  var phKey = "phc_7zxvXFwKp6XHbPHKJISxvqGOlNM2BUwQvUpUkvpPCLs";
  var apiHost = "https://app.posthog.com";

  (function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once people.unset people.increment people.append people.remove people.group set_group add_group remove_group register register_once unregister opt_out_capturing opt_in_capturing has_opted_out_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group.identify".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)})(document,window.posthog||[]);

  posthog.init(phKey, {
    api_host: apiHost,
    capture_pageview: true,
    autocapture: true,
    disable_session_recording: true,
  });

  posthog.register({
    site_id: siteId,
    site_name: siteName,
    env: "prod",
  });

  try {
    var params = new URLSearchParams(window.location.search);
    var utm = {};
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(function (k) {
      var v = params.get(k);
      if (v) utm[k] = v;
    });
    if (Object.keys(utm).length) posthog.register(utm);

    if (document.referrer) {
      try {
        posthog.register({
          referrer: document.referrer,
          referrer_host: new URL(document.referrer).host,
        });
      } catch (e) {}
    }

    var visitKey = "ph_seen_" + siteId;
    var returning = !!localStorage.getItem(visitKey);
    posthog.register({ returning_visitor: returning });
    if (returning) posthog.capture("repeat_visit");
    localStorage.setItem(visitKey, "1");

    document.addEventListener("click", function (ev) {
      var el = ev.target.closest("a,button");
      if (!el) return;
      var eventName = el.getAttribute("data-ph-event");
      var text = (el.textContent || "").trim();
      var href = el.getAttribute("href") || "";
      if (eventName) {
        posthog.capture(eventName, { text: text, href: href });
        return;
      }
      var lc = text.toLowerCase();
      var hrefLc = href.toLowerCase();
      if (
        lc.includes("sign up") ||
        lc.includes("signup") ||
        lc.includes("join") ||
        hrefLc.includes("signup") ||
        hrefLc.includes("sign-up") ||
        hrefLc.includes("register")
      ) {
        posthog.capture("signup_click", { text: text, href: href });
      }
    });
  } catch (e) {
    // no-op
  }
})();
